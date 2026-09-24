'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DynamicFieldMap } from '@/components/map/DynamicFieldMap';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Layers,
  Sprout,
  Droplets,
  Thermometer,
  ShieldAlert,
  CalendarCheck,
  Eye,
  Maximize2
} from 'lucide-react';
import Link from 'next/link';

export default function GISFieldMapPage() {
  const parcels = useAppSelector((state) => state.landParcels.parcels);
  const cropCycles = useAppSelector((state) => state.cropCycles.cycles);
  const farmers = useAppSelector((state) => state.farmers.farmers);

  const [selectedParcelId, setSelectedParcelId] = useState<string>(parcels[0]?.id || '');
  const [activeLayer, setActiveLayer] = useState<'HEALTH' | 'NDVI' | 'STAGE' | 'SATELLITE'>('HEALTH');

  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
  const selectedCycle = cropCycles.find((c) => c.fieldParcelId === selectedParcel?.id);
  const selectedFarmer = farmers.find((f) => f.id === selectedParcel?.farmerId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="GIS Agricultural Satellite Map"
        description="Interactive geographic satellite field map with parcel polygon boundaries, NDVI vegetation index layers, and crop moisture stress zones."
      >
        <div className="flex items-center gap-2">
          {/* Layer Selector */}
          <div className="flex bg-muted p-1 rounded-xl text-xs">
            <Button
              variant={activeLayer === 'HEALTH' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs font-semibold px-2.5 cursor-pointer"
              onClick={() => setActiveLayer('HEALTH')}
            >
              Health Status
            </Button>
            <Button
              variant={activeLayer === 'NDVI' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs font-semibold px-2.5 cursor-pointer"
              onClick={() => setActiveLayer('NDVI')}
            >
              NDVI Canopy
            </Button>
            <Button
              variant={activeLayer === 'STAGE' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs font-semibold px-2.5 cursor-pointer"
              onClick={() => setActiveLayer('STAGE')}
            >
              Phenology Stage
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real Interactive Leaflet Geographic Satellite Map */}
        <div className="lg:col-span-2">
          <DynamicFieldMap
            parcels={parcels}
            cropCycles={cropCycles}
            farmers={farmers}
            selectedParcelId={selectedParcelId}
            onSelectParcel={(id) => setSelectedParcelId(id)}
            activeLayer={activeLayer}
          />
        </div>

        {/* Selected Parcel Field Dossier Inspector */}
        <Card className="border shadow-xs flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {selectedParcel.parcelCode}
                </Badge>
                {selectedCycle && <StatusBadge status={selectedCycle.healthStatus} />}
              </div>
              <CardTitle className="text-lg font-bold pt-1 text-foreground">
                {selectedFarmer?.fullName || selectedParcel.farmerName}
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedParcel.village} &bull; {selectedParcel.titleDeedOrKhasraNo}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs pt-4">
              {/* Satellite Live Telemetry Grid */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 bg-muted/60 rounded-xl">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">NDVI Score</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">{selectedCycle?.ndviScore || 0.84}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Moisture</span>
                  <span className="text-base font-bold text-blue-600 font-mono">{selectedCycle?.soilMoisturePct || 34.5}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Temp</span>
                  <span className="text-base font-bold text-foreground font-mono">{selectedCycle?.temperatureCelsius || 24.2}°C</span>
                </div>
              </div>

              {/* Agronomic Details */}
              <div className="space-y-2 p-3 border rounded-xl bg-card">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Cultivated Area:</span>
                  <span className="font-bold">{selectedParcel.totalAcreage} Acres</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Seed Variety:</span>
                  <span className="font-bold text-emerald-600">{selectedCycle?.seedVariety || 'HD-2967'}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Current Stage:</span>
                  <span className="font-semibold">{selectedCycle?.currentStage.replace(/_/g, ' ') || 'Heading Flowering'}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Irrigation Source:</span>
                  <span>{selectedParcel.irrigationSource.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Soil Profile:</span>
                  <span>{selectedParcel.soilType.replace(/_/g, ' ')} (pH {selectedParcel.phLevel})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Est. Harvest Date:</span>
                  <span className="font-bold font-mono">{selectedCycle?.expectedHarvestDate || '2026-04-12'}</span>
                </div>
              </div>

              {/* Risk Assessment */}
              {selectedCycle?.riskAlertLevel && selectedCycle.riskAlertLevel !== 'NONE' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Risk Level: {selectedCycle.riskAlertLevel}</span>
                  </div>
                  <p className="text-[11px]">Vegetation density index requires on-field inspection for rust spores.</p>
                </div>
              )}
            </CardContent>
          </div>

          <div className="p-4 pt-0">
            <div className="flex gap-2">
              <Link href="/admin/crop-cycles" className="w-1/2">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold cursor-pointer">
                  View Cycle Detail
                </Button>
              </Link>
              <Link href="/admin/activities" className="w-1/2">
                <Button size="sm" className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                  Log Field Visit
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
