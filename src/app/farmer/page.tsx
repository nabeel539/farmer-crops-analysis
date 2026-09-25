'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StageProgressBar } from '@/components/shared/StageProgressBar';
import { FarmerShell } from '@/components/farmer/FarmerShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Wheat,
  CreditCard,
  Sun,
  CloudRain,
  ShieldAlert,
  Sprout,
  Droplets,
  BookOpen,
  Volume2,
  Phone,
  QrCode,
  ArrowRight,
  Sparkles,
  Camera,
  Send,
  Home,
  FileText,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Thermometer,
  Wind,
  PhoneCall,
  CalendarCheck,
  AlertTriangle,
  Download,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { MOCK_ADVISORIES, MOCK_WEATHER_FORECAST } from '@/data/mockData';
import { addActivity } from '@/store/slices/activitiesSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';


export default function FarmerPortalPage() {
  const dispatch = useAppDispatch();
  const farmers = useAppSelector((state) => state.farmers.farmers);
  const distributions = useAppSelector((state) => state.seedDistributions.distributions);
  const cropCycles = useAppSelector((state) => state.cropCycles.cycles);
  const activities = useAppSelector((state) => state.activities.activities);
  const parcels = useAppSelector((state) => state.landParcels.parcels);

  // Active Farmer Persona: Sardar Gurpreet Singh (FARM-2026-001)
  const currentFarmer = farmers[0] || {
    id: 'FARM-001',
    farmerCode: 'FARM-2026-001',
    fullName: 'Sardar Gurpreet Singh',
    fatherName: 'Harbhajan Singh',
    cnicOrId: '9845-2341-8910',
    mobile: '+91 98140-54321',
    village: 'Gill Kalan',
    unionCouncil: 'Panchayat-Gill',
    tehsil: 'Ludhiana West',
    district: 'Ludhiana',
    totalLandAcres: 12.5,
    wheatAcreage: 10.0,
    status: 'ACTIVE',
    createdDate: '2025-09-15'
  };

  const farmerDistributions = distributions.filter(d => d.farmerId === currentFarmer.id);
  const farmerCycle = cropCycles.find(c => c.farmerId === currentFarmer.id) || cropCycles[0];
  const farmerParcels = parcels.filter(p => p.farmerId === currentFarmer.id);
  const farmerActivities = activities.filter(a => a.farmerId === currentFarmer.id);
  const nextActivity = farmerActivities.find(a => a.status === 'PENDING') || activities[0];

  const [activeTab, setActiveTab] = useState<string>('CROP_STATUS');
  const [problemQuery, setProblemQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlayingTitle, setCurrentPlayingTitle] = useState('');

  // New operation form state
  const [newOpType, setNewOpType] = useState('IRRIGATION');
  const [newOpDose, setNewOpDose] = useState('3 Acre Inches Canal Water');
  const [newOpNotes, setNewOpNotes] = useState('');

  const handleAudioAdvice = (title: string, adviceText: string) => {
    setIsPlayingAudio(true);
    setCurrentPlayingTitle(title);
    toast.info(`Playing Voice Guidance: "${title}"`, {
      description: adviceText.slice(0, 80) + '...'
    });
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3500);
  };

  // Activity Modal Dialog State with Date & Time
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actTime, setActTime] = useState(new Date().toTimeString().slice(0, 5));
  const [actParcelId, setActParcelId] = useState(farmerParcels[0]?.id || 'PRCL-001');
  const [actType, setActType] = useState('FERTILIZER_UREA');
  const [actDosage, setActDosage] = useState('1 Bag (50kg) Urea / Acre (18 Bags Total - 900 Kg)');
  const [actCost, setActCost] = useState('4800');
  const [actNotes, setActNotes] = useState('Applied with 2nd irrigation at tillering stage for root growth.');

  const handleTypeChange = (newType: string) => {
    setActType(newType);
    if (newType === 'FERTILIZER_UREA') {
      setActDosage('1 Bag (50kg) Urea / Acre (18 Bags Total - 900 Kg)');
      setActCost('4800');
      setActNotes('Applied with 2nd irrigation at tillering stage for root growth.');
    } else if (newType === 'FERTILIZER_DAP') {
      setActDosage('1.5 Bags DAP / Acre (27 Bags Total - 1350 Kg)');
      setActCost('36000');
      setActNotes('Basal application at seed bed preparation time.');
    } else if (newType === 'IRRIGATION') {
      setActDosage('3 Acre Inches Canal Irrigation');
      setActCost('1500');
      setActNotes('Sirhind canal turn watering completed on time.');
    } else if (newType === 'PESTICIDE_SPRAY') {
      setActDosage('Tilt / Propiconazole 25 EC @ 200ml / Acre');
      setActCost('3200');
      setActNotes('Preventive spray for Stripe/Yellow Rust control.');
    } else if (newType === 'WEEDICIDE_SPRAY') {
      setActDosage('Topic 15 WP @ 160g / Acre');
      setActCost('2400');
      setActNotes('Spray for Phalaris minor (Gulli Danda) control.');
    } else {
      setActDosage('Standard Agronomic Practice');
      setActCost('1000');
      setActNotes('');
    }
  };

  const handleCreateFarmerActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actType) {
      toast.error('Mandatory field required: Activity type is required');
      return;
    }
    if (!actDosage || actDosage.trim().length === 0) {
      toast.error('Mandatory field required: Dosage / inputs description is required');
      return;
    }
    if (!actDate) {
      toast.error('Mandatory field required: Activity execution date is required');
      return;
    }

    const newActId = `ACT-FARM-${Date.now().toString().slice(-4)}`;
    const parcel = parcels.find(p => p.id === actParcelId) || farmerParcels[0];
    
    dispatch(addActivity({
      id: newActId,
      cropCycleId: farmerCycle?.id || 'CYCLE-001',
      farmerId: currentFarmer.id,
      farmerName: currentFarmer.fullName,
      fieldParcelId: parcel?.id || 'PRCL-001',
      activityType: actType as any,
      scheduledDate: actDate,
      executedDate: `${actDate} at ${actTime}`,
      status: 'COMPLETED',
      dosageOrVolume: actDosage,
      cost: Number(actCost) || 0,
      recommendationAdherence: true,
      loggedByRole: 'FARMER',
      loggedByName: `${currentFarmer.fullName} (Self Logged)`,
      notes: actNotes ? `${actNotes} (Logged at ${actTime})` : `Activity executed on ${actDate} at ${actTime}`
    }));

    toast.success('Field activity logged successfully with Date & Time!');
    setActivityModalOpen(false);
    setActNotes('');
  };


  const handleSendCropDoctorQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemQuery || problemQuery.trim().length === 0) {
      toast.error('Mandatory field required: Please describe your crop problem or disease symptoms');
      return;
    }
    toast.success('Disease query & leaf photo sent to Field Officer Muhammad Asif (Response expected in 30 mins)');
    setProblemQuery('');
  };

  return (
    <FarmerShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      farmerName={currentFarmer.fullName}
      farmerCode={currentFarmer.farmerCode}
      village={currentFarmer.village}
    >
      {/* 1. Hero Crop Cycle Overview Header */}
      <section className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600/15 via-emerald-600/5 to-transparent border border-emerald-600/25 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/30 text-xs font-bold">
                Rabi Season 2025-26 (Active)
              </Badge>
              <StatusBadge status={farmerCycle.healthStatus} />
              <Badge variant="secondary" className="font-mono text-xs">
                Plot #{farmerParcels[0]?.titleDeedOrKhasraNo || '412/1'}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span>{farmerCycle.seedVariety} Wheat Crop</span>
              <span className="text-sm font-normal text-muted-foreground font-mono">({farmerCycle.allocatedAcres} Acres Monitored)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Sown on: <span className="font-semibold text-foreground">{farmerCycle.sowingDate}</span> &bull; Target Harvest: <span className="font-bold text-emerald-600">{farmerCycle.expectedHarvestDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => setActivityModalOpen(true)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Record Activity</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAudioAdvice('Weather Advisory', 'Weather forecast indicates dry conditions for next 48 hours. Light irrigation recommended after top-dress fertilization.')}
              className="gap-1.5 border-emerald-600/30 hover:bg-emerald-600/10 text-xs font-semibold cursor-pointer"
            >
              <Volume2 className="h-4 w-4 text-emerald-600" />
              <span>Voice Guidance</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('DOCTOR')}
              className="gap-1.5 border-emerald-600/30 hover:bg-emerald-600/10 text-xs font-semibold cursor-pointer"
            >
              <Camera className="h-4 w-4 text-emerald-600" />
              <span>Diagnose Leaf</span>
            </Button>
          </div>
        </div>

        {/* 11-Stage Interactive Phenology Timeline */}
        <div className="pt-2 border-t border-border/60">
          <StageProgressBar currentStage={farmerCycle.currentStage} />
        </div>
      </section>

      {/* 2. Four Key Agronomic KPI Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border shadow-2xs bg-card hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Wheat Acreage</span>
              <Sprout className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {farmerCycle.allocatedAcres} <span className="text-xs font-normal text-muted-foreground">Acres</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">100% Laser Levelled Plot</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Crop Growth Stage</span>
              <Sprout className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              Heading Stage
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Stage 7 of 11 • Flowering Active</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">NDVI Health</span>
              <ActivityIcon className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {farmerCycle.ndviScore} <span className="text-xs font-bold text-emerald-600">(Optimal)</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Satellite Vigour: High Biomass</p>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs bg-card hover:border-emerald-500/40 transition-colors">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Yield Forecast</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground">
              {farmerCycle.expectedYieldMaundsPerAcre} <span className="text-xs font-normal text-muted-foreground">Mnds/Ac</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">+18% above district average</p>
          </CardContent>
        </Card>
      </section>

      {/* 3. TAB VIEWS CONTENT */}

      {/* TAB 1: CROP STATUS OVERVIEW */}
      {activeTab === 'CROP_STATUS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Next Required Field Action */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-2 border-emerald-600/40 bg-emerald-600/5 shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-emerald-600" />
                      Priority Agronomic Action
                    </span>
                    <Badge variant="outline" className="font-mono text-[11px] bg-background">
                      Due Date: {nextActivity?.scheduledDate || '2026-02-28'}
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg font-bold pt-1 text-foreground">
                    {nextActivity?.activityType.replace(/_/g, ' ') || '3rd Irrigation & Foliar Potash Spray'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-muted-foreground text-sm">
                    {nextActivity?.dosageOrVolume || '3 Acre Inches Canal Irrigation + 1kg/Acre Soluble SOP Potash spray during heading stage.'}
                  </p>
                  <div className="p-3 bg-card border border-border/80 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs block uppercase tracking-wider">
                      Agronomist Recommendation:
                    </span>
                    <p className="text-xs text-foreground/90 leading-relaxed">
                      Maintain optimal soil moisture during heading and grain filling. Avoid irrigating during high wind speeds to prevent crop lodging.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => handleAudioAdvice('Irrigation Guidelines', 'Maintain light irrigation during heading and flowering stage. Avoid over-flooding during gusty winds.')}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Listen Voice Note
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success('Activity marked as completed by grower!');
                      }}
                      className="gap-1 text-xs font-semibold cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Mark Done
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Crop Phenology & Weather Synergy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-amber-500" />
                      Soil & Root Zone Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Soil Moisture Level:</span>
                      <span className="font-bold text-emerald-600">28% (Adequate)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Soil pH / Salinity:</span>
                      <span className="font-semibold">7.8 pH &bull; EC 1.8 dS/m</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Canal Turn (Wara-Bandi):</span>
                      <span className="font-bold font-mono">Tuesday 04:00 AM</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Fertilizer Balance:</span>
                      <span className="font-semibold text-primary">N:P:K 120-90-60</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Sun className="h-4 w-4 text-amber-500" />
                      Current Weather & Spray Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Temperature Range:</span>
                      <span className="font-bold font-mono">26°C / 12°C</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Wind Velocity:</span>
                      <span className="font-semibold">10 km/h (Low)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                      <span className="text-muted-foreground">Foliar Spray Suitability:</span>
                      <span className="font-bold text-emerald-600">Highly Favorable</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Rain Forecast:</span>
                      <span className="font-semibold">0% Chance in 48h</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Quick Passbook + Fast Disease Reporter */}
            <div className="space-y-4">
              {/* Quick Field Operations Summary Card */}
              <Card className="border shadow-xs">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-emerald-600" />
                      Field Activity Summary
                    </CardTitle>
                    <CardDescription className="text-xs">Logged farm operations</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('OPERATIONS')}
                    className="text-xs h-7 text-emerald-600 font-semibold cursor-pointer"
                  >
                    View All →
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {farmerActivities.slice(0, 2).map((act) => (
                    <div key={act.id} className="p-2.5 rounded-xl bg-muted/60 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span className="text-foreground">{act.activityType.replace(/_/g, ' ')}</span>
                        <Badge className="bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-0 text-[10px]">
                          {act.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Quantity / Dosage:</span>
                        <span className="font-mono font-semibold text-foreground">{act.dosageOrVolume}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t">
                        <span>Executed Date:</span>
                        <span>{act.executedDate || act.scheduledDate}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Ask Crop Doctor */}
              <Card className="border shadow-xs bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Ask Agronomist / Report Disease
                  </CardTitle>
                  <CardDescription className="text-xs">Direct photo & voice query to Field Officer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Describe any yellow spots, pest attacks or ask spray questions..."
                    value={problemQuery}
                    onChange={(e) => setProblemQuery(e.target.value)}
                    className="text-xs min-h-[70px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Camera snapshot captured (Wheat leaf sample)')}
                      className="w-1/2 text-xs gap-1.5 cursor-pointer font-semibold"
                    >
                      <Camera className="h-3.5 w-3.5 text-emerald-600" />
                      Take Photo
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSendCropDoctorQuery}
                      className="w-1/2 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send Query
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LAND PARCELS & GPS */}
      {activeTab === 'PARCELS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground">Registered Land Parcels & Deeds</h3>
              <p className="text-xs text-muted-foreground">Khasra land titles, GPS boundaries & soil parameters</p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-emerald-600 bg-emerald-500/10">
              {farmerParcels.length > 0 ? farmerParcels.length : 2} Verified Parcels
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600">
                    PRCL-001
                  </Badge>
                  <Badge variant="default" className="text-[10px] bg-emerald-600">GPS Verified</Badge>
                </div>
                <CardTitle className="text-base font-bold pt-1">Khasra # 412/1 (6.0 Acres)</CardTitle>
                <CardDescription className="text-xs font-mono">Gill Kalan &bull; Tehsil Ludhiana West</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Soil Texture:</span>
                    <span className="font-semibold">Clay Loam (Rich Alluvial)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Organic Matter:</span>
                    <span className="font-semibold text-emerald-600">0.95% (Optimal)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">GPS Center Point:</span>
                    <span className="font-mono font-semibold">30.9010° N, 75.8573° E</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Irrigation Source:</span>
                    <span className="font-semibold">Sirhind Canal + Solar Tube-well</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono bg-emerald-500/10 text-emerald-600">
                    PRCL-002
                  </Badge>
                  <Badge variant="default" className="text-[10px] bg-emerald-600">GPS Verified</Badge>
                </div>
                <CardTitle className="text-base font-bold pt-1">Khasra # 412/2 (4.0 Acres)</CardTitle>
                <CardDescription className="text-xs font-mono">Gill Kalan &bull; Tehsil Ludhiana West</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Soil Texture:</span>
                    <span className="font-semibold">Silt Loam</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Organic Matter:</span>
                    <span className="font-semibold text-emerald-600">0.82%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">GPS Center Point:</span>
                    <span className="font-mono font-semibold">30.9032° N, 75.8590° E</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Irrigation Source:</span>
                    <span className="font-semibold">Canal Water (Tuesday Turn)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}



      {/* TAB 4: FIELD OPERATIONS & LOGS */}
      {activeTab === 'OPERATIONS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg text-foreground">Field Operations & Agronomic History</h3>
              <p className="text-xs text-muted-foreground">Chronological log of Rauni, basal fertilization, weeding, and splits</p>
            </div>
            <Button
              size="sm"
              onClick={() => setActivityModalOpen(true)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs font-bold cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Log New Activity</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activities Timeline */}
            <div className="lg:col-span-2 space-y-3">
              {farmerActivities.map((act) => (
                <Card key={act.id} className="border shadow-2xs hover:border-emerald-500/40 transition-colors">
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {act.activityType.includes('IRRIGATION') ? (
                          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
                            <Droplets className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                            <Sprout className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{act.activityType.replace(/_/g, ' ')}</h4>
                          <span className="text-[11px] text-muted-foreground font-mono">Executed: {act.executedDate || act.scheduledDate}</span>
                        </div>
                      </div>
                      <StatusBadge status={act.status} />
                    </div>

                    <div className="p-3 bg-muted/60 rounded-xl space-y-2 border border-border/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                          <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                          Quantity & Dosage (मात्रा):
                        </span>
                        <Badge className="bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 text-xs font-bold font-mono py-0.5 px-2">
                          {act.dosageOrVolume}
                        </Badge>
                      </div>

                      {act.cost && act.cost > 0 ? (
                        <div className="flex justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                          <span>Total Cost / कुल खर्च:</span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            ₹ {act.cost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ) : null}

                      {act.notes && (
                        <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-border/50">
                          "{act.notes}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Self Activity Log CTA Card */}
            <div>
              <Card className="border shadow-xs sticky top-20 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/25">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-emerald-600" />
                    Record Completed Operation
                  </CardTitle>
                  <CardDescription className="text-xs">Log urea top-dressing, irrigation or spray</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-1">
                  <p className="text-xs text-muted-foreground">
                    Click below to open the complete field log with exact execution date, time, and plot details.
                  </p>

                  <Button
                    onClick={() => setActivityModalOpen(true)}
                    className="w-full text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm h-9"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Record Activity with Date & Time</span>
                  </Button>

                  <div className="p-3 bg-muted/50 rounded-xl space-y-1.5 text-[11px] border border-border/60">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      Agronomy Advice Tip
                    </span>
                    <p className="text-muted-foreground">
                      Ensure nitrogen split is followed by irrigation within 24 hours to maximize crown root uptake.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CROP DOCTOR & DISEASE SCANNER */}
      {activeTab === 'DOCTOR' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground">Wheat Disease Doctor & Leaf Diagnostics</h3>
              <p className="text-xs text-muted-foreground">AI diagnosis for Stripe Rust, Aphids, and direct agronomist hotline</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Dialing Punjab Agriculture Helpline 0800-15000...')}
                className="gap-1.5 text-xs text-emerald-700 border-emerald-600/30 cursor-pointer"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                <span>Call 0800-15000</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Camera Leaf Scanner */}
            <Card className="border shadow-xs space-y-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-emerald-600" />
                  Visual Leaf Scanner
                </CardTitle>
                <CardDescription className="text-xs">Take a clear photo of wheat leaves showing yellow powder or drying</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-48 rounded-2xl bg-muted/70 border-2 border-dashed border-border/80 flex flex-col items-center justify-center text-center p-4 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-foreground block">Capture Wheat Leaf Photo</span>
                    <span className="text-[11px] text-muted-foreground">Position camera 10cm from affected leaf</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => toast.success('Camera opened. Leaf scanned: No Rust detected (Health: Optimal)')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold"
                  >
                    Open Camera & Scan
                  </Button>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-xs space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 block">Common Wheat Threats in Rabi:</span>
                  <ul className="list-disc list-inside text-muted-foreground space-y-0.5 text-[11px]">
                    <li><strong>Yellow / Stripe Rust:</strong> Yellow pustules/stripes on leaves. Spray Nativo or Tilt fungicide.</li>
                    <li><strong>Aphids / Sucking Pests:</strong> Green/black colonies on wheat spikes during milk stage.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Direct Query to Field Officer */}
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Message Officer Muhammad Asif
                </CardTitle>
                <CardDescription className="text-xs">Direct WhatsApp & Voice query to your assigned Field Officer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-700 flex items-center justify-center font-bold">
                      MA
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Muhammad Asif</h4>
                      <p className="text-[11px] text-muted-foreground font-mono">Field Officer &bull; 0300-7654321</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    Online
                  </Badge>
                </div>

                <form onSubmit={handleSendCropDoctorQuery} className="space-y-3">
                  <Textarea
                    value={problemQuery}
                    onChange={(e) => setProblemQuery(e.target.value)}
                    placeholder="Type your question or request an on-field visit..."
                    className="text-xs min-h-[90px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => toast.success('Voice recording saved! Attached to query.')}
                      className="w-1/2 text-xs gap-1.5 font-semibold cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                      Voice Note
                    </Button>
                    <Button
                      type="submit"
                      className="w-1/2 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send to Officer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 6: ADVISORIES */}
      {activeTab === 'ADVISORIES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-foreground">Agricultural Advisories & Voice Guidance</h3>
              <p className="text-xs text-muted-foreground">Expert agronomic recommendations for fertilizer splits and pest defense</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ADVISORIES.map((adv) => (
              <Card key={adv.id} className="border shadow-xs hover:border-emerald-500/40 transition-colors">
                <CardHeader className="pb-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">
                      {adv.category.replace(/_/g, ' ')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                      onClick={() => handleAudioAdvice(adv.title, adv.description)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">{adv.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <p className="text-muted-foreground leading-relaxed">{adv.description}</p>
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 block text-[11px]">Recommended Action:</span>
                    <p className="text-foreground font-medium text-[11px] pt-0.5">{adv.recommendedAction}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: WEATHER & MANDI RATES */}
      {activeTab === 'WEATHER_MANDI' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
                  <Sun className="h-6 w-6 text-amber-500 animate-spin-slow" />
                  Agricultural Weather & Smart Crop Advisory
                </h3>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px]">
                  Live Satellite Sync
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time micro-climate, spray & irrigation feasibility for Gill Village (Ludhiana) & Khanna Grain Mandi
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-lg border">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>Gill Village (30.86° N, 75.85° E)</span>
            </div>
          </div>

          {/* 1. Live Weather Hero Card */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Main Temp & Condition */}
              <div className="lg:col-span-5 flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-amber-400 shadow-inner">
                  <Sun className="h-14 w-14 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-mono tracking-tight text-white">27°</span>
                    <span className="text-xl font-medium text-emerald-300">C</span>
                    <Badge variant="outline" className="ml-2 border-emerald-400/40 text-emerald-300 bg-emerald-500/20 text-xs">
                      Sunny & Clear
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Feels like <span className="font-semibold text-white">28°C</span> • Day High <span className="text-amber-300 font-semibold">27°C</span> / Night Low <span className="text-sky-300 font-semibold">13°C</span>
                  </p>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Updated 10 mins ago via IMD Agromet / Sentinel-2
                  </p>
                </div>
              </div>

              {/* Weather Metrics Grid */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-sky-300 text-xs">
                    <Droplets className="h-3.5 w-3.5" />
                    <span>Humidity</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">55%</div>
                  <div className="text-[10px] text-slate-400">Normal Range</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-teal-300 text-xs">
                    <Wind className="h-3.5 w-3.5" />
                    <span>Wind Speed</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">10 km/h</div>
                  <div className="text-[10px] text-emerald-300 font-medium">NW • Calm (Safe)</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-amber-300 text-xs">
                    <Thermometer className="h-3.5 w-3.5" />
                    <span>Soil Temp</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">19.5°C</div>
                  <div className="text-[10px] text-slate-400">Root Zone (10cm)</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs">
                    <Sprout className="h-3.5 w-3.5" />
                    <span>Soil Moisture</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">64%</div>
                  <div className="text-[10px] text-emerald-300 font-medium">Adequate</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Agricultural Feasibility & Action Advisory Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Spraying Window (स्प्रे का समय)
                  </span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">Optimal</Badge>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  07:00 AM – 11:30 AM (Safe)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  हवा की गति 10 km/h से कम है और बारिश की 0% संभावना है। कीटनाशक या फफूंदनाशक स्प्रे के लिए अनुकूल समय है।
                </p>
              </CardContent>
            </Card>

            <Card className="border border-teal-500/30 bg-teal-500/5 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                    <Sprout className="h-4 w-4 text-teal-600" />
                    Urea Top-Dressing (यूरिया खाद)
                  </span>
                  <Badge className="bg-teal-600 text-white text-[10px]">Recommended</Badge>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  1 Bag (50kg) / Acre With Moisture
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  मिट्टी में पर्याप्त नमी है। कल्ले निकलने (Tillering) के समय 1 बोरी यूरिया डालना पौधों के विकास के लिए लाभदायक है।
                </p>
              </CardContent>
            </Card>

            <Card className="border border-amber-500/30 bg-amber-500/5 shadow-xs">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Droplets className="h-4 w-4 text-amber-600" />
                    Irrigation Advisory (सिंचाई सलाह)
                  </span>
                  <Badge className="bg-amber-600 text-white text-[10px]">Hold 2-3 Days</Badge>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  Soil Moisture at 64% (Good)
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  जमीन में पर्याप्त नमी बनी हुई है। अनावश्यक पानी भरने से बचें। अगली हल्की सिंचाई 3 दिन बाद प्रस्तावित करें।
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 3. 24-Hour Hourly Weather Strip */}
          <Card className="border shadow-xs bg-card">
            <CardHeader className="py-3.5 px-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Today's Hourly Trend & Spray Safety (आज का 24-घंटे का पूर्वानुमान)
                </CardTitle>
                <span className="text-xs text-muted-foreground">Wind & Rain Probability</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {[
                  { time: '06:00 AM', temp: '14°C', icon: '🌅', label: 'Cool Morning', wind: '6 km/h', spray: 'Safe' },
                  { time: '09:00 AM', temp: '19°C', icon: '☀️', label: 'Clear Sun', wind: '9 km/h', spray: 'Best Spray' },
                  { time: '12:00 PM', temp: '25°C', icon: '☀️', label: 'Warm Sun', wind: '11 km/h', spray: 'Moderate' },
                  { time: '03:00 PM', temp: '27°C', icon: '☀️', label: 'Peak Temp', wind: '10 km/h', spray: 'Avoid Heat' },
                  { time: '06:00 PM', temp: '22°C', icon: '🌇', label: 'Sunset', wind: '7 km/h', spray: 'Safe' },
                  { time: '09:00 PM', temp: '17°C', icon: '🌙', label: 'Cool Night', wind: '5 km/h', spray: 'Rest' },
                  { time: '12:00 AM', temp: '14°C', icon: '🌙', label: 'Night Dew', wind: '4 km/h', spray: 'Rest' },
                ].map((slot, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 text-center border transition-all ${
                      slot.spray === 'Best Spray'
                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                        : 'bg-muted/30 border-border/60 hover:bg-muted/60'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-muted-foreground block">{slot.time}</span>
                    <span className="text-xl my-1 block">{slot.icon}</span>
                    <span className="text-sm font-bold font-mono text-foreground block">{slot.temp}</span>
                    <div className="mt-1.5 pt-1.5 border-t border-border/50 text-[10px] space-y-0.5">
                      <div className="text-muted-foreground">{slot.wind}</div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 h-4 border ${
                          slot.spray === 'Best Spray'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : slot.spray === 'Safe'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {slot.spray}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. 7-Day Extended Agricultural Forecast Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
                7-Day Weather & Agronomy Forecast (अगले 7 दिनों का मौसम व खेती सलाह)
              </h4>
              <span className="text-xs text-muted-foreground">Updated daily at 06:00 AM</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {MOCK_WEATHER_FORECAST.map((day, index) => {
                const isToday = index === 0;
                return (
                  <Card
                    key={day.date}
                    className={`border shadow-2xs transition-all hover:shadow-md ${
                      isToday
                        ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-card ring-1 ring-emerald-500/30'
                        : 'bg-card'
                    }`}
                  >
                    <CardContent className="p-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-foreground">
                            {day.day} <span className="text-muted-foreground font-normal">({day.date.slice(5)})</span>
                          </span>
                          {isToday && (
                            <Badge className="ml-1.5 bg-emerald-600 text-white text-[9px] px-1.5 py-0 h-4">
                              Today
                            </Badge>
                          )}
                        </div>
                        <div className="p-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          <Sun className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <div className="text-2xl font-black font-mono text-foreground">
                          {day.tempMax}° <span className="text-sm font-normal text-muted-foreground">/ {day.tempMin}°C</span>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          {day.condition}
                        </span>
                      </div>

                      {/* Temperature Range Bar */}
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden flex">
                        <div className="bg-sky-400 h-full" style={{ width: `${(day.tempMin / 35) * 100}%` }} />
                        <div className="bg-amber-500 h-full flex-1" />
                      </div>

                      {/* Weather Parameters */}
                      <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <CloudRain className="h-3 w-3 text-sky-500" /> Rain Chance:
                          </span>
                          <span className="font-semibold text-emerald-600 font-mono">{day.rainChancePct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <Wind className="h-3 w-3 text-teal-500" /> Wind Velocity:
                          </span>
                          <span className="font-mono text-foreground font-medium">{day.windSpeedKmh} km/h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3 text-blue-500" /> Humidity:
                          </span>
                          <span className="font-mono text-foreground font-medium">{day.humidityPct}%</span>
                        </div>
                      </div>

                      {/* Farming Advice */}
                      {day.farmingAdvice && (
                        <div className="pt-2 border-t border-border/60 bg-muted/40 -mx-3.5 -mb-3.5 p-2.5 rounded-b-xl">
                          <div className="flex items-start gap-1.5 text-[11px]">
                            <Sprout className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-foreground/90 font-medium leading-tight">{day.farmingAdvice}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* 5. Live Grain Mandi & Silo Rates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Live Grain Mandi Rates & Silo Gate Prices (अनाज मंडी भाव)
                </h4>
                <p className="text-xs text-muted-foreground">Punjab APMC & Direct Corporate Procurement</p>
              </div>
              <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                🟢 Mandi Bidding Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-2 border-emerald-500/40 bg-emerald-500/5 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl">
                  BENCHMARK
                </div>
                <CardContent className="p-4 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    Govt Minimum Support Price (MSP)
                  </span>
                  <div className="text-2xl font-black text-emerald-600 font-mono">
                    ₹ 2,275 <span className="text-xs font-normal text-muted-foreground">/ Quintal</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                    <span>FCI & Markfed Rabi Procurement</span>
                    <span className="text-emerald-600 font-semibold font-mono">Guaranteed</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-xs bg-card hover:border-emerald-500/40 transition-colors">
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Khanna Grain Mandi (Punjab)
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-0 text-[10px]">
                      +₹145 &gt; MSP
                    </Badge>
                  </div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    ₹ 2,420 <span className="text-xs font-normal text-muted-foreground">/ Quintal</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center justify-between pt-1">
                    <span>Grade-A Sharbati Premium (+6.4%)</span>
                    <span className="font-mono font-bold text-foreground">📈 High Demand</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-xs bg-card hover:border-emerald-500/40 transition-colors">
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Karnal Silo Gate Rate (Haryana)
                    </span>
                    <Badge className="bg-teal-500/20 text-teal-700 dark:text-teal-300 border-0 text-[10px]">
                      +₹205 &gt; MSP
                    </Badge>
                  </div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    ₹ 2,480 <span className="text-xs font-normal text-muted-foreground">/ Quintal</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                    <span>Direct Mill Intake (&lt;11% Moisture)</span>
                    <span className="text-teal-600 font-semibold">Fast DBT Payment</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Record Activity Dialog with Date & Time Fields */}
      <Dialog open={activityModalOpen} onOpenChange={setActivityModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-emerald-600" />
              Record Field Activity / खेत का काम दर्ज करें
            </DialogTitle>
            <DialogDescription className="text-xs">
              Log today's completed irrigation, fertilizer, or spray with exact date and time.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateFarmerActivity} className="space-y-4 pt-1">
            {/* Date and Time Row */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <CalendarCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Date / तारीख *
                </Label>
                <Input
                  type="date"
                  required
                  value={actDate}
                  onChange={(e) => setActDate(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Time / समय *
                </Label>
                <Input
                  type="time"
                  required
                  value={actTime}
                  onChange={(e) => setActTime(e.target.value)}
                  className="text-xs bg-background"
                />
              </div>
            </div>

            {/* Field Plot / Parcel */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Field Plot / Khet *</Label>
              <Select value={actParcelId} onValueChange={(v) => v && setActParcelId(v)}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select Field Plot / Khet">
                    {farmerParcels.find((p) => p.id === actParcelId) ? `${farmerParcels.find((p) => p.id === actParcelId)?.parcelCode} • ${farmerParcels.find((p) => p.id === actParcelId)?.titleDeedOrKhasraNo} (${farmerParcels.find((p) => p.id === actParcelId)?.totalAcreage} Acres)` : 'PRCL-001 • Khasra #412/1 (10.0 Acres)'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {farmerParcels.length > 0 ? (
                    farmerParcels.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.parcelCode} &bull; {p.titleDeedOrKhasraNo} ({p.totalAcreage} Acres)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="PRCL-001">PRCL-001 &bull; Khasra #412/1 (10.0 Acres)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Operation Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Operation Type / काम का प्रकार *</Label>
              <Select value={actType} onValueChange={(v) => v && handleTypeChange(v)}>
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FERTILIZER_UREA">🌱 Urea Top-Dressing (यूरिया खाद)</SelectItem>
                  <SelectItem value="IRRIGATION">💧 Canal / Tube-well Irrigation (आबपाशी)</SelectItem>
                  <SelectItem value="FERTILIZER_DAP">🌾 DAP Basal Application (डीएपी खाद)</SelectItem>
                  <SelectItem value="FERTILIZER_POTASH">🌿 Foliar Potash Spray (पोटाश स्प्रे)</SelectItem>
                  <SelectItem value="PESTICIDE_SPRAY">🛡️ Fungicide / Yellow Rust Spray (फफूंदनाशक)</SelectItem>
                  <SelectItem value="WEEDICIDE_SPRAY">🌿 Herbicide Weeding (खरपतवार नाशक)</SelectItem>
                  <SelectItem value="FIELD_VISIT_INSPECTION">🔍 Field Scouting & Inspection (कैनोपी चेक)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity / Dosage Selection & Quick Presets */}
            <div className="space-y-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                  Quantity & Dosage (खाद / स्प्रे की कुल मात्रा) *
                </Label>
                <span className="text-[10px] text-muted-foreground">Parcel: 18 Acres</span>
              </div>

              {/* Quick Preset Buttons */}
              {actType === 'FERTILIZER_UREA' && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { label: '1 Bag/Acre (18 Bags - 900 Kg)', val: '1 Bag (50kg) Urea / Acre (18 Bags Total - 900 Kg)', cost: '4800' },
                    { label: '1.5 Bags/Acre (27 Bags - 1350 Kg)', val: '1.5 Bags Urea / Acre (27 Bags Total - 1350 Kg)', cost: '7200' },
                    { label: '0.5 Bag/Acre (9 Bags - 450 Kg)', val: '0.5 Bag Urea / Acre (9 Bags Total - 450 Kg)', cost: '2400' },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActDosage(preset.val);
                        setActCost(preset.cost);
                      }}
                      className={`text-[11px] h-7 px-2.5 rounded-lg border ${
                        actDosage === preset.val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-background hover:bg-emerald-50 text-foreground border-border/80'
                      }`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}

              {actType === 'FERTILIZER_DAP' && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { label: '1.5 Bags/Acre (27 Bags Total)', val: '1.5 Bags DAP / Acre (27 Bags Total - 1350 Kg)', cost: '36000' },
                    { label: '1 Bag/Acre (18 Bags Total)', val: '1 Bag DAP / Acre (18 Bags Total - 900 Kg)', cost: '24000' },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActDosage(preset.val);
                        setActCost(preset.cost);
                      }}
                      className={`text-[11px] h-7 px-2.5 rounded-lg border ${
                        actDosage === preset.val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-background hover:bg-emerald-50 text-foreground border-border/80'
                      }`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}

              {actType === 'IRRIGATION' && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { label: '3 Acre-Inches Canal Water', val: '3 Acre Inches Canal Irrigation', cost: '1500' },
                    { label: '2.5 Acre-Inches Tube-well', val: '2.5 Acre Inches Tube-well Irrigation', cost: '2500' },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActDosage(preset.val);
                        setActCost(preset.cost);
                      }}
                      className={`text-[11px] h-7 px-2.5 rounded-lg border ${
                        actDosage === preset.val
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-background hover:bg-emerald-50 text-foreground border-border/80'
                      }`}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Quantity / Dosage Value *</Label>
                  <Input
                    required
                    placeholder="e.g. 1 Bag Urea per acre (18 Bags Total)"
                    value={actDosage}
                    onChange={(e) => setActDosage(e.target.value)}
                    className="text-xs bg-background font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Total Cost (₹ खर्च)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 4800"
                    value={actCost}
                    onChange={(e) => setActCost(e.target.value)}
                    className="text-xs bg-background font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Field Condition Notes / Observations</Label>
              <Textarea
                placeholder="e.g. Sirhind canal turn watering completed on time. Soil moisture optimal."
                value={actNotes}
                onChange={(e) => setActNotes(e.target.value)}
                className="text-xs min-h-[65px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setActivityModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Save & Log Activity
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FarmerShell>
  );
}

function ActivityIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
    </svg>
  );
}
