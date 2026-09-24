'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LandParcel, CropCycle, Farmer } from '@/types';

interface DynamicFieldMapProps {
  parcels: LandParcel[];
  cropCycles: CropCycle[];
  farmers: Farmer[];
  selectedParcelId: string;
  onSelectParcel: (id: string) => void;
  activeLayer: 'HEALTH' | 'NDVI' | 'STAGE' | 'SATELLITE';
}

const LeafletFieldMap = dynamic(
  () => import('./LeafletFieldMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] rounded-2xl bg-slate-900 border border-border/80 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-white/70">Loading High-Resolution Satellite GIS Imagery...</span>
      </div>
    )
  }
);

export function DynamicFieldMap(props: DynamicFieldMapProps) {
  return <LeafletFieldMap {...props} />;
}
