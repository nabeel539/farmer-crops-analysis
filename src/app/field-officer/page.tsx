'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Compass,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Droplets,
  Sprout,
  ShieldCheck,
  Smartphone,
  Wifi,
  ChevronRight,
  Sparkles,
  Search,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { addActivity, completeActivity } from '@/store/slices/activitiesSlice';
import { updateParcel } from '@/store/slices/landParcelsSlice';
import { updateCycleStage, updateCycleHealth } from '@/store/slices/cropCyclesSlice';
import { CropCycleStage, CropHealthStatus } from '@/types';
import { toast } from 'sonner';

export default function FieldOfficerPage() {
  const dispatch = useAppDispatch();
  const farmers = useAppSelector((state) => state.farmers.farmers);
  const parcels = useAppSelector((state) => state.landParcels.parcels);
  const cropCycles = useAppSelector((state) => state.cropCycles.cycles);
  const activities = useAppSelector((state) => state.activities.activities);

  const [activeTab, setActiveTab] = useState<'VISITS' | 'LOG_ACTIVITY' | 'VERIFY_PARCEL'>('VISITS');
  const [selectedFarmerId, setSelectedFarmerId] = useState(farmers[0]?.id || '');
  const [actType, setActType] = useState('IRRIGATION');
  const [dosage, setDosage] = useState('3 Acre Inches Rauni Irrigation');
  const [notes, setNotes] = useState('Checked soil moisture and crown root initiation on site.');

  // Form State for Field Verification
  const [verifyingParcelId, setVerifyingParcelId] = useState(parcels[0]?.id || '');
  const [verifyingCycleStage, setVerifyingCycleStage] = useState<CropCycleStage>('HEADING_FLOWERING');
  const [verifyingHealth, setVerifyingHealth] = useState<CropHealthStatus>('OPTIMAL');

  const pendingVisits = activities.filter((a) => a.status !== 'COMPLETED');
  const unverifiedParcels = parcels.filter((p) => p.verificationStatus === 'PENDING');

  const handleQuickLogActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const selFarmer = farmers.find(f => f.id === selectedFarmerId) || farmers[0];
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
      dosageOrVolume: dosage,
      cost: 4500,
      loggedByRole: 'FIELD_OFFICER',
      loggedByName: 'Muhammad Asif (Field Officer)',
      notes: notes,
      recommendationAdherence: true
    }));
    toast.success(`Logged ${actType.replace(/_/g, ' ')} for ${selFarmer.fullName}!`);
    setActiveTab('VISITS');
  };

  const handleVerifyParcelGPS = (e: React.FormEvent) => {
    e.preventDefault();
    const selParcel = parcels.find(p => p.id === verifyingParcelId) || parcels[0];
    dispatch(updateParcel({
      ...selParcel,
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Muhammad Asif (Field Officer)'
    }));

    const connectedCycle = cropCycles.find(c => c.fieldParcelId === selParcel.id);
    if (connectedCycle) {
      dispatch(updateCycleStage({ id: connectedCycle.id, stage: verifyingCycleStage }));
      dispatch(updateCycleHealth({ id: connectedCycle.id, health: verifyingHealth }));
    }

    toast.success(`GPS Boundary & Crop Stage verified for ${selParcel.parcelCode}!`);
    setActiveTab('VISITS');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header for Field Officer */}
      <header className="border-b border-border/80 bg-card/70 backdrop-blur-md px-3 sm:px-6 min-h-16 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Compass className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm leading-tight text-foreground flex items-center gap-1.5 truncate">
                <span className="truncate">Field Officer Portal</span>
                <Badge variant="outline" className="text-[9px] bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 shrink-0 hidden xs:inline-flex">
                  Officer: M. Asif
                </Badge>
              </h1>
              <p className="text-[10px] text-muted-foreground truncate">Jurisdiction: Chak 54-RB & Salarwala Sub-division</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <Wifi className="h-3 w-3 animate-pulse" />
            <span>Online</span>
          </div>
          <RoleSwitcherBar />
        </div>
      </header>

      {/* Main Field Ops Container */}
      <main className="flex-1 p-3 sm:p-6 max-w-5xl w-full mx-auto space-y-4 sm:space-y-6">
        {/* Quick Nav Tabs */}
        <div className="grid grid-cols-3 bg-muted p-1 rounded-md gap-1">
          <Button
            variant={activeTab === 'VISITS' ? 'default' : 'ghost'}
            className="text-[11px] sm:text-xs font-semibold rounded-md h-8 sm:h-9 px-1.5 cursor-pointer leading-tight truncate"
            onClick={() => setActiveTab('VISITS')}
          >
            Visits ({pendingVisits.length})
          </Button>
          <Button
            variant={activeTab === 'LOG_ACTIVITY' ? 'default' : 'ghost'}
            className="text-[11px] sm:text-xs font-semibold rounded-md h-8 sm:h-9 px-1.5 cursor-pointer leading-tight truncate"
            onClick={() => setActiveTab('LOG_ACTIVITY')}
          >
            Activity Log
          </Button>
          <Button
            variant={activeTab === 'VERIFY_PARCEL' ? 'default' : 'ghost'}
            className="text-[11px] sm:text-xs font-semibold rounded-md h-8 sm:h-9 px-1.5 cursor-pointer leading-tight truncate"
            onClick={() => setActiveTab('VERIFY_PARCEL')}
          >
            GPS Verify
          </Button>
        </div>

        {/* Tab 1: Inspection Queue */}
        {activeTab === 'VISITS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">Today's Field Route & Tasks</h3>
                <p className="text-xs text-muted-foreground">Prioritized grower inspections and spray validations</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {pendingVisits.length} Pending Actions
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingVisits.map((visit) => (
                <Card key={visit.id} className="border shadow-xs hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">{visit.id}</span>
                      <StatusBadge status={visit.status} />
                    </div>
                    <CardTitle className="text-base font-bold pt-1">{visit.farmerName}</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      Field Parcel {visit.fieldParcelId} &bull; Due: {visit.scheduledDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="p-3 bg-muted/60 rounded-xl space-y-1">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        {visit.activityType.includes('IRRIGATION') ? (
                          <Droplets className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                        )}
                        {visit.activityType.replace(/_/g, ' ')}
                      </span>
                      <p className="text-muted-foreground">{visit.dosageOrVolume}</p>
                    </div>

                    {visit.notes && (
                      <p className="text-[11px] text-muted-foreground italic">"{visit.notes}"</p>
                    )}

                    <Button
                      className="w-full font-semibold text-xs gap-1.5"
                      onClick={() => {
                        dispatch(completeActivity({
                          id: visit.id,
                          executedDate: new Date().toISOString().split('T')[0],
                          notes: 'Verified and confirmed on-site by Field Officer.'
                        }));
                        toast.success(`Completed inspection for ${visit.farmerName}!`);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Visited & Executed
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Quick Agronomic Activity Recorder */}
        {activeTab === 'LOG_ACTIVITY' && (
          <Card className="border shadow-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Record Field Operation On-Site</CardTitle>
              <CardDescription className="text-xs">
                Log completed irrigation, fertilizer split top-dressing, or fungicide spray directly from the field.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleQuickLogActivity} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Enrolled Farmer</Label>
                  <Select value={selectedFarmerId} onValueChange={(v) => { if (v !== null) setSelectedFarmerId(v); }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {farmers.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.fullName} &bull; {f.village} ({f.district})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Operation Type</Label>
                    <Select value={actType} onValueChange={(v) => { if (v !== null) setActType(v); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IRRIGATION">Irrigation (Rauni / CRI / Heading)</SelectItem>
                        <SelectItem value="FERTILIZER_UREA">Urea Split Top-Dressing</SelectItem>
                        <SelectItem value="FERTILIZER_DAP">DAP Basal Application</SelectItem>
                        <SelectItem value="FERTILIZER_POTASH">Soluble Potash Spray</SelectItem>
                        <SelectItem value="PESTICIDE_SPRAY">Yellow Rust Fungicide Spray</SelectItem>
                        <SelectItem value="WEEDICIDE_SPRAY">Weedicide Herbicide</SelectItem>
                        <SelectItem value="FIELD_VISIT_INSPECTION">Canopy & Tiller Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Dosage / Inputs Used</Label>
                    <Input
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 1 Bag Urea per acre"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-semibold">Field Observations & Canopy Health</Label>
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter on-ground observations..."
                  />
                </div>

                <Button type="submit" className="w-full font-semibold gap-1.5 pt-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Save Field Operation Record
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: GPS Field Boundary Verification */}
        {activeTab === 'VERIFY_PARCEL' && (
          <Card className="border shadow-sm max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-bold">On-Site GPS Parcel Verification</CardTitle>
              <CardDescription className="text-xs">
                Walk the 4 corners of the field parcel and verify crop phenology stage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyParcelGPS} className="space-y-4 text-xs">
                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-semibold">Select Land Parcel</Label>
                  <Select value={verifyingParcelId} onValueChange={(v) => { if (v !== null) setVerifyingParcelId(v); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {parcels.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.parcelCode} &bull; {p.farmerName} ({p.totalAcreage} Ac, {p.verificationStatus})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3.5 sm:p-4 rounded-lg bg-muted/60 space-y-1.5 sm:space-y-2 border">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">GPS Device Location Lock:</span>
                  </div>
                  <p className="font-mono text-xs text-emerald-600 font-semibold break-all sm:break-normal">
                    Lat: 31.5204° N, Lng: 73.1893° E (Accuracy: ±1.2m)
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Khasra boundary polygon matched with cadastral record.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Current Crop Stage</Label>
                    <Select value={verifyingCycleStage} onValueChange={(v) => { if (v !== null) setVerifyingCycleStage(v as CropCycleStage); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TILLERING">Tillering (Day 35-45)</SelectItem>
                        <SelectItem value="JOINTING">Jointing (Day 60-70)</SelectItem>
                        <SelectItem value="BOOTING">Booting (Day 75-85)</SelectItem>
                        <SelectItem value="HEADING_FLOWERING">Heading & Flowering (Day 90-100)</SelectItem>
                        <SelectItem value="MILK_STAGE">Milk Stage (Day 105-115)</SelectItem>
                        <SelectItem value="MATURITY_RIPENING">Maturity (Day 135+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Canopy Health Status</Label>
                    <Select value={verifyingHealth} onValueChange={(v) => { if (v !== null) setVerifyingHealth(v as CropHealthStatus); }}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPTIMAL">OPTIMAL (No yellow rust, good density)</SelectItem>
                        <SelectItem value="GOOD">GOOD (Normal vegetative cover)</SelectItem>
                        <SelectItem value="STRESSED">STRESSED (Moisture stress observed)</SelectItem>
                        <SelectItem value="DISEASED">DISEASED (Rust pustules spotted)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full font-semibold gap-1.5 pt-2">
                  <ShieldCheck className="h-4 w-4" />
                  Confirm Physical Field Verification
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
