'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sun,
  CloudRain,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface FarmerWeatherAdvisoryProps {
  village: string;
  district: string;
}

const FORECAST_DAYS = [
  { day: 'Today', date: '25 Sep', tempMax: 28, tempMin: 18, condition: 'Sunny / Clear', icon: Sun, rainProb: 0, windSpeed: 8, sprayWindow: true },
  { day: 'Tomorrow', date: '26 Sep', tempMax: 29, tempMin: 19, condition: 'Partly Cloudy', icon: CloudSun, rainProb: 10, windSpeed: 11, sprayWindow: true },
  { day: 'Wednesday', date: '27 Sep', tempMax: 27, tempMin: 17, condition: 'Clear Sky', icon: Sun, rainProb: 0, windSpeed: 9, sprayWindow: true },
  { day: 'Thursday', date: '28 Sep', tempMax: 25, tempMin: 16, condition: 'Isolated Showers', icon: CloudRain, rainProb: 45, windSpeed: 18, sprayWindow: false },
  { day: 'Friday', date: '29 Sep', tempMax: 26, tempMin: 16, condition: 'Scattered Clouds', icon: CloudSun, rainProb: 15, windSpeed: 12, sprayWindow: true },
];

export function FarmerWeatherAdvisory({ village, district }: FarmerWeatherAdvisoryProps) {
  const handlePlayAdvisoryAudio = () => {
    toast.info('Playing Punjabi / Hindi Audio Advisory for Yellow Rust & Spray Timings...');
  };

  return (
    <div className="space-y-6">
      {/* Spray Window Banner */}
      <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20 dark:to-background shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Agri-Meteorological Weather & Spraying Window
                </CardTitle>
                <CardDescription className="text-xs">
                  Micro-climate weather intelligence for {village}, {district}.
                </CardDescription>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayAdvisoryAudio}
              className="text-xs gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Voice Advisory (Hindi/Punjabi)</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-4 space-y-4">
          {/* Live Spraying Window Indicator */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                  Optimal Spraying Window Active Today
                </div>
                <div className="text-xs text-emerald-800/80 dark:text-emerald-300">
                  Wind speed (8 km/h) &bull; No rain forecast for 48 hours &bull; Safe for fungicide/foliar sprays.
                </div>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white text-[11px] self-start sm:self-auto font-semibold">
              Spray Window Open
            </Badge>
          </div>

          {/* 5-Day Outlook Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {FORECAST_DAYS.map((fc, i) => {
              const Icon = fc.icon;
              return (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-center space-y-2 transition-all ${
                    i === 0
                      ? 'bg-background border-emerald-500 shadow-xs'
                      : 'bg-muted/30 border-border/70'
                  }`}
                >
                  <div className="text-xs font-bold text-foreground">{fc.day}</div>
                  <div className="text-[10px] text-muted-foreground">{fc.date}</div>

                  <div className="w-8 h-8 mx-auto flex items-center justify-center text-amber-500">
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="font-mono font-bold text-sm text-foreground">
                    {fc.tempMax}° / <span className="text-muted-foreground text-xs">{fc.tempMin}°</span>
                  </div>

                  <div className="text-[10px] text-muted-foreground truncate">{fc.condition}</div>

                  <div className="pt-1 border-t border-border/50 text-[10px] flex items-center justify-between">
                    <span className="text-blue-600 flex items-center gap-0.5">
                      <Droplets className="h-3 w-3" /> {fc.rainProb}%
                    </span>
                    <span className="text-muted-foreground flex items-center gap-0.5">
                      <Wind className="h-3 w-3" /> {fc.windSpeed}k
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Critical Advisory Broadcasts */}
      <Card className="border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-base font-bold text-foreground">
              Regional Crop Health & Disease Broadcasts
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="p-3 rounded-lg bg-background border border-amber-300 dark:border-amber-900/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-200">
                Yellow Rust (Puccinia striiformis) Surveillance Alert
              </span>
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                Advisory Warning
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              With current morning dew and temperature around 20°C, inspect lower canopies for yellow stripe pustules. If detected, spray Tilt / Propiconazole 25 EC @ 200 ml in 200 L water per acre.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-background border border-border/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-foreground">
                Urea Nitrogen Top-Dressing Guidance
              </span>
              <Badge variant="outline" className="text-[10px]">
                Agronomy Best Practice
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Complete second split application of nitrogen before jointing stage to maximize productive tillers per square meter.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
