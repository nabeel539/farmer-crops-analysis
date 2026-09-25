'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LandParcel, CropCycle, Farmer } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  Maximize2,
  Minimize2,
  Navigation,
  Sun,
  MapPin,
  Eye,
  CheckCircle2,
  Crosshair
} from 'lucide-react';

interface LeafletFieldMapProps {
  parcels: LandParcel[];
  cropCycles: CropCycle[];
  farmers: Farmer[];
  selectedParcelId: string;
  onSelectParcel: (id: string) => void;
  activeLayer: 'HEALTH' | 'NDVI' | 'STAGE' | 'SATELLITE';
}

export default function LeafletFieldMap({
  parcels,
  cropCycles,
  farmers,
  selectedParcelId,
  onSelectParcel,
  activeLayer
}: LeafletFieldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayersRef = useRef<{ [id: string]: L.Polygon }>({});
  const markerLayersRef = useRef<{ [id: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const labelLayerRef = useRef<L.TileLayer | null>(null);

  const [mapStyle, setMapStyle] = useState<'SATELLITE' | 'HYBRID' | 'STREETS'>('HYBRID');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Ludhiana / Punjab Agricultural Heartland
    const initialLat = 30.9010;
    const initialLng = 75.8573;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });

    // Add Zoom Control at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Base Satellite Layer (Google Hybrid Satellite)
    const baseSatellite = L.tileLayer(
      'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: 'Google Satellite',
      }
    ).addTo(map);
    tileLayerRef.current = baseSatellite;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer when mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);
    if (labelLayerRef.current) map.removeLayer(labelLayerRef.current);

    if (mapStyle === 'SATELLITE') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: 'Google Satellite' }
      ).addTo(map);
    } else if (mapStyle === 'HYBRID') {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: 'Google Satellite' }
      ).addTo(map);
    } else if (mapStyle === 'STREETS') {
      tileLayerRef.current = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19, attribution: 'OpenStreetMap' }
      ).addTo(map);
    }
  }, [mapStyle]);

  // Generate / Update Parcel Polygons & Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing polygons & markers
    Object.values(polygonLayersRef.current).forEach((p) => map.removeLayer(p));
    Object.values(markerLayersRef.current).forEach((m) => map.removeLayer(m));
    polygonLayersRef.current = {};
    markerLayersRef.current = {};

    const bounds = L.latLngBounds([]);

    parcels.forEach((parcel, idx) => {
      const cycle = cropCycles.find((c) => c.fieldParcelId === parcel.id);
      const farmer = farmers.find((f) => f.id === parcel.farmerId);
      const health = cycle?.healthStatus || 'OPTIMAL';
      const ndvi = cycle?.ndviScore || 0.84;
      const stage = cycle?.currentStage || 'HEADING_FLOWERING';
      const isSelected = parcel.id === selectedParcelId;

      // Calculate realistic field polygon coordinates
      const centerLat = parcel.centerCoordinates?.lat || (31.4504 + (idx % 3) * 0.007 - Math.floor(idx / 3) * 0.005);
      const centerLng = parcel.centerCoordinates?.lng || (73.1350 + (idx % 4) * 0.008 - (idx % 2) * 0.004);

      const latOffset = 0.0022 + (parcel.totalAcreage > 20 ? 0.001 : 0);
      const lngOffset = 0.0032 + (parcel.totalAcreage > 20 ? 0.0015 : 0);

      const polygonCoords: [number, number][] = [
        [centerLat + latOffset, centerLng - lngOffset],
        [centerLat + latOffset, centerLng + lngOffset],
        [centerLat - latOffset, centerLng + lngOffset],
        [centerLat - latOffset, centerLng - lngOffset]
      ];

      polygonCoords.forEach((coord) => bounds.extend(coord));

      // Color scheme according to active layer
      let fillColor = '#22c55e'; // Green
      let strokeColor = '#16a34a';

      if (activeLayer === 'NDVI') {
        fillColor = ndvi > 0.8 ? '#15803d' : ndvi > 0.7 ? '#65a30d' : ndvi > 0.6 ? '#eab308' : '#ef4444';
        strokeColor = '#ffffff';
      } else if (activeLayer === 'HEALTH') {
        fillColor = health === 'OPTIMAL' ? '#22c55e' : health === 'GOOD' ? '#3b82f6' : health === 'STRESSED' ? '#eab308' : '#ef4444';
        strokeColor = health === 'CRITICAL' ? '#f43f5e' : '#ffffff';
      } else if (activeLayer === 'STAGE') {
        fillColor = stage.includes('HEADING') ? '#8b5cf6' : stage.includes('BOOTING') ? '#06b6d4' : '#10b981';
        strokeColor = '#ffffff';
      }

      // Create Leaflet Polygon
      const polygon = L.polygon(polygonCoords, {
        color: isSelected ? '#38bdf8' : strokeColor,
        weight: isSelected ? 4 : 2,
        opacity: isSelected ? 1 : 0.85,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.65 : 0.45,
        dashArray: isSelected ? undefined : '4, 4'
      }).addTo(map);

      // Interactive Click on polygon
      polygon.on('click', () => {
        onSelectParcel(parcel.id);
      });

      // Tooltip on Hover
      polygon.bindTooltip(
        `<div class="p-1 text-xs">
          <div class="font-bold text-foreground">${farmer?.fullName || parcel.farmerName}</div>
          <div class="text-muted-foreground">${parcel.parcelCode} • ${parcel.totalAcreage} Acres</div>
          <div class="font-mono text-emerald-600 font-semibold">NDVI: ${ndvi} (${health})</div>
        </div>`,
        { sticky: true, className: 'leaflet-custom-tooltip' }
      );

      polygonLayersRef.current[parcel.id] = polygon;

      // Custom HTML Marker at Center of Plot
      const customIcon = L.divIcon({
        className: 'custom-parcel-marker',
        html: `
          <div class="flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
            <div class="px-2 py-1 rounded-md text-[10px] font-bold shadow-md border flex items-center gap-1 ${
              isSelected 
                ? 'bg-sky-500 text-white border-sky-300 ring-2 ring-sky-400/50 scale-110' 
                : 'bg-black/80 text-white border-white/40 group-hover:scale-105'
            } transition-transform">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${fillColor}"></span>
              <span>${parcel.parcelCode.split('-').pop()}</span>
            </div>
          </div>
        `,
        iconSize: [60, 24]
      });

      const marker = L.marker([centerLat, centerLng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        onSelectParcel(parcel.id);
      });

      markerLayersRef.current[parcel.id] = marker;
    });

    // If parcel is selected, fly smoothly to it with zoom
    const selectedP = parcels.find((p) => p.id === selectedParcelId);
    if (selectedP && selectedP.centerCoordinates) {
      map.flyTo([selectedP.centerCoordinates.lat, selectedP.centerCoordinates.lng], 16, {
        animate: true,
        duration: 1.0
      });
    }
  }, [parcels, cropCycles, farmers, selectedParcelId, activeLayer]);

  // Fit all bounds button
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([]);
    parcels.forEach((p) => {
      if (p.centerCoordinates) bounds.extend([p.centerCoordinates.lat, p.centerCoordinates.lng]);
    });
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border/80 shadow-md ${isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-32px)]' : 'h-[540px]'}`}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-900" />

      {/* Top Floating Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-[200] pointer-events-none">
        {/* Geographic Coordinate HUD Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-black/75 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/20 text-xs shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Punjab Agri-Cadastral Zone</span>
          <span className="text-white/60 font-mono text-[11px] hidden sm:inline">
            31.4504° N, 73.1350° E &bull; Altitude 184m
          </span>
        </div>

        {/* Map Type Switcher Buttons */}
        <div className="pointer-events-auto flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg text-xs">
          <button
            onClick={() => setMapStyle('HYBRID')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
              mapStyle === 'HYBRID' ? 'bg-emerald-600 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Satellite Hybrid
          </button>
          <button
            onClick={() => setMapStyle('SATELLITE')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
              mapStyle === 'SATELLITE' ? 'bg-emerald-600 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Pure Satellite
          </button>
          <button
            onClick={() => setMapStyle('STREETS')}
            className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
              mapStyle === 'STREETS' ? 'bg-emerald-600 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Topographic
          </button>
        </div>
      </div>

      {/* Floating Action Controls on Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2 pointer-events-auto">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleFitAll}
          className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-black/80 text-white hover:bg-black/90 border border-white/20 shadow-lg rounded-xl cursor-pointer"
          title="Zoom to Fit All Monitored Plots"
        >
          <Crosshair className="h-3.5 w-3.5 text-emerald-400" />
          <span>Fit All Parcels</span>
        </Button>

        {/* Crop Health Legend Box */}
        <div className="bg-black/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/20 text-[11px] space-y-1.5 shadow-lg max-w-xs">
          <div className="font-bold text-[10px] text-white/80 uppercase tracking-wider flex items-center justify-between">
            <span>{activeLayer === 'NDVI' ? 'NDVI Biomass Layer' : activeLayer === 'STAGE' ? 'Phenology Stage' : 'Crop Health Index'}</span>
            <span className="font-mono text-emerald-400">12 Parcels</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shrink-0" />
              <span>Optimal (&gt;0.80)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0" />
              <span>Good (0.70-0.80)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" />
              <span>Stressed (0.60-0.70)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shrink-0" />
              <span>Critical (&lt;0.60)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
