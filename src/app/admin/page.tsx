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
  ShieldAlert,
  Sun,
  Wind,
  Layers,
  Sparkles,
  Wheat,
  Activity,
  Calendar,
  CheckCircle2,
  Download,
  Gauge
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWeather } from '@/hooks/useWeather';
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
  DialogFooter
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { DynamicFieldMap } from '@/components/map/DynamicFieldMap';
import { toast } from 'sonner';
import { Farmer, LandParcel, CropCycle, FieldActivity } from '@/types';
import { useGetFarmersQuery, useCreateFarmerMutation } from '@/store/api/farmerApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
import { useGetCropCyclesQuery } from '@/store/api/cropCycleApi';
import { useGetActivitiesQuery, useCreateActivityMutation } from '@/store/api/activityApi';
import { useGetAllocationsQuery } from '@/store/api/allocationApi';
import { useGetSeedSuppliesQuery } from '@/store/api/seedApi';

export default function AdminDashboardPage() {
  const { data: apiFarmers = [] } = useGetFarmersQuery();
  const { data: apiFields = [] } = useGetFieldsQuery();
  const { data: apiCycles = [] } = useGetCropCyclesQuery();
  const { data: apiActivities = [] } = useGetActivitiesQuery();
  const { data: apiAllocations = [] } = useGetAllocationsQuery();
  const { data: apiSupplies = [] } = useGetSeedSuppliesQuery();

  const [createFarmerApi] = useCreateFarmerMutation();
  const [createActivityApi] = useCreateActivityMutation();
  const { current: liveWeather } = useWeather('Karnal');

  const farmers: Farmer[] = apiFarmers.map((f) => ({
    id: f.id,
    farmerCode: `FRM-${f.id.slice(0, 6)}`,
    fullName: f.name,
    fatherName: '',
    cnicOrId: '',
    mobile: f.mobile_number,
    village: f.village,
    unionCouncil: '',
    tehsil: f.block || '',
    district: f.district,
    totalLandAcres: 0,
    wheatAcreage: 0,
    createdDate: f.registration_date || '',
    status: f.status as any,
  }));

  const parcels: LandParcel[] = apiFields.map((p) => {
    const owner = farmers.find(f => f.id === p.farmer_id);
    const coords: [number, number][] = (p.polygon?.coordinates?.[0] as [number, number][]) || [];
    const polyBoundary = coords.map(([lng, lat]) => ({ lat, lng }));
    const center = polyBoundary.length > 0
      ? polyBoundary[0]
      : { lat: 30.9010, lng: 75.8573 };

    return {
      id: p.id,
      farmerId: p.farmer_id,
      farmerName: owner?.fullName || 'Enrolled Farmer',
      parcelCode: p.field_name || `FLD-${p.id.slice(0, 6)}`,
      titleDeedOrKhasraNo: `KHASRA-${p.id.slice(0, 5)}`,
      totalAcreage: p.area || 0,
      irrigationSource: 'CANAL_PLUS_TUBEWELL',
      soilType: ((p as any).soil_type as any) || 'ALLUVIAL',
      phLevel: 7.2,
      organicMatterPct: 0.75,
      polygonColor: (p.polygon_color as any) || 'GREEN',
      village: p.village || owner?.village || '',
      district: p.district || owner?.district || '',
      centerCoordinates: center,
      polygonBoundary: polyBoundary,
      verificationStatus: 'VERIFIED',
      polygon: p.polygon,
    };
  });

  const cropCycles: CropCycle[] = apiCycles.map((c) => {
    const owner = farmers.find(f => f.id === c.farmer_id);
    const parcel = parcels.find(p => p.id === c.field_id);
    return {
      id: c.id,
      cycleCode: c.cycle_code,
      farmerId: c.farmer_id,
      farmerName: owner?.fullName || 'Enrolled Farmer',
      fieldParcelId: c.field_id,
      parcelCode: parcel?.parcelCode || 'Field Plot',
      season: (c.season as any) || 'RABI_2025_2026',
      seedVariety: (c.variety as any) || 'HD-2967',
      sowingDate: c.sowing_date || '',
      sowingMethod: (c.sowing_method as any) || 'DRILL_SOWING',
      allocatedAcres: c.allocated_acres || 0,
      currentStage: (c.stage as any) || 'SOWING',
      currentStageDays: 1,
      healthStatus: (c.health_status as any) || 'OPTIMAL',
      estimatedHarvestDate: c.expected_harvest_date || '',
      expectedYieldMaundsPerAcre: c.expected_yield_maunds_per_acre || 0,
      actualYieldMaundsTotal: null,
      latestNdvi: c.ndvi_score || 0,
      soilMoisturePercent: c.soil_moisture_pct || 0,
      ndviScore: c.ndvi_score || 0,
      soilMoisturePct: c.soil_moisture_pct || 0,
      expectedHarvestDate: c.expected_harvest_date || '',
      notes: c.remarks || '',
      createdAt: c.created_at || '',
      updatedAt: '',
    };
  });

  const activities: FieldActivity[] = apiActivities.map((a) => {
    const owner = farmers.find(f => f.id === a.farmer_id);
    return {
      id: a.id,
      cropCycleId: a.crop_cycle_id || '',
      farmerId: a.farmer_id,
      farmerName: owner?.fullName || 'Enrolled Farmer',
      fieldParcelId: a.field_id || '',
      activityType: (a.activity_type as any) || 'IRRIGATION',
      scheduledDate: a.scheduled_date || '',
      executedDate: a.executed_date || undefined,
      status: (a.status as any) || 'SCHEDULED',
      dosageOrVolume: a.dosage_or_volume || '',
      cost: a.cost || 0,
      loggedByRole: (a.logged_by_role as any) || 'ADMIN',
      loggedByName: a.logged_by_name || 'Admin',
      notes: a.notes || '',
      recommendationAdherence: a.recommendation_adherence ?? true,
    };
  });

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
  const [quickFarmerOpen, setQuickFarmerOpen] = useState(false);
  const [quickActivityOpen, setQuickActivityOpen] = useState(false);

  // Quick Farmer Form State
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerMobile, setNewFarmerMobile] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('');
  const [newFarmerDistrict, setNewFarmerDistrict] = useState('Ludhiana');

  // Quick Activity Form State
  const [actFarmerId, setActFarmerId] = useState(farmers[0]?.id || '');
  const [actType, setActType] = useState('IRRIGATION');
  const [actDosage, setActDosage] = useState('3 Acre Inches Canal Irrigation');

  // Aggregated KPIs
  const totalFarmers = farmers.length;
  const totalWheatAcreage = parcels.reduce((sum, p) => sum + (p.totalAcreage || 0), 0);
  const totalSeedBagsDistributed = apiAllocations.reduce((sum: number, d: any) => sum + (d.quantity || 0), 0);
  const totalYieldForecastMaunds = cropCycles.reduce((sum, c) => sum + ((c.expectedYieldMaundsPerAcre || 0) * c.allocatedAcres), 0);

  // Chart 1: Stage Distribution Data
  const stageCounts: Record<string, number> = {};
  cropCycles.forEach((c) => {
    const stageName = (c.currentStage || '').replace(/_/g, ' ');
    stageCounts[stageName] = (stageCounts[stageName] || 0) + c.allocatedAcres;
  });
  const stageChartData = Object.entries(stageCounts).map(([name, acres]) => ({ name, acres }));

  // Chart 2: Variety Allocation Donut Data
  const varietyCounts: Record<string, number> = {};
  apiSupplies.forEach((s: any) => {
    varietyCounts[s.variety] = (varietyCounts[s.variety] || 0) + (s.quantity || 0);
  });
  const VARIETY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
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

  const handleQuickAddFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName || newFarmerName.trim().length === 0) {
      toast.error('Mandatory field required: Farmer full name is required');
      return;
    }
    if (!newFarmerMobile || newFarmerMobile.trim().length === 0) {
      toast.error('Mandatory field required: 10-digit mobile number is required');
      return;
    }
    try {
      await createFarmerApi({
        name: newFarmerName.trim(),
        mobile_number: newFarmerMobile.trim(),
        village: newFarmerVillage.trim() || 'Gill Kalan',
        district: newFarmerDistrict,
        state: 'Punjab',
        status: 'ACTIVE',
      }).unwrap();
      toast.success(`Farmer ${newFarmerName} registered successfully in database!`);
      setQuickFarmerOpen(false);
      setNewFarmerName('');
      setNewFarmerMobile('');
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to register farmer');
    }
  };

  const handleQuickAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actFarmerId) {
      toast.error('Mandatory field required: Please select a registered farmer');
      return;
    }
    const selFarmer = farmers.find(f => f.id === actFarmerId) || farmers[0];
    const farmerParcel = parcels.find(p => p.farmerId === selFarmer.id);

    try {
      await createActivityApi({
        farmer_id: selFarmer.id,
        field_id: farmerParcel?.id || null,
        activity_type: actType,
        scheduled_date: new Date().toISOString().split('T')[0],
        dosage_or_volume: actDosage,
        cost: 4500,
        notes: 'Recorded via quick action logger.',
        logged_by_name: 'Admin User',
        logged_by_role: 'ADMIN',
      }).unwrap();
      toast.success(`Activity logged for ${selFarmer.fullName}!`);
      setQuickActivityOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to log activity');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Hero / Executive Command Center Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-card to-background border border-emerald-500/20 p-6 sm:p-7 shadow-xs">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold gap-1.5 py-1 px-3 rounded-full text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Rabi Season 2026-27 Active
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[11px] font-mono rounded-full px-2.5">
                Satellite GPS Sat-Lock Live
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
              Wheat Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Real-time oversight across certified seed distribution, phenological growth stages, satellite NDVI health metrics, and field execution logs.
            </p>
          </div>

          {/* Weather & Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 text-xs shadow-xs">
              <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-600">
                <Sun className="h-4 w-4 shrink-0" />
              </div>
              <div>
                <span className="font-extrabold text-foreground font-mono">
                  {liveWeather ? `${liveWeather.temperature}°C` : '27°C'}
                </span>
                <span className="text-[10px] text-muted-foreground block font-medium">
                  {liveWeather ? `${liveWeather.condition} • Karnal` : 'Live Weather'}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setQuickFarmerOpen(true)}
              className="gap-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-sm shadow-emerald-600/20 px-4 py-2 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              Register Farmer
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickActivityOpen(true)}
              className="gap-1.5 text-xs font-bold rounded-xl bg-card hover:bg-muted/80 text-foreground border-border/80 px-4 py-2 cursor-pointer transition-all"
            >
              <Activity className="h-4 w-4 text-emerald-600" />
              Log Activity
            </Button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Registered Farmers"
          value={totalFarmers}
          subtitle="Verified Grower Registry"
          icon={Users}
          variant="primary"
          trend={{ value: '18%', isPositive: true, label: 'vs last Rabi' }}
        />
        <MetricCard
          title="Monitored Wheat Area"
          value={`${totalWheatAcreage.toFixed(1)} Ac`}
          subtitle={`${parcels.length} GPS Verified Plots`}
          icon={MapPin}
          variant="info"
          trend={{ value: '24%', isPositive: true, label: 'acreage growth' }}
        />
        <MetricCard
          title="Certified Seed Bags"
          value={totalSeedBagsDistributed}
          subtitle="HD-2967 & HD-3086 Varieties"
          icon={Package}
          variant="warning"
          trend={{ value: '100%', isPositive: true, label: 'target reached' }}
        />
        <MetricCard
          title="Yield Forecast"
          value={`${(totalYieldForecastMaunds * 0.04).toFixed(0)} Tons`}
          subtitle="Avg 51.4 Maunds / Acre"
          icon={TrendingUp}
          variant="secondary"
          trend={{ value: '8.4%', isPositive: true, label: 'above state avg' }}
        />
      </div>

      {/* Live GIS Satellite Agricultural Map Section */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl bg-card border shadow-xs">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              GIS Satellite Cadastral Map & Crop Monitoring
            </h3>
            <p className="text-xs text-muted-foreground">
              Select a farmer to zoom into their verified GPS plot and inspect vegetative NDVI health
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Layer Buttons */}
            <div className="flex items-center bg-muted/70 p-0.5 rounded-lg border border-border/60 text-xs">
              <Button
                type="button"
                variant={activeLayer === 'HEALTH' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveLayer('HEALTH')}
                className={`h-7 px-2.5 text-xs font-semibold ${
                  activeLayer === 'HEALTH' ? 'shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-muted-foreground'
                }`}
              >
                Health
              </Button>
              <Button
                type="button"
                variant={activeLayer === 'NDVI' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveLayer('NDVI')}
                className={`h-7 px-2.5 text-xs font-semibold ${
                  activeLayer === 'NDVI' ? 'shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-muted-foreground'
                }`}
              >
                NDVI
              </Button>
              <Button
                type="button"
                variant={activeLayer === 'STAGE' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveLayer('STAGE')}
                className={`h-7 px-2.5 text-xs font-semibold ${
                  activeLayer === 'STAGE' ? 'shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-muted-foreground'
                }`}
              >
                Stage
              </Button>
            </div>

            {/* Farmer Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60">
              <SearchableSelect
                options={[
                  { value: 'ALL', label: `🌍 All Farmers (${farmers.length} Enrolled Plots)` },
                  ...farmers.map((f) => ({
                    value: f.id,
                    label: f.fullName,
                    subLabel: `${f.village} • ${f.wheatAcreage || f.totalLandAcres} Acres`,
                  })),
                ]}
                value={selectedFarmerId}
                onChange={(v) => v && handleFarmerSelect(v)}
                placeholder="Select Farmer..."
                searchPlaceholder="Search farmer by name, village..."
                className="h-8 text-xs min-w-[220px] sm:min-w-[260px] bg-background font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Interactive Leaflet Satellite Map */}
          <div className="lg:col-span-2 rounded-xl overflow-hidden border shadow-xs bg-card">
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
          <Card className="border shadow-xs flex flex-col justify-between bg-card">
            <div>
              <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                    {selectedParcel?.parcelCode || 'Field Dossier'}
                  </Badge>
                  {selectedCycle && <StatusBadge status={selectedCycle.healthStatus} />}
                </div>
                <CardTitle className="text-base font-bold pt-1 text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  {selectedFarmer?.fullName || selectedParcel?.farmerName || 'Select a Farmer'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedFarmer?.village || selectedParcel?.village} &bull; {selectedFarmer?.district || 'Punjab'}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4 space-y-3.5 text-xs">
                {/* Farmer Contact & Land Summary */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-muted/40 rounded-xl text-[11px]">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Mobile Phone</span>
                    <p className="font-semibold text-foreground font-mono">{selectedFarmer?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold block">Total Plot Area</span>
                    <p className="font-bold text-foreground font-mono">{selectedFarmer?.totalLandAcres || selectedParcel?.totalAcreage || 0} Acres</p>
                  </div>
                </div>

                {selectedCycle ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Seed Variety</span>
                        <p className="font-bold text-foreground">🌾 {selectedCycle.seedVariety}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Growth Stage</span>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {selectedCycle.currentStage.replace(/_/g, ' ')}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-emerald-500/10">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Satellite NDVI</span>
                        <p className="font-mono font-bold text-foreground">{selectedCycle.ndviScore} / 1.0</p>
                      </div>
                      <div className="pt-2 border-t border-emerald-500/10">
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Soil Moisture</span>
                        <p className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedCycle.soilMoisturePct}%</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Expected Harvest Date</span>
                        <span className="font-mono font-semibold text-foreground">{selectedCycle.expectedHarvestDate || 'March 2026'}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Yield Forecast</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {selectedCycle.expectedYieldMaundsPerAcre || 0} Maunds/Ac ({((selectedCycle.expectedYieldMaundsPerAcre || 0) * selectedCycle.allocatedAcres * 0.04).toFixed(1)} Tons)
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
                    Select a farmer from dropdown to inspect their crop stage and satellite health indicators.
                  </div>
                )}
              </CardContent>
            </div>

            <div className="p-3 border-t bg-muted/20 flex gap-2">
              <Link href="/admin/farmers" className="w-1/2">
                <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                  Farmers List
                </Button>
              </Link>
              <Link href="/admin/land-parcels" className="w-1/2">
                <Button variant="default" size="sm" className="w-full text-xs font-semibold">
                  Manage Parcels
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Wheat Phenology Stage Distribution */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="text-base font-bold">Crop Stage Acreage Breakdown</CardTitle>
              <CardDescription className="text-xs">Live distribution of wheat crop acreage across phenological stages</CardDescription>
            </div>
            <Link href="/admin/crop-cycles">
              <Button variant="ghost" size="sm" className="text-xs h-8 gap-1 font-semibold">
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
                  <Bar dataKey="acres" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Seed Variety Allocation Donut */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-bold">Seed Variety Allocation</CardTitle>
            <CardDescription className="text-xs">Certified seed bags distributed by variety</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={varietyChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
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

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
              {varietyChartData.map((entry, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: VARIETY_COLORS[idx % VARIETY_COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{entry.name}:</span>
                  <span className="font-semibold font-mono">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Activity Execution & Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Field Activity Adherence */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-bold">Activity Adherence Trend</CardTitle>
            <CardDescription className="text-xs">Scheduled vs completed field sprays & irrigations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.8rem', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="scheduled" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} name="Scheduled" />
                  <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Field Activities Table */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="text-base font-bold">Recent Field Agronomic Operations</CardTitle>
              <CardDescription className="text-xs">Live feed of verified sprays, fertilizer applications, and soil tests</CardDescription>
            </div>
            <Link href="/admin/activities">
              <Button variant="ghost" size="sm" className="text-xs h-8 gap-1 font-semibold">
                <span>View All ({activities.length})</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="divide-y divide-border/60">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-muted/20 px-2 rounded-lg transition-colors">
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
                    <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">{act.scheduledDate}</span>
                    <StatusBadge status={act.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Farmer Register Dialog */}
      <Dialog open={quickFarmerOpen} onOpenChange={setQuickFarmerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Quick Register Farmer</DialogTitle>
            <DialogDescription className="text-xs">
              Quickly register a grower into the state agriculture platform.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickAddFarmer} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Farmer Full Name *</Label>
              <Input
                placeholder="e.g. Sardar Gurpreet Singh"
                value={newFarmerName}
                onChange={(e) => setNewFarmerName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Mobile Number *</Label>
              <Input
                placeholder="e.g. 9814054321"
                value={newFarmerMobile}
                onChange={(e) => setNewFarmerMobile(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Village</Label>
                <Input
                  placeholder="e.g. Gill Kalan"
                  value={newFarmerVillage}
                  onChange={(e) => setNewFarmerVillage(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">District</Label>
                <Input
                  value={newFarmerDistrict}
                  onChange={(e) => setNewFarmerDistrict(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setQuickFarmerOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Register Farmer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Activity Dialog */}
      <Dialog open={quickActivityOpen} onOpenChange={setQuickActivityOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Log Agronomic Field Activity</DialogTitle>
            <DialogDescription className="text-xs">
              Record spray, fertilizer application, or irrigation for wheat parcels.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickAddActivity} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Farmer *</Label>
              <SearchableSelect
                options={farmers.map((f) => ({
                  value: f.id,
                  label: f.fullName,
                  subLabel: `${f.village} (${f.district || 'Punjab'}) • ${f.mobile || ''}`,
                }))}
                value={actFarmerId}
                onChange={(v) => v && setActFarmerId(v)}
                placeholder="Choose farmer..."
                searchPlaceholder="Search farmer by name, village..."
                className="w-full text-xs font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Activity Type</Label>
              <Select value={actType} onValueChange={(v) => v && setActType(v)}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select type">
                    {actType === 'IRRIGATION' ? 'Irrigation / Watering' : actType === 'FERTILIZER_APPLICATION' ? 'Fertilizer (Urea / DAP)' : actType === 'PEST_CONTROL' ? 'Pesticide / Weedicide Spray' : actType === 'SOIL_TEST' ? 'Soil Testing' : actType}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IRRIGATION">Irrigation / Watering</SelectItem>
                  <SelectItem value="FERTILIZER_APPLICATION">Fertilizer (Urea / DAP)</SelectItem>
                  <SelectItem value="PEST_CONTROL">Pesticide / Weedicide Spray</SelectItem>
                  <SelectItem value="SOIL_TEST">Soil Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dosage / Details</Label>
              <Input
                value={actDosage}
                onChange={(e) => setActDosage(e.target.value)}
                placeholder="e.g. 45 kg Urea / Acre"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setQuickActivityOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Save Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
