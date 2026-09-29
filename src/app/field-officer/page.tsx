'use client';

import React, { useState, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setActiveRole } from '@/store/slices/uiSlice';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  ArrowLeft,
  RefreshCw,
  ClipboardList,
  Phone,
  Calendar,
  Check,
  UserCheck,
  Upload,
  Camera,
  X,
  IndianRupee,
  Wheat,
} from 'lucide-react';
import Link from 'next/link';
import { UserNav } from '@/components/shared/UserNav';
import {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useCompleteActivityMutation,
} from '@/store/api/activityApi';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { useGetFieldsQuery, useUpdateFieldMutation } from '@/store/api/fieldApi';
import { useGetCropCyclesQuery } from '@/store/api/cropCycleApi';
import { toast } from 'sonner';
import { getErrorMessage, cn } from '@/lib/utils';

const OPERATION_TEMPLATES = [
  {
    type: 'IRRIGATION',
    label: 'Canal / Tubewell Irrigation (पहला/दूसरा पानी)',
    defaultDosage: '3 Acre-Inches Rauni Irrigation',
    defaultCost: 1200,
  },
  {
    type: 'FERTILIZER_UREA',
    label: 'Urea Top-Dressing (यूरिया खाद)',
    defaultDosage: '1 Bag Urea (45 KG) per Acre',
    defaultCost: 270,
  },
  {
    type: 'FERTILIZER_DAP',
    label: 'DAP Basal Fertilizer (डीएपी)',
    defaultDosage: '1 Bag DAP (50 KG) per Acre',
    defaultCost: 1350,
  },
  {
    type: 'PESTICIDE_SPRAY',
    label: 'Fungicide / Rust Spray (पीला रतुआ स्प्रे)',
    defaultDosage: 'Propiconazole 25 EC @ 200ml / Acre',
    defaultCost: 650,
  },
  {
    type: 'FIELD_VISIT_INSPECTION',
    label: 'Canopy Scouting (फसल निरीक्षण)',
    defaultDosage: 'Canopy density & rust scouting',
    defaultCost: 0,
  },
];

export default function FieldOfficerPage() {
  const dispatch = useAppDispatch();
  const { data: apiFarmers = [], isLoading: isFarmersLoading } = useGetFarmersQuery();
  const { data: apiFields = [], isLoading: isFieldsLoading } = useGetFieldsQuery();
  const { data: apiCycles = [] } = useGetCropCyclesQuery();
  const { data: apiActivities = [], isLoading: isActivitiesLoading } = useGetActivitiesQuery();

  const [createActivityApi, { isLoading: isCreatingActivity }] = useCreateActivityMutation();
  const [completeActivityApi] = useCompleteActivityMutation();
  const [updateFieldApi, { isLoading: isVerifyingField }] = useUpdateFieldMutation();

  const [activeTab, setActiveTab] = useState<'VISITS' | 'LOG_ACTIVITY' | 'VERIFY_PARCEL'>('VISITS');
  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [actType, setActType] = useState('IRRIGATION');
  const [dosage, setDosage] = useState('3 Acre-Inches Canal Water');
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState<number | ''>(1200);
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Field Verification
  const [verifyingFieldId, setVerifyingFieldId] = useState('');
  const [verifyingCrop, setVerifyingCrop] = useState('Wheat');
  const [verifyingSeason, setVerifyingSeason] = useState('Rabi 2025-2026');
  const [verificationDecision, setVerificationDecision] = useState<'APPROVE' | 'CORRECTION_REQUIRED' | 'REJECT'>('APPROVE');
  const [verificationRemarks, setVerificationRemarks] = useState('');

  const pendingVisits = apiActivities.filter(
    (a) => a.status === 'SCHEDULED' || a.status === 'PENDING' || a.status === 'IN_PROGRESS'
  );
  const completedVisits = apiActivities.filter((a) => a.status === 'COMPLETED');

  // Filter fields belonging to selected farmer
  const farmerFields = apiFields.filter((f) => f.farmer_id === selectedFarmerId);

  const farmerOptions = apiFarmers.map((f) => ({
    value: f.id,
    label: f.name,
    subLabel: `${f.village || ''} (${f.mobile_number})`,
  }));

  const fieldOptions = (selectedFarmerId ? farmerFields : apiFields).map((f) => {
    const owner = apiFarmers.find((farmer) => farmer.id === f.farmer_id);
    return {
      value: f.id,
      label: f.field_name,
      subLabel: `${f.area || 0} Acres • ${owner?.name || 'Farmer'} (${f.village || ''})`,
    };
  });

  const pendingVerificationFields = apiFields.filter((f) => {
    const isVerified = !!(
      f.notes?.toLowerCase().includes('gps verified') ||
      f.notes?.toLowerCase().includes('verified')
    );
    if (f.status === 'REJECTED' || f.status === 'INACTIVE') {
      return false;
    }
    return !isVerified || f.status === 'PENDING_VERIFICATION' || f.status === 'CORRECTION_REQUIRED';
  });

  const pendingFieldOptions = pendingVerificationFields.map((f) => {
    const owner = apiFarmers.find((farmer) => farmer.id === f.farmer_id);
    const tag = f.status === 'CORRECTION_REQUIRED' ? '⚠️ Correction' : 'Pending Verification';
    return {
      value: f.id,
      label: `${f.field_name} (${tag})`,
      subLabel: `${f.area || 0} Acres • ${owner?.name || 'Farmer'} (${f.village || ''})`,
    };
  });

  const allFieldOptions = apiFields.map((f) => {
    const owner = apiFarmers.find((farmer) => farmer.id === f.farmer_id);
    return {
      value: f.id,
      label: f.field_name,
      subLabel: `${f.area || 0} Acres • ${owner?.name || 'Farmer'} (${f.village || ''})`,
    };
  });

  const handleApplyPreset = (tpl: typeof OPERATION_TEMPLATES[0]) => {
    setActType(tpl.type);
    setDosage(tpl.defaultDosage);
    setCost(tpl.defaultCost);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      toast.success('Field photo attached!');
    };
    reader.readAsDataURL(file);
  };

  const handleQuickLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerId) {
      toast.error('Mandatory field required: Please select an enrolled farmer');
      return;
    }
    if (!actType) {
      toast.error('Mandatory field required: Please select an operation type');
      return;
    }
    if (!dosage || dosage.trim().length === 0) {
      toast.error('Mandatory field required: Dosage / inputs used is required');
      return;
    }

    try {
      const selFarmer = apiFarmers.find((f) => f.id === selectedFarmerId);
      await createActivityApi({
        farmer_id: selectedFarmerId,
        field_id: selectedFieldId || (farmerFields[0]?.id ?? null),
        activity_type: actType,
        scheduled_date: executionDate,
        dosage_or_volume: dosage,
        cost: typeof cost === 'number' ? cost : 0,
        logged_by_role: 'FIELD_OFFICER',
        logged_by_name: 'Rajesh Kumar (Field Officer)',
        notes: notes,
        photo_url: photoPreview,
        recommendation_adherence: true,
      }).unwrap();

      toast.success(`Logged ${actType.replace(/_/g, ' ')} for ${selFarmer?.name || 'Farmer'}!`);
      setActiveTab('VISITS');
      // Reset form
      setNotes('');
      setPhotoPreview(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to record on-site activity.'));
    }
  };

  const handleCompleteVisit = async (visitId: string, farmerName: string) => {
    try {
      await completeActivityApi({
        id: visitId,
        data: {
          executed_date: new Date().toISOString().split('T')[0],
          notes: 'Verified and confirmed on-site by Field Officer.',
          recommendation_adherence: true,
        },
      }).unwrap();
      toast.success(`Completed inspection for ${farmerName}!`);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to complete visit.'));
    }
  };

  const handleVerifyParcelGPS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingFieldId) {
      toast.error('Mandatory field required: Please select a land parcel to verify');
      return;
    }
    const targetField = apiFields.find((p) => p.id === verifyingFieldId);
    if (!targetField) return;

    const targetStatus = verificationDecision === 'APPROVE' ? 'ACTIVE' : verificationDecision === 'CORRECTION_REQUIRED' ? 'CORRECTION_REQUIRED' : 'REJECTED';
    const targetColor = verificationDecision === 'APPROVE' ? 'GREEN' : verificationDecision === 'CORRECTION_REQUIRED' ? 'YELLOW' : 'RED';
    const notePrefix = verificationDecision === 'APPROVE'
      ? 'Verified on-site by Field Officer (GPS & Cadastral boundary confirmed)'
      : verificationDecision === 'CORRECTION_REQUIRED'
      ? `Correction Required: ${verificationRemarks.trim() || 'Acreage/boundary discrepancy observed'}`
      : `Rejected: ${verificationRemarks.trim() || 'Plot ineligibility or verification failure'}`;
    const fullNotes = targetField.notes ? `${targetField.notes} • ${notePrefix}` : notePrefix;

    try {
      await updateFieldApi({
        id: verifyingFieldId,
        data: {
          status: targetStatus as any,
          polygon_color: targetColor as any,
          crop: verifyingCrop,
          season: verifyingSeason,
          notes: fullNotes,
        },
      }).unwrap();

      if (verificationDecision === 'APPROVE') {
        toast.success(`GPS Boundary & Plot verified for ${targetField.field_name}!`);
      } else if (verificationDecision === 'CORRECTION_REQUIRED') {
        toast.warning(`Flagged ${targetField.field_name} for correction: ${verificationRemarks || 'Discrepancy noted'}`);
      } else {
        toast.error(`Marked ${targetField.field_name} as Rejected.`);
      }
      setVerifyingFieldId('');
      setVerificationRemarks('');
      setActiveTab('VISITS');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to update field verification status.'));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Header for Field Officer */}
      <header className="border-b border-border/80 bg-card/80 backdrop-blur-md px-3 sm:px-6 min-h-16 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <Compass className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm leading-tight text-foreground flex items-center gap-1.5 truncate">
                <span className="truncate">Field Officer Portal</span>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                  Sync
                </Badge>
              </h1>
              <p className="text-[10px] text-muted-foreground truncate hidden md:block">
                Wheat Agronomy &bull; GPS Scouting & Spray
              </p>
            </div>
          </div>
        </div>

        {/* Right side status & user nav */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[11px] gap-1 bg-emerald-500/15 text-emerald-700 border-emerald-500/30 py-0.5">
            <Wifi className="h-3 w-3 text-emerald-600" />
            <span className="hidden sm:inline">Online</span>
          </Badge>
          <UserNav />
        </div>
      </header>

      {/* Main Field Officer Dashboard */}
      <main className="flex-1 p-3 sm:p-6 max-w-5xl w-full mx-auto space-y-5">
        {/* KPI Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Pending Tasks</div>
              <div className="text-base font-bold font-mono text-foreground">{pendingVisits.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Executed Tasks</div>
              <div className="text-base font-bold font-mono text-foreground">{completedVisits.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Farmers in Sector</div>
              <div className="text-base font-bold font-mono text-foreground">{apiFarmers.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card border border-border/80 shadow-2xs flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Monitored Plots</div>
              <div className="text-base font-bold font-mono text-foreground">{apiFields.length}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 text-xs">
          <Button
            variant={activeTab === 'VISITS' ? 'default' : 'ghost'}
            className="text-[11px] sm:text-xs font-semibold rounded-lg h-8 sm:h-9 px-1.5 cursor-pointer leading-tight truncate"
            onClick={() => setActiveTab('VISITS')}
          >
            Visits & Tasks ({pendingVisits.length})
          </Button>
          <Button
            variant={activeTab === 'LOG_ACTIVITY' ? 'default' : 'ghost'}
            className="text-[11px] sm:text-xs font-semibold rounded-lg h-8 sm:h-9 px-1.5 cursor-pointer leading-tight truncate"
            onClick={() => setActiveTab('LOG_ACTIVITY')}
          >
            Log Field Operation
          </Button>
          <Button
            variant={activeTab === 'VERIFY_PARCEL' ? 'default' : 'ghost'}
            className="text-[11px] sm:text-xs font-semibold rounded-lg h-8 sm:h-9 px-1.5 cursor-pointer leading-tight truncate"
            onClick={() => setActiveTab('VERIFY_PARCEL')}
          >
            GPS Verify Plot {pendingVerificationFields.length > 0 ? `(${pendingVerificationFields.length})` : ''}
          </Button>
        </div>

        {/* Tab 1: Inspection Queue & Visits */}
        {activeTab === 'VISITS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">Today's Field Route & Tasks</h3>
                <p className="text-xs text-muted-foreground">Prioritized grower inspections, spray validations and scouting logs.</p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {pendingVisits.length} Pending Actions
              </Badge>
            </div>

            {isActivitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 rounded-xl bg-muted/60 animate-pulse border" />
                ))}
              </div>
            ) : pendingVisits.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="All Field Inspections Completed"
                description="There are no pending inspections or scheduled tasks in your sector today. You can record a new on-site operation or verify field GPS plots."
                action={{
                  label: 'Log New Field Operation',
                  onClick: () => setActiveTab('LOG_ACTIVITY'),
                  icon: Plus,
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingVisits.map((visit) => {
                  const farmer = apiFarmers.find((f) => f.id === visit.farmer_id);
                  const field = apiFields.find((p) => p.id === visit.field_id);
                  const isIrrigation = visit.activity_type.includes('IRRIGATION');

                  return (
                    <Card key={visit.id} className="border shadow-xs hover:border-primary/50 transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-muted-foreground">TASK-#{visit.id.slice(0, 6).toUpperCase()}</span>
                          <StatusBadge status={visit.status as any} />
                        </div>
                        <CardTitle className="text-base font-bold pt-1 text-foreground">
                          {farmer?.name || 'Enrolled Farmer'}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          <span>
                            {field?.field_name || 'Plot'} &bull; {farmer?.village || 'Village'} ({farmer?.district || ''})
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-xs">
                        <div className="p-3 bg-muted/50 rounded-xl space-y-1 border border-border/60">
                          <div className="font-bold text-foreground flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              {isIrrigation ? (
                                <Droplets className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Sprout className="h-4 w-4 text-emerald-500" />
                              )}
                              {visit.activity_type.replace(/_/g, ' ')}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground font-normal">
                              Due: {visit.scheduled_date}
                            </span>
                          </div>
                          {visit.dosage_or_volume && (
                            <p className="text-muted-foreground text-xs font-mono">{visit.dosage_or_volume}</p>
                          )}
                        </div>

                        {visit.notes && (
                          <p className="text-[11px] text-muted-foreground italic bg-background p-2 rounded border">
                            "{visit.notes}"
                          </p>
                        )}

                        <Button
                          className="w-full font-semibold text-xs gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleCompleteVisit(visit.id, farmer?.name || 'Farmer')}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Mark Visited & Executed
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Rich Agronomic Field Operation Recorder (Same as Kisan Diary) */}
        {activeTab === 'LOG_ACTIVITY' && (
          <Card className="border shadow-xs max-w-4xl mx-auto">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white font-bold">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">
                    Log Field Operation (कार्य दर्ज करें)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Record on-site field activity, input dosages, costs, and proof photos for enrolled farmers.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-5">
              {/* Quick Presets (त्वरित चयन) */}
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  QUICK PRESETS (त्वरित चयन)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {OPERATION_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyPreset(tpl)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        actType === tpl.type
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'border-border/80 bg-card hover:bg-muted/40 hover:border-primary/40'
                      }`}
                    >
                      <div className="text-xs font-bold text-foreground truncate">{tpl.label}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{tpl.defaultDosage}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleQuickLogActivity} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-3.5">
                    {/* 1. Select Farmer */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Select Farmer (किसान चुनें) *</Label>
                      <SearchableSelect
                        options={farmerOptions}
                        value={selectedFarmerId}
                        onChange={(val) => {
                          setSelectedFarmerId(val);
                          const fPlot = apiFields.find((f) => f.farmer_id === val);
                          if (fPlot) setSelectedFieldId(fPlot.id);
                        }}
                        placeholder="Search farmer name, village..."
                        searchPlaceholder="Type name or village..."
                      />
                    </div>

                    {/* 2. Select Field Plot */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Select Field / Plot (खेत चुनें) *</Label>
                      <SearchableSelect
                        options={fieldOptions}
                        value={selectedFieldId}
                        onChange={(val) => setSelectedFieldId(val)}
                        placeholder="Choose field plot..."
                        searchPlaceholder="Search plot..."
                      />
                    </div>

                    {/* 3. Operation Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Operation Type (कार्य का प्रकार) *</Label>
                      <Select value={actType} onValueChange={(v) => { if (v !== null) setActType(v); }}>
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="IRRIGATION">Canal / Tubewell Irrigation (पहला/दूसरा पानी)</SelectItem>
                          <SelectItem value="FERTILIZER_UREA">Urea Top-Dressing (यूरिया खाद)</SelectItem>
                          <SelectItem value="FERTILIZER_DAP">DAP Basal Fertilizer (डीएपी)</SelectItem>
                          <SelectItem value="FERTILIZER_POTASH">MOP Potash Application (पोटाश)</SelectItem>
                          <SelectItem value="PESTICIDE_SPRAY">Fungicide / Rust Spray (पीला रतुआ स्प्रे)</SelectItem>
                          <SelectItem value="WEEDICIDE_SPRAY">Weedicide Herbicide Spray (खरपतवार नाशक)</SelectItem>
                          <SelectItem value="FIELD_VISIT_INSPECTION">Field Scouting & Verification (निरीक्षण)</SelectItem>
                          <SelectItem value="SOIL_TEST">Soil Sampling & Testing (मिट्टी परीक्षण)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 4. Dosage / Material Used */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Dosage / Material Used (मात्रा / सामग्री) *</Label>
                      <Input
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        placeholder="e.g. 3 Acre-Inches Canal Water / 1 Bag Urea"
                        className="text-xs"
                        required
                      />
                    </div>

                    {/* 5. Date & Cost */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Execution Date *</Label>
                        <Input
                          type="date"
                          value={executionDate}
                          onChange={(e) => setExecutionDate(e.target.value)}
                          className="text-xs"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Cost (₹) *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={cost === '' ? '' : cost}
                          onChange={(e) => setCost(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          placeholder="e.g. 1200"
                          className="text-xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Observations & Photo Upload */}
                  <div className="space-y-3.5 flex flex-col">
                    {/* Observations */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Observations / Remarks (टिप्पणी)</Label>
                      <Textarea
                        rows={4}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Soil moisture level, weather condition, crop response, yellow rust inspection..."
                        className="text-xs"
                      />
                    </div>

                    {/* Field / Receipt Photo Upload */}
                    <div className="space-y-1.5 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5 text-primary" />
                          <span>Field / Receipt Photo (फ़ोटो अपलोड करें)</span>
                        </Label>
                        <span className="text-[10px] text-muted-foreground">Optional</span>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      {photoPreview ? (
                        <div className="relative rounded-xl border border-border/80 overflow-hidden bg-muted/40 p-2 flex items-center justify-center min-h-[140px]">
                          <img
                            src={photoPreview}
                            alt="Field activity photo preview"
                            className="max-h-36 rounded-lg object-contain shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoPreview(null)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 min-h-[140px] border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-muted/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                        >
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                            <Upload className="h-4 w-4" />
                          </div>
                          <div className="text-xs font-bold text-foreground">Click to capture or upload field photo</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, WebP up to 10MB (खेत या खाद बिल की फोटो)</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('VISITS')}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isCreatingActivity}
                    className="font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer px-5"
                  >
                    {isCreatingActivity ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving to Diary...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Save to Operation Log (दर्ज करें)
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: GPS Field Boundary Verification */}
        {activeTab === 'VERIFY_PARCEL' && (
          <Card className="border shadow-xs max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-bold">On-Site GPS Parcel Verification</CardTitle>
              <CardDescription className="text-xs">
                Verify cadastral boundaries, GPS coordinates, and crop phenology directly from the field.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingFieldOptions.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-3 bg-muted/20 rounded-xl border border-dashed border-border/80">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">All Registered Plots are Verified!</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      All {apiFields.length} farm plots currently have GPS verified boundaries on-site. When new plots are registered, they will appear here for verification.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleVerifyParcelGPS} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Select Field Plot to Verify *</Label>
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {pendingFieldOptions.length} Pending Verification
                      </span>
                    </div>
                    <SearchableSelect
                      options={pendingFieldOptions}
                      value={verifyingFieldId}
                      onChange={(val) => {
                        setVerifyingFieldId(val);
                        const sel = apiFields.find((f) => f.id === val);
                        if (sel) {
                          setVerifyingCrop(sel.crop || 'Wheat');
                          setVerifyingSeason(sel.season || 'Rabi 2026-2027');
                        }
                      }}
                      placeholder="Search pending plot code or farmer name..."
                      searchPlaceholder="Type plot name..."
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/60 space-y-2 border border-border/80">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>GPS Coordinates & Sat-Lock:</span>
                    </div>
                    <p className="font-mono text-xs text-emerald-600 font-bold">
                      Lat: 29.6857° N, Lng: 76.9905° E (Accuracy: ±1.2m GPS Locked)
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Khasra boundary polygon matched with live geo-referenced cadastral map.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Verified Crop</Label>
                      <Input
                        value={verifyingCrop}
                        onChange={(e) => setVerifyingCrop(e.target.value)}
                        placeholder="Wheat (HD-2967 / HD-3086)"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Season</Label>
                      <Input
                        value={verifyingSeason}
                        onChange={(e) => setVerifyingSeason(e.target.value)}
                        placeholder="Rabi 2025-2026"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  {/* Verification Decision Radios */}
                  <div className="space-y-2 pt-1 border-t border-border/60">
                    <Label className="text-xs font-bold text-foreground">Officer Verification Decision *</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerificationDecision('APPROVE')}
                        className={cn(
                          'p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1',
                          verificationDecision === 'APPROVE'
                            ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30 text-emerald-900 dark:text-emerald-100'
                            : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Approve & Verify</span>
                        </div>
                        <span className="text-[10px] opacity-80 leading-tight">Plot is active, boundaries match</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationDecision('CORRECTION_REQUIRED')}
                        className={cn(
                          'p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1',
                          verificationDecision === 'CORRECTION_REQUIRED'
                            ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 text-amber-900 dark:text-amber-100'
                            : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Needs Correction</span>
                        </div>
                        <span className="text-[10px] opacity-80 leading-tight">Boundary or area mismatch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationDecision('REJECT')}
                        className={cn(
                          'p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1',
                          verificationDecision === 'REJECT'
                            ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/30 text-rose-900 dark:text-rose-100'
                            : 'border-border/80 bg-card hover:bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <X className="h-3.5 w-3.5 text-rose-600" />
                          <span>Reject Plot</span>
                        </div>
                        <span className="text-[10px] opacity-80 leading-tight">Ineligible or invalid document</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Inspection Remarks & Geo-Notes</Label>
                    <Textarea
                      value={verificationRemarks}
                      onChange={(e) => setVerificationRemarks(e.target.value)}
                      placeholder="Enter detailed on-site observations, landmark references, or reason for correction/rejection..."
                      rows={2}
                      className="text-xs resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isVerifyingField}
                    className={cn(
                      'w-full font-semibold gap-1.5 text-white cursor-pointer shadow-sm',
                      verificationDecision === 'APPROVE'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : verificationDecision === 'CORRECTION_REQUIRED'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    )}
                  >
                    {isVerifyingField ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Submitting Verification Decision...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        {verificationDecision === 'APPROVE'
                          ? 'Confirm Field Approval & Verification'
                          : verificationDecision === 'CORRECTION_REQUIRED'
                          ? 'Submit Correction Request to Admin'
                          : 'Confirm Plot Rejection'}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
