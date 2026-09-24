'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair } from 'lucide-react';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  acreage: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
}

export default function LocationPickerMap({
  lat,
  lng,
  acreage,
  onChange,
  className
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = Number(lat) || 30.9010;
    const initialLng = Number(lng) || 75.8573;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Satellite base layer
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: 'Esri World Imagery' }
    ).addTo(map);

    // Hybrid labels layer
    L.tileLayer(
      'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.8 }
    ).addTo(map);

    // Custom pulse pin icon
    const customPin = L.divIcon({
      className: 'custom-pin',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 24px; height: 24px; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 28px; height: 28px; background: #059669; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Add draggable marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customPin,
      draggable: true
    }).addTo(map);

    marker.on('dragend', (e) => {
      const newPos = e.target.getLatLng();
      onChange(parseFloat(newPos.lat.toFixed(4)), parseFloat(newPos.lng.toFixed(4)));
    });

    markerRef.current = marker;

    // Map click handler to move pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const clickedLat = parseFloat(e.latlng.lat.toFixed(4));
      const clickedLng = parseFloat(e.latlng.lng.toFixed(4));
      onChange(clickedLat, clickedLng);
    });

    // Invalidate size after modal render
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update marker & polygon when lat/lng/acreage changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const currentLat = Number(lat) || 30.9010;
    const currentLng = Number(lng) || 75.8573;
    const ac = Number(acreage) || 10;
    const offset = 0.0022 * Math.sqrt(ac / 15);

    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([currentLat, currentLng]);
    }

    // Update or create polygon boundary
    const bounds: [number, number][] = [
      [currentLat + offset, currentLng - offset],
      [currentLat + offset, currentLng + offset],
      [currentLat - offset, currentLng + offset],
      [currentLat - offset, currentLng - offset]
    ];

    if (polygonRef.current) {
      polygonRef.current.setLatLngs(bounds);
    } else {
      const poly = L.polygon(bounds, {
        color: '#10b981',
        weight: 2,
        dashArray: '4, 4',
        fillColor: '#10b981',
        fillOpacity: 0.25
      }).addTo(mapInstanceRef.current);
      polygonRef.current = poly;
    }

    mapInstanceRef.current.panTo([currentLat, currentLng], { animate: true, duration: 0.5 });
  }, [lat, lng, acreage]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-emerald-500/30 shadow-inner">
      <div
        ref={mapContainerRef}
        className={className || "w-full h-[220px] bg-slate-900"}
      />
      <div className="absolute top-2 left-2 z-[1000] bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white flex items-center gap-1.5 border border-white/10 shadow-sm pointer-events-none">
        <Crosshair className="h-3 w-3 text-emerald-400 animate-pulse" />
        <span>Click on map or drag pin to set land location</span>
      </div>
    </div>
  );
}
