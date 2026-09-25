'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Trash2, 
  RotateCw, 
  Sparkles, 
  Eye, 
  Check, 
  Layers 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateDefaultPolygonPoints } from '@/lib/gisUtils';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  acreage: number;
  polygonColor?: string; // Hex color (e.g. '#10b981') or color name
  pointsCount?: number;
  customPolygon?: [number, number][]; // [[lat, lng], ...]
  customColorMap?: Record<string, string>;
  onChange: (lat: number, lng: number) => void;
  onPolygonChange?: (polygonPoints: [number, number][]) => void;
  className?: string;
}

const PRESET_COLOR_MAP: Record<string, string> = {
  GREEN: '#10b981',
  YELLOW: '#f59e0b',
  RED: '#ef4444',
  BLUE: '#3b82f6',
  PURPLE: '#8b5cf6',
  CYAN: '#06b6d4',
};

export default function LocationPickerMap({
  lat,
  lng,
  acreage,
  polygonColor = '#10b981',
  pointsCount = 4,
  customPolygon,
  customColorMap,
  onChange,
  onPolygonChange,
  className,
}: LocationPickerMapProps) {
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const vertexMarkersRef = useRef<L.Marker[]>([]);
  const edgeMarkersRef = useRef<L.Marker[]>([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeVertexMenu, setActiveVertexMenu] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  const currentBoundsRef = useRef<[number, number][]>([]);

  // Resolve color hex
  const activeColorMap = customColorMap || PRESET_COLOR_MAP;
  const colorHex = polygonColor.startsWith('#')
    ? polygonColor
    : activeColorMap[polygonColor] || '#10b981';

  // Helper to re-render vertex & edge midpoint markers
  const refreshVertexMarkers = (bounds: [number, number][], map: L.Map) => {
    vertexMarkersRef.current.forEach((m) => m.remove());
    vertexMarkersRef.current = [];
    edgeMarkersRef.current.forEach((m) => m.remove());
    edgeMarkersRef.current = [];

    const activePoints = [...bounds];

    // 1. Draggable Corner Vertices
    bounds.forEach((pt, idx) => {
      const vertexIcon = L.divIcon({
        className: 'vertex-drag-handle',
        html: `
          <div style="width: 18px; height: 18px; background: #ffffff; border: 3.5px solid ${colorHex}; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.8); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.15s ease;">
            <div style="width: 4px; height: 4px; background: ${colorHex}; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const vertexMarker = L.marker([pt[0], pt[1]], {
        icon: vertexIcon,
        draggable: true,
        zIndexOffset: 600,
      }).addTo(map);

      // Dragging vertex
      vertexMarker.on('drag', (e) => {
        const newPos = e.target.getLatLng();
        activePoints[idx] = [
          parseFloat(newPos.lat.toFixed(5)),
          parseFloat(newPos.lng.toFixed(5)),
        ];
        if (polygonRef.current) {
          polygonRef.current.setLatLngs(activePoints);
        }
      });

      vertexMarker.on('dragend', () => {
        currentBoundsRef.current = activePoints;
        if (onPolygonChange) {
          onPolygonChange(activePoints);
        }
        const newCenterLat = parseFloat(
          (activePoints.reduce((s, p) => s + p[0], 0) / activePoints.length).toFixed(4)
        );
        const newCenterLng = parseFloat(
          (activePoints.reduce((s, p) => s + p[1], 0) / activePoints.length).toFixed(4)
        );
        onChange(newCenterLat, newCenterLng);
        refreshVertexMarkers(activePoints, map);
      });

      // Click or contextmenu to open Delete Vertex Menu
      vertexMarker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        const containerPt = map.latLngToContainerPoint(e.latlng);
        setActiveVertexMenu({
          index: idx,
          x: containerPt.x,
          y: containerPt.y,
        });
      });

      vertexMarker.on('contextmenu', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        const containerPt = map.latLngToContainerPoint(e.latlng);
        setActiveVertexMenu({
          index: idx,
          x: containerPt.x,
          y: containerPt.y,
        });
      });

      vertexMarkersRef.current.push(vertexMarker);
    });

    // 2. Midpoint markers on each edge (to click and add new vertex)
    if (bounds.length >= 3) {
      for (let i = 0; i < bounds.length; i++) {
        const p1 = bounds[i];
        const p2 = bounds[(i + 1) % bounds.length];
        const midLat = (p1[0] + p2[0]) / 2;
        const midLng = (p1[1] + p2[1]) / 2;

        const midIcon = L.divIcon({
          className: 'midpoint-add-handle',
          html: `
            <div style="width: 12px; height: 12px; background: ${colorHex}cc; border: 2px solid #ffffff; border-radius: 50%; cursor: copy; box-shadow: 0 2px 6px rgba(0,0,0,0.6);" title="Click to add vertex"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const midMarker = L.marker([midLat, midLng], {
          icon: midIcon,
          zIndexOffset: 400,
        }).addTo(map);

        midMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          const newPt: [number, number] = [
            parseFloat(midLat.toFixed(5)),
            parseFloat(midLng.toFixed(5)),
          ];
          const newBounds = [...bounds];
          newBounds.splice(i + 1, 0, newPt);
          currentBoundsRef.current = newBounds;

          if (polygonRef.current) {
            polygonRef.current.setLatLngs(newBounds);
          }
          if (onPolygonChange) {
            onPolygonChange(newBounds);
          }
          refreshVertexMarkers(newBounds, map);
        });

        edgeMarkersRef.current.push(midMarker);
      }
    }
  };

  // Delete Vertex Handler
  const handleDeleteVertex = (idx: number) => {
    if (currentBoundsRef.current.length <= 3) {
      alert('A polygon boundary must contain at least 3 vertex points.');
      setActiveVertexMenu(null);
      return;
    }
    const updated = currentBoundsRef.current.filter((_, i) => i !== idx);
    currentBoundsRef.current = updated;

    if (polygonRef.current) {
      polygonRef.current.setLatLngs(updated);
    }
    if (onPolygonChange) {
      onPolygonChange(updated);
    }
    if (mapInstanceRef.current) {
      refreshVertexMarkers(updated, mapInstanceRef.current);
    }
    setActiveVertexMenu(null);
  };

  // Invert Vertex Sequence
  const handleInvertPolygon = () => {
    const inverted = [...currentBoundsRef.current].reverse();
    currentBoundsRef.current = inverted;
    if (polygonRef.current) {
      polygonRef.current.setLatLngs(inverted);
    }
    if (onPolygonChange) {
      onPolygonChange(inverted);
    }
    if (mapInstanceRef.current) {
      refreshVertexMarkers(inverted, mapInstanceRef.current);
    }
  };

  // Auto Reset / Re-generate Regular Polygon
  const handleRegeneratePolygon = (count: number = pointsCount) => {
    const initialLat = Number(lat) || 29.6857;
    const initialLng = Number(lng) || 76.9905;
    const ac = Number(acreage) || 5;
    const fresh = calculateDefaultPolygonPoints(initialLat, initialLng, ac, count);
    currentBoundsRef.current = fresh;

    if (polygonRef.current) {
      polygonRef.current.setLatLngs(fresh);
    }
    if (onPolygonChange) {
      onPolygonChange(fresh);
    }
    if (mapInstanceRef.current) {
      refreshVertexMarkers(fresh, mapInstanceRef.current);
      mapInstanceRef.current.panTo([initialLat, initialLng]);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      polygonRef.current = null;
      vertexMarkersRef.current = [];
      edgeMarkersRef.current = [];
    }

    const initialLat = Number(lat) || 29.6857;
    const initialLng = Number(lng) || 76.9905;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Base Satellite Layer - Google Hybrid Satellite (Super Sharp & Fast)
    const googleHybrid = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google Satellite',
      }
    );

    // Fallback/Alternative Esri Layer
    const esriSatellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri World Imagery' }
    );

    const esriLabels = L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.9 }
    );

    const osmLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      { maxZoom: 19, attribution: 'OpenStreetMap' }
    );

    // Add default layer
    googleHybrid.addTo(map);

    // Add standard Leaflet layer control in top-right (under custom buttons)
    L.control.layers(
      {
        '🛰️ Google Hybrid': googleHybrid,
        '🌍 Esri Satellite': esriSatellite,
        '🗺️ OpenStreetMap': osmLayer,
      },
      {},
      { position: 'bottomright', collapsed: true }
    ).addTo(map);

    // Center Pin Icon
    const customPin = L.divIcon({
      className: 'custom-center-pin',
      html: `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; background: ${colorHex}55; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 30px; height: 30px; background: ${colorHex}; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Add Center Marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customPin,
      draggable: true,
      zIndexOffset: 1000,
    }).addTo(map);

    const initialBounds =
      currentBoundsRef.current && currentBoundsRef.current.length >= 3
        ? currentBoundsRef.current
        : customPolygon && customPolygon.length >= 3
        ? customPolygon
        : calculateDefaultPolygonPoints(initialLat, initialLng, acreage, pointsCount);

    currentBoundsRef.current = initialBounds;

    const poly = L.polygon(initialBounds, {
      color: colorHex,
      weight: 3,
      dashArray: '5, 5',
      fillColor: colorHex,
      fillOpacity: 0.35,
    }).addTo(map);

    polygonRef.current = poly;

    // Real-time drag handler for center pin: SHIFT POLYGON IN REAL TIME
    marker.on('drag', (e) => {
      const newPos = e.target.getLatLng();
      const curBounds = currentBoundsRef.current;
      if (curBounds.length > 0) {
        const centerLat = curBounds.reduce((s, p) => s + p[0], 0) / curBounds.length;
        const centerLng = curBounds.reduce((s, p) => s + p[1], 0) / curBounds.length;
        const dLat = newPos.lat - centerLat;
        const dLng = newPos.lng - centerLng;
        const shifted = curBounds.map((pt) => [pt[0] + dLat, pt[1] + dLng] as [number, number]);
        if (polygonRef.current) {
          polygonRef.current.setLatLngs(shifted);
        }
        vertexMarkersRef.current.forEach((vm, idx) => {
          if (shifted[idx]) {
            vm.setLatLng(shifted[idx]);
          }
        });
      }
    });

    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      const nLat = parseFloat(newPos.lat.toFixed(4));
      const nLng = parseFloat(newPos.lng.toFixed(4));

      const curBounds = currentBoundsRef.current;
      if (curBounds.length > 0) {
        const centerLat = curBounds.reduce((s, p) => s + p[0], 0) / curBounds.length;
        const centerLng = curBounds.reduce((s, p) => s + p[1], 0) / curBounds.length;
        const dLat = nLat - centerLat;
        const dLng = nLng - centerLng;
        const shifted = curBounds.map(
          (pt) =>
            [
              parseFloat((pt[0] + dLat).toFixed(5)),
              parseFloat((pt[1] + dLng).toFixed(5)),
            ] as [number, number]
        );

        currentBoundsRef.current = shifted;
        if (onPolygonChange) {
          onPolygonChange(shifted);
        }
        refreshVertexMarkers(shifted, map);
      }
      onChange(nLat, nLng);
    });

    markerRef.current = marker;

    // Map click handler to relocate pin & shift polygon to clicked location
    map.on('click', (e: L.LeafletMouseEvent) => {
      setActiveVertexMenu(null);
      const clickedLat = parseFloat(e.latlng.lat.toFixed(4));
      const clickedLng = parseFloat(e.latlng.lng.toFixed(4));

      const curBounds = currentBoundsRef.current;
      if (curBounds.length > 0) {
        const centerLat = curBounds.reduce((s, p) => s + p[0], 0) / curBounds.length;
        const centerLng = curBounds.reduce((s, p) => s + p[1], 0) / curBounds.length;
        const dLat = clickedLat - centerLat;
        const dLng = clickedLng - centerLng;
        const shifted = curBounds.map(
          (pt) =>
            [
              parseFloat((pt[0] + dLat).toFixed(5)),
              parseFloat((pt[1] + dLng).toFixed(5)),
            ] as [number, number]
        );

        currentBoundsRef.current = shifted;
        if (onPolygonChange) {
          onPolygonChange(shifted);
        }
        refreshVertexMarkers(shifted, map);
      }
      onChange(clickedLat, clickedLng);
    });

    refreshVertexMarkers(initialBounds, map);

    // Progressive viewport invalidations to ensure tiles render immediately upon container layout
    [20, 80, 180, 350, 700].forEach((delay) => {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ pan: false });
          mapInstanceRef.current.setView([initialLat, initialLng], mapInstanceRef.current.getZoom(), { animate: false });
          mapInstanceRef.current.eachLayer((l: any) => {
            if (l instanceof L.TileLayer) {
              l.redraw();
            }
          });
        }
      }, delay);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      polygonRef.current = null;
      vertexMarkersRef.current = [];
      edgeMarkersRef.current = [];
    };
  }, [isFullscreen]);

  // Synchronize when props update
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentLat = Number(lat) || 29.6857;
    const currentLng = Number(lng) || 76.9905;
    const ac = Number(acreage) || 5;

    // Update center marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([currentLat, currentLng]);
    }

    let bounds: [number, number][];

    if (customPolygon && customPolygon.length >= 3) {
      bounds = customPolygon;
    } else {
      bounds = calculateDefaultPolygonPoints(currentLat, currentLng, ac, pointsCount);
    }

    currentBoundsRef.current = bounds;

    if (polygonRef.current) {
      polygonRef.current.setLatLngs(bounds);
      polygonRef.current.setStyle({
        color: colorHex,
        fillColor: colorHex,
        fillOpacity: 0.35,
        weight: 3,
      });
    }

    refreshVertexMarkers(bounds, mapInstanceRef.current);
    mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true, duration: 0.4 });
  }, [lat, lng, acreage, polygonColor, pointsCount, customPolygon, colorHex]);

  // ResizeObserver to ensure Leaflet always fills 100% of container on any size change
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const triggerMapRefresh = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    map.invalidateSize(true);
    const centerLat = Number(lat) || 29.6857;
    const centerLng = Number(lng) || 76.9905;
    map.setView([centerLat, centerLng], map.getZoom(), { animate: false });
    map.eachLayer((layer: any) => {
      if (typeof layer.redraw === 'function') {
        layer.redraw();
      }
    });
  };

  // Re-calculate tile coordinates whenever isFullscreen state toggles
  useEffect(() => {
    [10, 50, 100, 200, 350, 600].forEach((delay) => {
      setTimeout(triggerMapRefresh, delay);
    });
  }, [isFullscreen]);

  // Escape key listener for fullscreen
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const mapContent = (
    <div
      ref={mapWrapperRef}
      style={{
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : undefined,
      }}
      className={
        isFullscreen
          ? 'fixed inset-0 z-[99999999] w-screen h-screen bg-slate-950 overflow-hidden'
          : 'relative w-full rounded-xl overflow-hidden border-2 border-emerald-500/40 shadow-md bg-slate-900'
      }
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: isFullscreen ? '100vh' : '100%',
          minHeight: isFullscreen ? '100vh' : '380px',
        }}
        className={
          isFullscreen ? 'w-full h-full bg-slate-950' : className || 'w-full h-[380px] bg-slate-900'
        }
      />

      {/* Top Left Floating Instructions Overlay */}
      <div className="absolute top-2 left-2 z-[1000] bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg text-[11px] text-white flex items-center gap-2 border border-white/15 shadow-md pointer-events-none">
        <Crosshair className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>
          <strong>{currentBoundsRef.current.length} Vertices:</strong> Drag circles to reshape &bull;
          Click vertex for <strong>Delete Menu</strong> &bull; Click edge dot to add vertex
        </span>
      </div>

      {/* Top Right Floating Toolbar (Fullscreen, Invert, Reset) */}
      <div className="absolute top-2 right-2 z-[1000] flex items-center gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleInvertPolygon}
          title="Invert / Reverse Polygon Vertex Direction"
          className="h-7 px-2 text-[11px] bg-black/80 text-white hover:bg-black/95 border border-white/20 shadow-md gap-1"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Invert</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleRegeneratePolygon()}
          title="Auto Reset to Regular Polygon"
          className="h-7 px-2 text-[11px] bg-black/80 text-white hover:bg-black/95 border border-white/20 shadow-md gap-1"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span className="hidden sm:inline">Reset Shape</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen Map (Esc)' : 'View Fullscreen Map'}
          className="h-7 px-2 text-[11px] bg-emerald-700 hover:bg-emerald-600 text-white border border-white/20 shadow-md gap-1 font-semibold"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Fullscreen Map</span>
            </>
          )}
        </Button>
      </div>

      {/* Floating Delete Vertex Context Menu (Google Maps Delete Vertex Pattern) */}
      {activeVertexMenu && (
        <div
          style={{
            position: 'absolute',
            left: `${activeVertexMenu.x + 10}px`,
            top: `${activeVertexMenu.y - 30}px`,
            zIndex: 2000,
          }}
          className="bg-popover border border-border/90 shadow-2xl rounded-lg p-1 animate-in fade-in-0 zoom-in-95 flex items-center gap-1"
        >
          <button
            type="button"
            onClick={() => handleDeleteVertex(activeVertexMenu.index)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Vertex #{activeVertexMenu.index + 1}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveVertexMenu(null)}
            className="px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted rounded"
          >
            &times;
          </button>
        </div>
      )}

      {/* Bottom Info Strip */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-emerald-950/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-200 border border-emerald-500/30 shadow-sm pointer-events-none">
        {currentBoundsRef.current.length} Points &bull; {acreage} Acres &bull; GPS: {lat.toFixed(4)},{' '}
        {lng.toFixed(4)}
      </div>
    </div>
  );

  if (isFullscreen && typeof document !== 'undefined') {
    return createPortal(mapContent, document.body);
  }

  return mapContent;
}
