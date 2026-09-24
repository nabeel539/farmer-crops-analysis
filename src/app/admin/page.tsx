'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricCard } from '@/components/shared/MetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Users,
  Sprout,
  Package,
  LineChart,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Droplets,
  CalendarCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addFarmer } from '@/store/slices/farmersSlice';
import { addActivity } from '@/store/slices/activitiesSlice';
import { DynamicFieldMap } from '@/components/map/DynamicFieldMap';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const farmers = useAppSelector((state) => state.farmers.farmers);
  const parcels = useAppSelector((state) => state.landParcels.parcels);
  const cropCycles = useAppSelector((state) => state.cropCycles.cycles);
  const seedDistributions = useAppSelector((state) => state.seedDistributions.distributions);
  const activities = useAppSelector((state) => state.activities.activities);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const activeAlerts = alerts.filter((a) => !a.resolved);

  // Map & Farmer State
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('ALL');
  const [selectedParcelId, setSelectedParcelId] = useState<string>(parcels[0]?.id || '');
  const [activeLayer, setActiveLayer] = useState<'HEALTH' | 'NDVI' | 'STAGE' | 'SATELLITE'>('HEALTH');

  const handleFarmerSelect = (farmerId: string) => {
    setSelectedFarmerId(farmerId);
    if (farmerId !== 'ALL') {
      const farmerParcel = parcels.find(p => p.farmerId === farmerId);
      if (farmerParcel) {
        setSelectedParcelId(farmerParcel.id);
      }
    }
  };

  const displayedParcels = selectedFarmerId === 'ALL'
    ? parcels
    : parcels.filter(p => p.farmerId === selectedFarmerId);

  const selectedParcel = parcels.find((p) => p.id === selectedParcelId) || displayedParcels[0] || parcels[0];
  const selectedCycle = cropCycles.find((c) => c.fieldParcelId === selectedParcel?.id);
  const selectedFarmer = selectedFarmerId !== 'ALL'
    ? farmers.find((f) => f.id === selectedFarmerId)
    : (farmers.find((f) => f.id === selectedParcel?.farmerId) || farmers[0]);


  // Quick Action Dialog State
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState<'FARMER' | 'ACTIVITY'>('FARMER');


  // Quick Farmer Form State
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerMobile, setNewFarmerMobile] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('');
  const [newFarmerAcres, setNewFarmerAcres] = useState('15');
  const [newFarmerDistrict, setNewFarmerDistrict] = useState('Ludhiana');

  // Quick Activity Form State
  const [actFarmerId, setActFarmerId] = useState(farmers[0]?.id || '');
  const [actType, setActType] = useState('IRRIGATION');
  const [actDosage, setActDosage] = useState('3 Acre Inches Canal Irrigation');

  // Aggregated KPIs
  const totalFarmers = farmers.length;
  const totalWheatAcreage = farmers.reduce((sum, f) => sum + (f.wheatAcreage || 0), 0);
  const totalSeedBagsDistributed = seedDistributions.reduce((sum, d) => sum + (d.quantityBags || 0), 0);
  const totalYieldForecastMaunds = cropCycles.reduce((sum, c) => sum + (c.expectedYieldMaundsPerAcre * c.allocatedAcres), 0);

  // Chart 1: Stage Distribution Data
  const stageCounts: Record<string, number> = {};
  cropCycles.forEach((c) => {
    const stageName = c.currentStage.replace(/_/g, ' ');
    stageCounts[stageName] = (stageCounts[stageName] || 0) + c.allocatedAcres;
  });
  const stageChartData = Object.entries(stageCounts).map(([name, acres]) => ({ name, acres }));

  // Chart 2: Variety Allocation Donut Data
  const varietyCounts: Record<string, number> = {};
  seedDistributions.forEach((d) => {
    varietyCounts[d.seedVariety] = (varietyCounts[d.seedVariety] || 0) + d.quantityBags;
  });
  const VARIETY_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
  const varietyChartData = Object.entries(varietyCounts).map(([name, value]) => ({ name, value }));

  // Chart 3: Weekly Activity Execution
  const activityTrendData = [
    { week: 'Wk 1 (Nov)', scheduled: 8, completed: 8 },
    { week: 'Wk 3 (Nov)', scheduled: 14, completed: 14 },
    { week: 'Wk 5 (Dec)', scheduled: 12, completed: 11 },
    { week: 'Wk 7 (Dec)', scheduled: 10, completed: 10 },
    { week: 'Wk 9 (Jan)', scheduled: 15, completed: 14 },
    { week: 'Wk 11 (Jan)', scheduled: 12, completed: 12 },
    { week: 'Wk 13 (Feb)', scheduled: 16, completed: 13 },
  ];

  const handleQuickAddFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName || !newFarmerMobile) {
      toast.error('Please enter farmer name and mobile number');
      return;
    }
    const id = `FARM-0${farmers.length + 1}`;
    dispatch(addFarmer({
      id,
      farmerCode: `FARM-2026-0${farmers.length + 1}`,
      fullName: newFarmerName,
      fatherName: 'Jaswant Singh',
      cnicOrId: '9845-6712-4411',
      mobile: newFarmerMobile,
      village: newFarmerVillage || 'Gill Kalan',
      unionCouncil: 'Panchayat-Gill',
      tehsil: 'Ludhiana West',
      district: newFarmerDistrict,
      totalLandAcres: parseFloat(newFarmerAcres) * 1.2,
      wheatAcreage: parseFloat(newFarmerAcres),
      status: 'ACTIVE',
      createdDate: new Date().toISOString().split('T')[0],
      ratingScore: 4.8
    }));
    toast.success(`Farmer ${newFarmerName} registered successfully!`);
    setQuickDialogOpen(false);
    setNewFarmerName('');
    setNewFarmerMobile('');
  };

  const handleQuickAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const selFarmer = farmers.find(f => f.id === actFarmerId) || farmers[0];
    const newActId = `ACT-0${activities.length + 1}`;
    dispatch(addActivity({
      id: newActId,
      cropCycleId: 'CYCLE-001',
      farmerId: selFarmer.id,
      farmerName: selFarmer.fullName,
      fieldParcelId: 'PRCL-001',
      activityType: actType as any,
      scheduledDate: new Date().toISOString().split('T')[0],
      executedDate: new Date().toISOString().split('T')[0],
      status: 'COMPLETED',
      dosageOrVolume: actDosage,
      cost: 4500,
      loggedByRole: 'FIELD_OFFICER',
      loggedByName: 'Muhammad Asif',
      notes: 'Recorded via quick action logger.',
      recommendationAdherence: true
    }));
    toast.success(`Activity logged for ${selFarmer.fullName}!`);
    setQuickDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Wheat Operations Executive Dashboard"
        description="Rabi Season 2025-2026: Real-time oversight across certified seed allocation, crop cycle phenology, and field activities."
        badge={
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Season Active: Rabi 2025-26
          </Badge>
        }
      >
        <Dialog open={quickDialogOpen} onOpenChange={setQuickDialogOpen}>
          <DialogTrigger render={
            <Button className="gap-2 shadow-xs font-semibold">
              <Plus className="h-4 w-4" />
              Quick Action
            </Button>
          } />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Quick Field Operation</DialogTitle>
              <DialogDescription className="text-xs">
                Quickly register a farmer or record an executed agronomic field activity.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2 p-1 bg-muted rounded-xl mb-3">
              <Button
                type="button"
                variant={quickActionType === 'FARMER' ? 'default' : 'ghost'}
                size="sm"
                className="w-1/2 text-xs font-medium"
                onClick={() => setQuickActionType('FARMER')}
              >
                Enroll Farmer
              </Button>
              <Button
                type="button"
                variant={quickActionType === 'ACTIVITY' ? 'default' : 'ghost'}
                size="sm"
                className="w-1/2 text-xs font-medium"
                onClick={() => setQuickActionType('ACTIVITY')}
              >
                Log Agronomic Activity
              </Button>
            </div>

            {quickActionType === 'FARMER' ? (
              <form onSubmit={handleQuickAddFarmer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Farmer Full Name</Label>
                    <Input
                      placeholder="e.g. Haji Muhammad Arif"
                      value={newFarmerName}
                      onChange={(e) => setNewFarmerName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Mobile Number</Label>
                    <Input
                      placeholder="+92 300 1234567"
                      value={newFarmerMobile}
                      onChange={(e) => setNewFarmerMobile(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Village / Chak</Label>
                    <Input
                      placeholder="e.g. Chak 88-RB"
                      value={newFarmerVillage}
                      onChange={(e) => setNewFarmerVillage(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Wheat Acreage (Acres)</Label>
                    <Input
                      type="number"
                      value={newFarmerAcres}
                      onChange={(e) => setNewFarmerAcres(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">District</Label>
                  <Select
                    value={newFarmerDistrict}
                    onValueChange={(v) => {
                      if (v !== null) setNewFarmerDistrict(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ludhiana">Ludhiana (Punjab)</SelectItem>
                      <SelectItem value="Karnal">Karnal (Haryana)</SelectItem>
                      <SelectItem value="Patiala">Patiala (Punjab)</SelectItem>
                      <SelectItem value="Bathinda">Bathinda (Punjab)</SelectItem>
                      <SelectItem value="Meerut">Meerut (UP)</SelectItem>
                      <SelectItem value="Indore">Indore (MP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full font-semibold">
                  Complete Farmer Registration
                </Button>
              </form>
            ) : (
              <form onSubmit={handleQuickAddActivity} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Select Farmer</Label>
                  <Select
                    value={actFarmerId}
                    onValueChange={(v) => {
                      if (v !== null) setActFarmerId(v);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.fullName} ({f.village}, {f.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Activity Type</Label>
                    <Select
                      value={actType}
                      onValueChange={(v) => {
                        if (v !== null) setActType(v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IRRIGATION">Canal/Tubewell Irrigation</SelectItem>
                        <SelectItem value="FERTILIZER_UREA">Urea Top-Dressing</SelectItem>
                        <SelectItem value="FERTILIZER_DAP">DAP Basal Application</SelectItem>
                        <SelectItem value="FERTILIZER_POTASH">Soluble Potash Spray</SelectItem>
                        <SelectItem value="PESTICIDE_SPRAY">Fungicide / Rust Spray</SelectItem>
                        <SelectItem value="WEEDICIDE_SPRAY">Weedicide Herbicide</SelectItem>
                        <SelectItem value="FIELD_VISIT_INSPECTION">NDVI & Canopy Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Dosage / Details</Label>
                    <Input
                      value={actDosage}
                      onChange={(e) => setActDosage(e.target.value)}
                      placeholder="e.g. 1 Bag Urea per acre"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full font-semibold">
                  Log Field Activity Record
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Critical Alert Banner if Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                {activeAlerts[0].title}
                <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40">
                  {activeAlerts[0].severity}
                </Badge>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{activeAlerts[0].description}</p>
            </div>
          </div>
          <Link href="/admin/alerts" className="shrink-0">
            <Button size="sm" variant="outline" className="text-xs gap-1 h-8 bg-background">
              <span>View All Alerts ({activeAlerts.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Farmers"
          value={totalFarmers}
          subtitle="100% CNIC verified"
          icon={Users}
          variant="primary"
          trend={{ value: '18%', isPositive: true, label: 'vs last Rabi' }}
        />
        <MetricCard
          title="Monitored Wheat Area"
          value={`${totalWheatAcreage.toFixed(1)} Ac`}
          subtitle="20 GPS Verified Parcels"
          icon={MapPin}
          trend={{ value: '24%', isPositive: true, label: 'acreage growth' }}
        />
        <MetricCard
          title="Certified Seed Bags"
          value={totalSeedBagsDistributed}
          subtitle="10,850 kg distributed"
          icon={Package}
          trend={{ value: '100%', isPositive: true, label: 'target achieved' }}
        />
        <MetricCard
          title="Yield Forecast"
          value={`${(totalYieldForecastMaunds * 0.04).toFixed(0)} Tons`}
          subtitle={`Avg 51.4 Maunds/Acre`}
          icon={TrendingUp}
          trend={{ value: '8.4%', isPositive: true, label: 'above state avg' }}
        />
      </div>

      {/* Live GIS Satellite Agricultural Map Section with Farmer Selector */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-2xl bg-card border shadow-xs">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              GIS Satellite Field Map & Crop Monitoring
            </h3>
            <p className="text-xs text-muted-foreground">
              Select a farmer from dropdown to inspect their live GPS satellite field parcels and vegetation health
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Farmer Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-muted/70 hover:bg-muted p-1 rounded-xl border border-border/60 transition-colors">
              <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-foreground">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Farmer:</span>
              </div>
              <Select value={selectedFarmerId} onValueChange={(v) => v && handleFarmerSelect(v)}>
                <SelectTrigger className="h-8 text-xs bg-background font-semibold border-border/80 min-w-[220px] sm:min-w-[260px] shadow-2xs">
                  <SelectValue placeholder="Select Farmer" />
                </SelectTrigger>
                <SelectContent className="min-w-[300px] sm:min-w-[340px] max-h-80 shadow-2xl border-border/80">
                  <SelectItem value="ALL" className="py-2.5 font-bold text-primary cursor-pointer border-b border-border/50">
                    🌍 All Farmers ({farmers.length} Enrolled Plots)
                  </SelectItem>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="py-2 cursor-pointer">
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-foreground text-xs">{f.fullName}</span>
                        <span className="text-[11px] text-muted-foreground">{f.village} &bull; {f.wheatAcreage || f.totalLandAcres} Acres</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Layer Selector */}
            <div className="flex bg-muted p-1 rounded-xl text-xs">
              <Button
                variant={activeLayer === 'HEALTH' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs font-semibold px-2.5"
                onClick={() => setActiveLayer('HEALTH')}
              >
                Health
              </Button>
              <Button
                variant={activeLayer === 'NDVI' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs font-semibold px-2.5"
                onClick={() => setActiveLayer('NDVI')}
              >
                NDVI
              </Button>
              <Button
                variant={activeLayer === 'STAGE' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs font-semibold px-2.5"
                onClick={() => setActiveLayer('STAGE')}
              >
                Stage
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real Interactive Leaflet Satellite Map */}
          <div className="lg:col-span-2">
            <DynamicFieldMap
              parcels={displayedParcels}
              cropCycles={cropCycles}
              farmers={farmers}
              selectedParcelId={selectedParcelId}
              onSelectParcel={(id) => setSelectedParcelId(id)}
              activeLayer={activeLayer}
            />
          </div>

          {/* Selected Farmer & Field Dossier Card */}
          <Card className="border shadow-xs flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3 border-b bg-muted/10">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    {selectedParcel?.parcelCode || 'Field Dossier'}
                  </Badge>
                  {selectedCycle && <StatusBadge status={selectedCycle.healthStatus} />}
                </div>
                <CardTitle className="text-base font-bold pt-1 text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  {selectedFarmer?.fullName || selectedParcel?.farmerName || 'Select a Farmer'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedFarmer?.village || selectedParcel?.village} &bull; {selectedFarmer?.district || 'Punjab'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-4 text-xs">
                {/* Farmer Contact & Land Summary */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-xl text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Mobile Phone:</span>
                    <p className="font-semibold text-foreground font-mono">{selectedFarmer?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Land:</span>
                    <p className="font-bold text-foreground">{selectedFarmer?.totalLandAcres || selectedParcel?.totalAcreage || 0} Acres</p>
                  </div>
                </div>

                {selectedCycle ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div>
                        <span className="text-[11px] text-muted-foreground">Seed Variety</span>
                        <p className="font-bold text-foreground">{selectedCycle.seedVariety}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground">Growth Stage</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {selectedCycle.currentStage.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="pt-1.5 border-t border-emerald-500/10">
                        <span className="text-[11px] text-muted-foreground">Satellite NDVI</span>
                        <p className="font-bold text-foreground">{selectedCycle.ndviScore} / 1.0</p>
                      </div>
                      <div className="pt-1.5 border-t border-emerald-500/10">
                        <span className="text-[11px] text-muted-foreground">Soil Moisture</span>
                        <p className="font-bold text-foreground">{selectedCycle.soilMoisturePct}%</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Expected Harvest Date</span>
                        <span className="font-medium text-foreground">{selectedCycle.expectedHarvestDate}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Yield Forecast</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {selectedCycle.expectedYieldMaundsPerAcre} Maunds/Ac ({(selectedCycle.expectedYieldMaundsPerAcre * selectedCycle.allocatedAcres * 0.04).toFixed(1)} Tons)
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Khasra Deed / Title</span>
                        <span className="font-mono text-foreground">{selectedParcel?.titleDeedOrKhasraNo || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Irrigation Source</span>
                        <span className="font-medium text-foreground">{selectedParcel?.irrigationSource.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    Select a farmer from the dropdown to view their crop stage and satellite health indicators.
                  </div>
                )}
              </CardContent>
            </div>

            <div className="p-3 border-t bg-muted/20 flex gap-2">
              <Link href="/admin/farmers" className="w-1/2">
                <Button variant="outline" size="sm" className="w-full text-[11px] font-semibold">
                  Farmers List
                </Button>
              </Link>
              <Link href="/admin/land-parcels" className="w-1/2">
                <Button variant="default" size="sm" className="w-full text-[11px] font-semibold">
                  Manage Parcels
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Wheat Phenology Stage Distribution */}
        <Card className="lg:col-span-2 border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Crop Stage Acreage Breakdown</CardTitle>
              <CardDescription className="text-xs">Live distribution of wheat crop acreage across phenological stages</CardDescription>
            </div>
            <Link href="/admin/crop-cycles">
              <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
                <span>View Cycles</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.8rem', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Acres`, 'Acreage']}
                  />
                  <Bar dataKey="acres" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Seed Variety Allocation Donut */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Seed Variety Allocation</CardTitle>
            <CardDescription className="text-xs">Certified seed bags distributed by variety</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={varietyChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {varietyChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={VARIETY_COLORS[index % VARIETY_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.8rem', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} Bags`, 'Quantity']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              {varietyChartData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: VARIETY_COLORS[idx % VARIETY_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{entry.name}:</span>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Activity Execution & Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Field Activity Adherence */}
        <Card className="border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Activity Adherence Trend</CardTitle>
            <CardDescription className="text-xs">Scheduled vs completed field sprays & irrigations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.8rem', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="scheduled" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} name="Scheduled" />
                  <Area type="monotone" dataKey="completed" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Field Activities Table */}
        <Card className="lg:col-span-2 border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold">Recent Field Agronomic Operations</CardTitle>
              <CardDescription className="text-xs">Live feed of verified sprays, fertilizer applications, and soil tests</CardDescription>
            </div>
            <Link href="/admin/activities">
              <Button variant="ghost" size="sm" className="text-xs h-8 gap-1">
                <span>View All ({activities.length})</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-muted shrink-0 text-muted-foreground">
                      {act.activityType.includes('IRRIGATION') ? (
                        <Droplets className="h-4 w-4 text-blue-500" />
                      ) : act.activityType.includes('FERTILIZER') ? (
                        <Sprout className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <CalendarCheck className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{act.farmerName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{act.dosageOrVolume || act.activityType}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">{act.scheduledDate}</span>
                    <StatusBadge status={act.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
