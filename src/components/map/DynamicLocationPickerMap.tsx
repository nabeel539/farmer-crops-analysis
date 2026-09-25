'use client';

import React from 'react';
import dynamic from 'next/dynamic';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  acreage: number;
  polygonColor?: string;
  pointsCount?: number;
  customPolygon?: [number, number][];
  customColorMap?: Record<string, string>;
  onChange: (lat: number, lng: number) => void;
  onPolygonChange?: (polygonPoints: [number, number][]) => void;
  className?: string;
}

const LocationPickerMap = dynamic(
  () => import('./LocationPickerMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] rounded-xl bg-slate-900 border border-border flex flex-col items-center justify-center text-white space-y-2">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-[11px] font-mono text-white/70">Loading Satellite Map & Polygon...</span>
      </div>
    )
  }
);

export function DynamicLocationPickerMap(props: LocationPickerMapProps) {
  return <LocationPickerMap {...props} />;
}
