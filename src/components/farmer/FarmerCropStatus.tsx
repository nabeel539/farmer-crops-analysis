'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CropCycleRecord } from '@/store/api/cropCycleApi';
import { Farmer } from '@/store/api/farmerApi';
import {
  Sprout,
  Calendar,
  Layers,
  Thermometer,
  Droplets,
  Activity,
  Wheat,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface FarmerCropStatusProps {
  farmer: Farmer;
  cropCycles: CropCycleRecord[];
  isLoading: boolean;
  onNavigateToDiary?: () => void;
}

const PHENOLOGY_STAGES = [
  { key: 'SOWING', label: 'Sowing', days: 'Day 0' },
  { key: 'GERMINATION', label: 'Germination', days: 'Day 5-7' },
  { key: 'CRI_STAGE', label: 'CRI Stage (1st Water)', days: 'Day 21' },
  { key: 'TILLERING', label: 'Tillering', days: 'Day 35-45' },
  { key: 'JOINTING', label: 'Stem Extension', days: 'Day 60' },
  { key: 'BOOTING', label: 'Booting', days: 'Day 75' },
  { key: 'HEADING_FLOWERING', label: 'Flowering', days: 'Day 85-95' },
  { key: 'MILK_STAGE', label: 'Milky Grain', days: 'Day 105' },
  { key: 'DOUGH_STAGE', label: 'Dough Stage', days: 'Day 120' },
  { key: 'PHYSIOLOGICAL_MATURITY', label: 'Maturity', days: 'Day 135' },
  { key: 'HARVESTED', label: 'Harvested', days: 'Day 145+' },
];

export function FarmerCropStatus({
  farmer,
  cropCycles,
  isLoading,
  onNavigateToDiary,
}: FarmerCropStatusProps) {
  const activeCycle = cropCycles[0];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-44 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!activeCycle) {
    return (
      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <Sprout className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">No Active Crop Cycle Found</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              There is currently no wheat crop cycle initiated for {farmer.name}. Contact your Agri-Officer or Administrator to register your seasonal sowing.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sowingDate = activeCycle.sowing_date ? new Date(activeCycle.sowing_date) : new Date();
  const daysSinceSowing = Math.max(0, differenceInDays(new Date(), sowingDate));
  const expectedHarvestDate = activeCycle.expected_harvest_date ? new Date(activeCycle.expected_harvest_date) : null;
  const daysToHarvest = expectedHarvestDate ? Math.max(0, differenceInDays(expectedHarvestDate, new Date())) : null;

  const currentStageIndex = PHENOLOGY_STAGES.findIndex((s) => s.key === activeCycle.stage);
  const stageProgressPct = Math.min(
    100,
    Math.max(10, Math.round(((Math.max(0, currentStageIndex) + 1) / PHENOLOGY_STAGES.length) * 100))
  );

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'OPTIMAL':
        return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">Optimal Health</Badge>;
      case 'MILD_STRESS':
        return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">Mild Stress (Water / Nutrient)</Badge>;
      case 'SEVERE_STRESS':
        return <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30">Severe Stress</Badge>;
      case 'DISEASE_DETECTED':
        return <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30">Rust / Pest Alert</Badge>;
      default:
        return <Badge variant="outline">{health}</Badge>;
    }
  };

  const getStageRecommendation = (stage: string) => {
    switch (stage) {
      case 'SOWING':
      case 'GERMINATION':
        return {
          title: 'Early Stand Establishment',
          desc: 'Ensure optimal seed-to-soil contact. Watch for crust formation if unexpected light showers occur.',
          action: 'Check Seedling Emergence',
        };
      case 'CRI_STAGE':
        return {
          title: 'Critical 1st Irrigation (CRI Stage)',
          desc: 'Crown Root Initiation (Day 21) is the most critical irrigation stage. Delay can reduce tillering by 30%.',
          action: 'Log 1st Irrigation in Kisan Diary',
        };
      case 'TILLERING':
        return {
          title: '1st Split Nitrogen Top-Dressing',
          desc: 'Apply 1 bag Urea per acre after first irrigation when soil allows walking. Apply Weedicide if broadleaf weeds appear.',
          action: 'Log Urea Application',
        };
      case 'JOINTING':
        return {
          title: 'Stem Elongation & 2nd Irrigation',
          desc: 'Second irrigation required. Scout lower leaves for Yellow Rust (Puccinia striiformis) pustules.',
          action: 'Inspect Lower Leaves for Rust',
        };
      case 'BOOTING':
      case 'HEADING_FLOWERING':
        return {
          title: 'Flowering & Anthesis Protection',
          desc: 'Critical water-sensitive stage. Avoid water logging. Prophylactic fungicide spray (Propiconazole 25 EC @ 200ml/acre) recommended if temperature is 18-24°C with fog.',
          action: 'Fungicide Spray Advisory',
        };
      case 'MILK_STAGE':
      case 'DOUGH_STAGE':
        return {
          title: 'Grain Filling Period',
          desc: 'Terminal heat stress monitoring. Ensure adequate soil moisture to prevent premature grain shriveling.',
          action: 'Check Grain Plumpness',
        };
      case 'PHYSIOLOGICAL_MATURITY':
      case 'HARVESTED':
        return {
          title: 'Pre-Harvest & Grain Moisture',
          desc: 'Stop irrigation. Prepare combine harvester. Harvest when grain moisture drops below 12-14%.',
          action: 'Coordinate Harvest Intake',
        };
      default:
        return {
          title: 'Routine Agronomic Scouting',
          desc: 'Follow standard agricultural package of practices recommended by PAU/ICAR.',
          action: 'Log Daily Activity',
        };
    }
  };

  const recommendation = getStageRecommendation(activeCycle.stage);

  return (
    <div className="space-y-6">
      {/* Top Banner Card: Active Crop Cycle */}
      <Card className="overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-background to-emerald-500/5 dark:from-emerald-950/20 dark:via-background dark:to-emerald-900/10 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Wheat className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base sm:text-lg font-bold">
                    {activeCycle.crop_type} ({activeCycle.variety})
                  </CardTitle>
                  <Badge variant="outline" className="font-mono text-xs bg-background">
                    {activeCycle.cycle_code}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Season: {activeCycle.season} &bull; Sown: {activeCycle.sowing_date ? format(sowingDate, 'dd MMM yyyy') : 'N/A'} &bull; {activeCycle.allocated_acres} Acres
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getHealthBadge(activeCycle.health_status)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-6">
          {/* Days Elapsed & Countdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-background border border-border/80 flex items-center gap-3">
              <Clock className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Days Sown</div>
                <div className="text-lg font-bold font-mono">{daysSinceSowing} Days</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border/80 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Harvest Countdown</div>
                <div className="text-lg font-bold font-mono">
                  {daysToHarvest !== null ? `${daysToHarvest} Days Left` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border/80 col-span-2 sm:col-span-1 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <div className="text-[11px] text-muted-foreground uppercase font-semibold">Target Yield</div>
                <div className="text-lg font-bold font-mono">
                  {activeCycle.target_total_yield_kg ? `${(activeCycle.target_total_yield_kg / 1000).toFixed(1)} MT` : `${activeCycle.expected_yield_maunds_per_acre} Mnds/Ac`}
                </div>
              </div>
            </div>
          </div>

          {/* 11-Stage Phenology Progress Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-600" />
                Phenology Stage: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{activeCycle.stage.replace(/_/g, ' ')}</span>
              </span>
              <span className="font-mono text-muted-foreground font-semibold">{stageProgressPct}% Complete</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-muted/80 rounded-full h-3 overflow-hidden border border-border/60">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stageProgressPct}%` }}
              />
            </div>

            {/* Stage markers slider / chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
              {PHENOLOGY_STAGES.slice(0, 6).map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;
                return (
                  <div
                    key={stage.key}
                    className={`p-2 rounded-md text-[11px] border transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-muted/40 text-muted-foreground border-border/50 opacity-60'
                    }`}
                  >
                    <div className="truncate">{stage.label}</div>
                    <div className="text-[9px] opacity-80">{stage.days}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Field Telemetry & Agro-climatic Sensors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Droplets className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Soil Moisture</div>
                <div className="text-sm font-bold font-mono">{activeCycle.soil_moisture_pct}% (Adequate)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Thermometer className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Ambient Temp</div>
                <div className="text-sm font-bold font-mono">{activeCycle.temperature_celsius}°C (Favorable)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Canopy NDVI</div>
                <div className="text-sm font-bold font-mono">{activeCycle.ndvi_score} (High Vigour)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Sowing Method</div>
                <div className="text-sm font-bold truncate">{activeCycle.sowing_method || 'Precision Drill'}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advisory Callout: Next Agronomic Recommendation */}
      <Card className="border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-foreground">Next Action: {recommendation.title}</h4>
                <Badge variant="outline" className="text-[10px] bg-background text-blue-700 dark:text-blue-400">
                  Agronomy Advisory
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                {recommendation.desc}
              </p>
            </div>
          </div>

          {onNavigateToDiary && (
            <Button
              onClick={onNavigateToDiary}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{recommendation.action}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
