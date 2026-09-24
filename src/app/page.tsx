'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wheat, 
  ShieldCheck, 
  Compass, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  Sprout, 
  Package, 
  MapPin, 
  LineChart,
  Layers,
  Factory,
  Users
} from 'lucide-react';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Bar */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
            <Wheat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-foreground">Krishi AgriTech</h1>
            <p className="text-[11px] text-muted-foreground">Farmer & Wheat Crop Monitoring System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RoleSwitcherBar />
          <Link href="/admin">
            <Button size="sm" className="gap-1.5 font-medium shadow-xs">
              <span>Open Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 sm:py-24 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sprout className="h-3.5 w-3.5" />
          <span>Production-Ready Agritech Frontend (Rabi 2025-2026)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto text-balance">
          End-to-End Wheat Farming Lifecycle & Seed Traceability
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
          From certified seed distribution and GIS parcel mapping to 10-stage crop phenology, NDVI health monitoring, and flour milling analytics.
        </p>

        {/* 3 Experience Entry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
          {/* Admin Experience */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-md group flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Admin & Agri Manager</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">Desktop Hub</Badge>
              </div>
              <CardDescription className="text-xs">
                Comprehensive command center for yield analytics, parcel registry, seed dispatch, advisory alerts, and milling batch oversight.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>12 Registered Farmers & 20+ GPS Parcels</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Seed Lot & Bag QR Barcode Tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Yield Forecasting & Milling Silos</span>
                </li>
              </ul>
              <Link href="/admin" className="block pt-2">
                <Button className="w-full gap-2 text-xs font-semibold">
                  Launch Admin Console
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Field Officer Experience */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-md group flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Compass className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Field Officer Portal</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">Field Ops</Badge>
              </div>
              <CardDescription className="text-xs">
                Streamlined field inspection logger for ground officers to verify GPS bounds, record agronomic sprays, and check crop rust.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Quick Agronomic Activity Logger</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Farmer Verification & GPS Boundary Check</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span>Offline-Friendly Inspection Queue</span>
                </li>
              </ul>
              <Link href="/field-officer" className="block pt-2">
                <Button variant="secondary" className="w-full gap-2 text-xs font-semibold">
                  Launch Field Officer App
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Farmer Mobile Portal */}
          <Card className="relative overflow-hidden border-2 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-md group flex flex-col justify-between">
            <CardHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Farmer Mobile Passbook</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">Mobile-First</Badge>
              </div>
              <CardDescription className="text-xs">
                Simplified bilingual (English + Hindi) interface for growers: digital seed passbook, weather forecast, and direct spray advisories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Bilingual Hindi / English Voice & Text Advice</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Seed Passbook & Subsidy Status</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Weather Risk Alerts & Harvest Dates</span>
                </li>
              </ul>
              <Link href="/farmer" className="block pt-2">
                <Button variant="outline" className="w-full gap-2 text-xs font-semibold">
                  Open Farmer Mobile View
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 10-Step Wheat Lifecycle Architecture Strip */}
      <section className="border-t border-border/80 bg-muted/30 py-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold tracking-tight">Full Lifecycle Wheat Architecture</h3>
            <p className="text-xs text-muted-foreground">Rigorous tracking across each stage of cultivation and post-harvest milling</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {[
              { icon: Users, title: '1. Enrollment', desc: 'CNIC & Land Registry' },
              { icon: Package, title: '2. Seed Passbook', desc: 'Barcoded Lot Bags' },
              { icon: MapPin, title: '3. GPS Parcel', desc: 'Geo-Polygon & Soil' },
              { icon: Sprout, title: '4. Sowing & Tillering', desc: 'CRI & Nitrogen' },
              { icon: LineChart, title: '5. NDVI Health', desc: 'Rust & Moisture Checks' },
              { icon: Wheat, title: '6. Harvest & Silo', desc: 'Grade & Moisture %' },
              { icon: Factory, title: '7. Flour Milling', desc: '77% Extraction Rate' }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-card border border-border/60 flex flex-col items-center justify-center space-y-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground">{step.title}</span>
                  <span className="text-[10px] text-muted-foreground">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/80 py-6 px-6 text-center text-xs text-muted-foreground">
        Krishi AgriTech &copy; 2026. Built with Next.js, shadcn/ui, Redux Toolkit & Tailwind CSS.
      </footer>
    </div>
  );
}
