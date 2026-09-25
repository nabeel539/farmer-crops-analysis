'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Field } from '@/store/api/fieldApi';
import { Farmer } from '@/store/api/farmerApi';
import {
  MapPin,
  Layers,
  Compass,
  CheckCircle2,
  Wheat,
  Globe,
} from 'lucide-react';

interface FarmerParcelsViewProps {
  farmer: Farmer;
  fields: Field[];
  isLoading: boolean;
}

export function FarmerParcelsView({ farmer, fields, isLoading }: FarmerParcelsViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  const totalAcres = fields.reduce((sum, f) => sum + (f.area || 0), 0);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20 dark:to-background shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Registered Land Parcels & Satellite Monitored Acreage
                </CardTitle>
                <CardDescription className="text-xs">
                  GIS geo-referenced boundary plots registered under {farmer.name}.
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="bg-background text-emerald-700 dark:text-emerald-400 font-mono text-xs">
              Total Cultivated Land: {totalAcres} Acres ({fields.length} Plots)
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Fields List */}
      {fields.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">No Land Parcels Registered</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                No GIS field boundaries have been drawn for this farmer profile yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <Card key={f.id} className="border border-border/80 hover:border-emerald-500/40 transition-all shadow-xs">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-sm text-foreground">{f.field_name}</span>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                    {f.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Area Acreage</span>
                    <span className="font-bold text-foreground font-mono text-sm">{f.area} Acres</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Crop / Season</span>
                    <span className="font-semibold text-foreground">{f.crop} ({f.season || 'Rabi 2025-26'})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Village / Tehsil</span>
                    <span className="text-foreground">{f.village}, {f.block || f.district}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">GPS Center</span>
                    <span className="font-mono text-foreground">
                      {f.latitude && f.longitude ? `${f.latitude.toFixed(4)}, ${f.longitude.toFixed(4)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Geo-fenced with Satellite Telemetry</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    Color: {f.polygon_color}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
