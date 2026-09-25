'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HarvestRecordItem } from '@/store/api/harvestApi';
import { Farmer } from '@/store/api/farmerApi';
import {
  Wheat,
  IndianRupee,
  Building,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
} from 'lucide-react';
import { format } from 'date-fns';

interface FarmerHarvestSummaryProps {
  farmer: Farmer;
  harvests: HarvestRecordItem[];
  isLoading: boolean;
}

const MSP_PRICE_PER_QUINTAL = 2275; // ₹2,275 / Quintal (Government Wheat MSP)
const MSP_PRICE_PER_KG = 22.75;

export function FarmerHarvestSummary({ farmer, harvests, isLoading }: FarmerHarvestSummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  const totalKgHarvested = harvests.reduce((sum, h) => sum + (h.total_weight_kg || 0), 0);
  const totalMaunds = harvests.reduce((sum, h) => sum + (h.total_weight_maunds || 0), 0);
  const totalGrossRevenue = Math.round(totalKgHarvested * MSP_PRICE_PER_KG);

  return (
    <div className="space-y-6">
      {/* MSP & Revenue Summary Banner */}
      <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-50/60 to-background dark:from-amber-950/20 dark:to-background shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Wheat className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Harvest Receipts & Mandi MSP Valuation
                </CardTitle>
                <CardDescription className="text-xs">
                  Government MSP baseline @ ₹{MSP_PRICE_PER_QUINTAL.toLocaleString('en-IN')} / Quintal (₹910 / Maund).
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-mono text-xs">
                Live MSP: ₹{MSP_PRICE_PER_QUINTAL}/Qtl
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Wheat className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Grain Harvested</div>
                <div className="text-lg font-bold font-mono">
                  {totalKgHarvested ? `${(totalKgHarvested / 1000).toFixed(1)} MT` : '0 MT'}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">({totalMaunds} Maunds)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Gross Mandi Value</div>
                <div className="text-lg font-bold font-mono text-emerald-600">
                  ₹{totalGrossRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-muted-foreground">Govt Procurement Rate</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border/80 col-span-2 sm:col-span-1 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Procurement Status</div>
                <div className="text-lg font-bold font-mono text-blue-600">
                  {harvests.length > 0 ? 'Silo Transferred' : 'Pre-Harvest'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Harvest Records List */}
      {harvests.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <Wheat className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">No Harvest Intake Recorded Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Once wheat harvesting is completed and intake is recorded at the Strategic Silo, your official quality receipts and Mandi payment slips will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {harvests.map((h) => {
            const harvestValue = Math.round((h.total_weight_kg || 0) * MSP_PRICE_PER_KG);
            return (
              <Card key={h.id} className="border border-border/80 hover:border-amber-500/40 transition-all shadow-xs">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wheat className="h-4 w-4 text-amber-600" />
                      <span className="font-bold text-sm text-foreground font-mono">
                        {h.harvest_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        {h.grain_quality_grade.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {h.harvest_date}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Weight Harvested</span>
                      <span className="font-bold text-foreground font-mono text-sm">
                        {h.total_weight_kg} KG ({h.total_weight_maunds} Mnds)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Yield Per Acre</span>
                      <span className="font-bold text-emerald-600 font-mono">
                        {h.yield_per_acre_maunds} Mnds/Acre
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Grain Moisture</span>
                      <span className="font-bold text-foreground font-mono">
                        {h.grain_moisture_pct}% (Dry Grade)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Valuation @ MSP</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
                        ₹{harvestValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/40 border border-border/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assigned Silo: <strong className="text-foreground">{h.procurement_center || 'Strategic Silo #4'}</strong></span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {h.harvest_method.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
