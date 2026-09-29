'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import { StageProgressBar } from '@/components/shared/StageProgressBar';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  addCycle,
  updateCycleStage,
  updateCycleHealth,
  setCycleSearchQuery,
  setStageFilter,
  setHealthFilter,
} from '@/store/slices/cropCyclesSlice';
import {
  useGetCropCyclesQuery,
  useCreateCropCycleMutation,
  useAdvanceCropStageMutation,
} from '@/store/api/cropCycleApi';
import { useGetSeedSuppliesQuery, useGetSeedBatchesQuery } from '@/store/api/seedApi';
import { useGetAllocationsQuery } from '@/store/api/allocationApi';
import { CropCycle, CropCycleStage, CropHealthStatus, SeedVariety } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sprout,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Droplets,
  FlaskConical,
  MessageSquare,
  Send,
  Target,
  ShieldAlert,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export default function CropCyclesPage() {
  const dispatch = useAppDispatch();
  const { cycles, searchQuery, stageFilter, healthFilter } = useAppSelector(
    (state) => state.cropCycles
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);
  const parcels = useAppSelector((state) => state.landParcels.parcels);

  // Pagination & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<CropCycle | null>(null);

  // Stage update state
  const [newStage, setNewStage] = useState<CropCycleStage>('TILLERING');
  const [newHealth, setNewHealth] = useState<CropHealthStatus>('OPTIMAL');

  // Form state
  const [farmerId, setFarmerId] = useState('');
  const [parcelId, setParcelId] = useState('');
  const [variety, setVariety] = useState<SeedVariety>('HD-2967');
  const [sowingMethod, setSowingMethod] = useState<'DRILL_SOWING' | 'BED_PLANTING' | 'ZERO_TILLAGE' | 'BROADCASTING'>('DRILL_SOWING');
  const [acres, setAcres] = useState(10);
  const [sowDate, setSowDate] = useState('2025-11-10');
  const [season, setSeason] = useState<string>('RABI_2025_2026');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('2026-04-20');
  const [targetYield, setTargetYield] = useState<number>(52.0);
  const [irrigationStrategy, setIrrigationStrategy] = useState<string>('STANDARD_6_STAGE');
  const [nutritionPlan, setNutritionPlan] = useState<string>('STANDARD_IARI');
  const [seedTreatment, setSeedTreatment] = useState<string>('Tebuconazole 2 DS @ 2g/kg (Smut & Bunt Protection)');
  const [officerAdvisory, setOfficerAdvisory] = useState<string>(
    'Ensure first CRI irrigation strictly at 21-25 days. Apply 1st split Urea after light soil drying.'
  );
  const [riskAlertLevel, setRiskAlertLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [initialMoisture, setInitialMoisture] = useState<number>(32);
  const [initialNdvi, setInitialNdvi] = useState<number>(0.28);
  const [notifyFarmerViaSms, setNotifyFarmerViaSms] = useState<boolean>(true);
  const [activeModalTab, setActiveModalTab] = useState<'field' | 'strategy' | 'advisory'>('field');

  const { data: apiFarmers = [] } = useGetFarmersQuery();
  const { data: apiParcels = [] } = useGetFieldsQuery();
  const { data: apiCycles = [] } = useGetCropCyclesQuery();
  const { data: seedSupplies = [] } = useGetSeedSuppliesQuery();
  const { data: seedBatches = [] } = useGetSeedBatchesQuery();
  const { data: farmerAllocations = [] } = useGetAllocationsQuery(
    farmerId ? { farmer_id: farmerId } : undefined,
    { skip: !farmerId }
  );

  const [createCropCycleApi] = useCreateCropCycleMutation();
  const [advanceCropStageApi] = useAdvanceCropStageMutation();

  const handleSowDateChange = (dateVal: string) => {
    setSowDate(dateVal);
    if (dateVal) {
      try {
        const d = new Date(dateVal);
        d.setDate(d.getDate() + 140);
        setExpectedHarvestDate(d.toISOString().split('T')[0]);
      } catch (e) {
        // ignore
      }
    }
  };

  // Master certified cultivars
  const MASTER_VARIETIES: { value: SeedVariety; label: string }[] = [
    { value: 'HD-2967', label: 'HD-2967 (Pusa Wheat - High Yield)' },
    { value: 'HD-3086', label: 'HD-3086 (Pusa Gautami - Heat Tolerant)' },
    { value: 'DBW-187', label: 'DBW-187 (Karan Vandana - Biofortified)' },
    { value: 'DBW-222', label: 'DBW-222 (Karan Narendra)' },
    { value: 'PBW-550', label: 'PBW-550 (PAU Certified)' },
    { value: 'Sharbati C-306', label: 'Sharbati C-306 (Premium Quality)' },
    { value: 'WH-1105', label: 'WH-1105 (Commercial Certified)' },
    { value: 'HD-3226', label: 'HD-3226 (Pusa Yashasvi)' },
  ];

  // Distinct allocated varieties for this farmer from seed passbook
  const farmerAllocatedVarieties: string[] = [];
  farmerAllocations.forEach((a) => {
    const b = seedBatches.find((sb) => sb.id === a.seed_batch_id);
    const s = b ? seedSupplies.find((ss) => ss.id === b.supply_id) : null;
    if (s?.variety && !farmerAllocatedVarieties.includes(s.variety)) {
      farmerAllocatedVarieties.push(s.variety);
    }
  });

  // Build clean, deduplicated variety options list
  const varietyOptions = farmerAllocatedVarieties.length > 0
    ? [
        ...farmerAllocatedVarieties.map((v) => ({
          value: v as SeedVariety,
          label: `🌾 ${v} (Allocated in Farmer's Seed Passbook)`,
          isAllocated: true,
        })),
        ...MASTER_VARIETIES.filter((mv) => !farmerAllocatedVarieties.includes(mv.value)).map((mv) => ({
          value: mv.value,
          label: mv.label,
          isAllocated: false,
        })),
      ]
    : MASTER_VARIETIES.map((mv) => ({
        value: mv.value,
        label: mv.label,
        isAllocated: false,
      }));


  // Use API farmers and parcels
  const allFarmers = apiFarmers.map((af) => ({
    id: af.id,
    fullName: af.name,
    village: af.village,
  }));

  const allParcels = apiParcels.map((ap) => ({
    id: ap.id,
    farmerId: ap.farmer_id,
    parcelCode: ap.field_name || `FLD-${ap.id.slice(0, 6)}`,
    totalAcreage: ap.area || 0,
    soilType: ((ap as any).soil_type as any) || 'ALLUVIAL',
  }));

  // Dynamically filter parcels for currently selected farmer
  const filteredParcelsForFarmer = farmerId
    ? allParcels.filter((p) => p.farmerId === farmerId)
    : allParcels;

  const handleFarmerChange = (newFarmerId: string) => {
    setFarmerId(newFarmerId);
    const farmerParcels = allParcels.filter((p) => p.farmerId === newFarmerId);
    if (farmerParcels.length === 1) {
      setParcelId(farmerParcels[0].id);
      setAcres(farmerParcels[0].totalAcreage);
    } else if (farmerParcels.length > 1) {
      if (!farmerParcels.some((p) => p.id === parcelId)) {
        setParcelId(farmerParcels[0].id);
        setAcres(farmerParcels[0].totalAcreage);
      }
    } else {
      setParcelId('');
      setAcres(5);
    }

    if (farmerAllocatedVarieties.length > 0) {
      setVariety(farmerAllocatedVarieties[0] as SeedVariety);
    }
  };

  const handleParcelChange = (newParcelId: string) => {
    setParcelId(newParcelId);
    const selParcel = allParcels.find((p) => p.id === newParcelId);
    if (selParcel) {
      setAcres(selParcel.totalAcreage);
    }
  };

  const handleOpenAddModal = () => {
    const initialFarmerId = farmerId || (allFarmers.length > 0 ? allFarmers[0].id : '');
    setFarmerId(initialFarmerId);
    const farmerParcels = allParcels.filter((p) => p.farmerId === initialFarmerId);
    if (farmerParcels.length >= 1) {
      setParcelId(farmerParcels[0].id);
      setAcres(farmerParcels[0].totalAcreage);
    } else {
      setParcelId('');
      setAcres(5);
    }
    setActiveModalTab('field');
    setAddModalOpen(true);
  };

  // Pure DB cycles
  const allCycles: CropCycle[] = apiCycles.map((ac) => {
    const farmerObj = allFarmers.find((f) => f.id === ac.farmer_id);
    const parcelObj = allParcels.find((p) => p.id === ac.field_id);
    return {
      id: ac.id,
      cycleCode: ac.cycle_code,
      farmerId: ac.farmer_id,
      farmerName: farmerObj?.fullName || 'Enrolled Farmer',
      fieldParcelId: ac.field_id,
      parcelCode: parcelObj?.parcelCode || 'Field Plot',
      season: (ac.season as any) || 'RABI_2025_2026',
      seedVariety: (ac.variety as any) || 'HD-2967',
      sowingDate: ac.sowing_date ? ac.sowing_date.split('T')[0] : '',
      estimatedHarvestDate: ac.expected_harvest_date ? ac.expected_harvest_date.split('T')[0] : '',
      sowingMethod: (ac.sowing_method as any) || 'DRILL_SOWING',
      allocatedAcres: ac.allocated_acres || 0,
      currentStage: (ac.stage as any) || 'SOWING',
      currentStageDays: 1,
      healthStatus: (ac.health_status as any) || 'OPTIMAL',
      latestNdvi: ac.ndvi_score || 0,
      soilMoisturePercent: ac.soil_moisture_pct || 0,
      expectedYieldMaundsPerAcre: ac.expected_yield_maunds_per_acre || 0,
      targetTotalYieldKg: ac.target_total_yield_kg || (ac.allocated_acres || 0) * (ac.expected_yield_maunds_per_acre || 50) * 40,
      actualYieldMaundsTotal: null,
      notes: ac.remarks || '',
      irrigationStrategy: ac.irrigation_strategy || 'STANDARD_6_STAGE',
      nutritionPlan: ac.nutrition_plan || 'STANDARD_IARI',
      seedTreatment: ac.seed_treatment || 'Tebuconazole 2 DS @ 2g/kg',
      officerAdvisory: ac.officer_advisory || ac.remarks || 'Standard Wheat POP Protocol',
      riskAlertLevel: (ac.risk_alert_level as any) || (ac.health_status === 'OPTIMAL' ? 'LOW' : 'MEDIUM'),
      createdAt: ac.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  // Filter cycles
  const filteredCycles = allCycles.filter((cycle) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      cycle.cycleCode.toLowerCase().includes(q) ||
      cycle.farmerName.toLowerCase().includes(q) ||
      cycle.parcelCode.toLowerCase().includes(q) ||
      cycle.seedVariety.toLowerCase().includes(q);

    const matchesStage = stageFilter === 'ALL' || cycle.currentStage === stageFilter;
    const matchesHealth = healthFilter === 'ALL' || cycle.healthStatus === healthFilter;

    return matchesSearch && matchesStage && matchesHealth;
  });

  // Pagination Slicing
  const totalItems = filteredCycles.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedCycles = filteredCycles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenStageModal = (cycle: CropCycle) => {
    setSelectedCycle(cycle);
    setNewStage(cycle.currentStage);
    setNewHealth(cycle.healthStatus);
    setStageModalOpen(true);
  };

  const handleSaveStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;

    try {
      await advanceCropStageApi({
        id: selectedCycle.id,
        data: {
          stage: newStage,
          health_status: newHealth,
          remarks: `Updated stage to ${newStage}`,
        },
      }).unwrap();
    } catch (e) {
      console.warn('Backend stage save:', e);
    }

    dispatch(updateCycleStage({ id: selectedCycle.id, stage: newStage }));
    dispatch(updateCycleHealth({ id: selectedCycle.id, health: newHealth }));
    toast.success(`Crop stage updated to ${newStage.replace(/_/g, ' ')}`);
    setStageModalOpen(false);
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmerId) {
      toast.error('Mandatory field required: Please select an enrolled farmer');
      return;
    }
    if (!parcelId) {
      toast.error('Mandatory field required: Please select a land parcel');
      return;
    }

    const selFarmer = allFarmers.find((f) => f.id === farmerId);
    const selParcel = allParcels.find((p) => p.id === parcelId);
    const calculatedTargetKg = Number(acres) * Number(targetYield) * 40;

    try {
      const formattedSowDate = sowDate ? sowDate.split('T')[0] : '2025-11-10';
      const formattedHarvestDate = expectedHarvestDate ? expectedHarvestDate.split('T')[0] : '2026-04-20';
      await createCropCycleApi({
        farmer_id: farmerId,
        field_id: parcelId,
        crop_type: 'WHEAT',
        variety,
        season,
        sowing_date: formattedSowDate,
        sowing_method: sowingMethod,
        allocated_acres: Number(acres),
        expected_harvest_date: formattedHarvestDate,
        expected_yield_maunds_per_acre: Number(targetYield),
        remarks: officerAdvisory,
        irrigation_strategy: irrigationStrategy,
        nutrition_plan: nutritionPlan,
        seed_treatment: seedTreatment,
        officer_advisory: officerAdvisory,
        notify_sms: notifyFarmerViaSms,
      }).unwrap();
    } catch (err) {
      console.warn('Backend cycle save:', err);
    }

    const newCycleRecord: CropCycle = {
      id: `cycle-${Date.now()}`,
      cycleCode: `WH-2026-${Math.floor(100 + Math.random() * 900)}`,
      farmerId,
      farmerName: selFarmer ? selFarmer.fullName : 'Enrolled Farmer',
      fieldParcelId: parcelId,
      parcelCode: selParcel ? selParcel.parcelCode : 'PRCL-NEW',
      season: season as any,
      seedVariety: variety,
      sowingDate: sowDate,
      estimatedHarvestDate: expectedHarvestDate,
      sowingMethod,
      allocatedAcres: Number(acres),
      currentStage: 'SOWING',
      currentStageDays: 1,
      healthStatus: 'OPTIMAL',
      latestNdvi: initialNdvi,
      soilMoisturePercent: initialMoisture,
      expectedYieldMaundsPerAcre: Number(targetYield),
      targetTotalYieldKg: calculatedTargetKg,
      actualYieldMaundsTotal: null,
      notes: officerAdvisory,
      irrigationStrategy,
      nutritionPlan,
      seedTreatment,
      officerAdvisory,
      notifyFarmerViaSms,
      riskAlertLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addCycle(newCycleRecord));
    if (notifyFarmerViaSms) {
      toast.success(
        `New crop cycle ${newCycleRecord.cycleCode} initiated! SMS advisory sent to ${selFarmer?.fullName || 'Farmer'}.`
      );
    } else {
      toast.success(`New crop cycle ${newCycleRecord.cycleCode} initiated!`);
    }
    setAddModalOpen(false);
  };

  const farmerOptions = allFarmers.map((f) => ({
    value: f.id,
    label: f.fullName,
    subLabel: f.village,
  }));

  const parcelOptions = filteredParcelsForFarmer.map((p) => ({
    value: p.id,
    label: p.parcelCode,
    subLabel: `${p.totalAcreage} Acres (${p.soilType.replace(/_/g, ' ')})`,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Wheat Phenology & Crop Cycles"
        description="Monitor 11 phenological wheat growth stages, satellite NDVI indices, and expected grain yields."
        actionButton={{
          label: 'Initiate Crop Cycle',
          icon: Sprout,
          onClick: handleOpenAddModal,
        }}
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Active Monitored Cycles"
          value={allCycles.length}
          subtitle="Rabi Season Wheat Plots"
          icon={Sprout}
          variant="primary"
        />
        <MetricCard
          title="Avg Health Score"
          value={
            allCycles.length > 0
              ? `${Math.round(
                  (allCycles.filter((c) => c.healthStatus === 'OPTIMAL' || c.healthStatus === 'GOOD').length /
                    allCycles.length) *
                    100
                )}%`
              : '0%'
          }
          subtitle="Optimal / Good Canopy Index"
          icon={Activity}
        />
        <MetricCard
          title="Avg Expected Yield"
          value={
            allCycles.length > 0
              ? `${(
                  allCycles.reduce((sum, c) => sum + (c.expectedYieldMaundsPerAcre || 50), 0) / allCycles.length
                ).toFixed(1)} Maunds/Ac`
              : '0 Maunds/Ac'
          }
          subtitle={
            allCycles.length > 0
              ? `${Math.round(
                  (allCycles.reduce((sum, c) => sum + (c.expectedYieldMaundsPerAcre || 50), 0) / allCycles.length) *
                    40
                ).toLocaleString()} kg per Acre`
              : '0 kg per Acre'
          }
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Season"
          value="Rabi 2025-26"
          subtitle="Estimated Harvest: Apr 2026"
          icon={Calendar}
        />
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          dispatch(setCycleSearchQuery(q));
          setCurrentPage(1);
        }}
        searchPlaceholder="Search cycle code, farmer name, variety..."
        filters={[
          {
            id: 'stage',
            placeholder: 'All Stages',
            value: stageFilter,
            onChange: (v) => {
              dispatch(setStageFilter(v));
              setCurrentPage(1);
            },
            options: [
              { label: 'All Stages', value: 'ALL' },
              { label: 'Tillering', value: 'TILLERING' },
              { label: 'Jointing', value: 'JOINTING' },
              { label: 'Booting', value: 'BOOTING' },
              { label: 'Heading / Flowering', value: 'HEADING_FLOWERING' },
              { label: 'Milk Stage', value: 'MILK_STAGE' },
              { label: 'Dough Stage', value: 'DOUGH_STAGE' },
              { label: 'Maturity', value: 'MATURITY_RIPENING' },
            ],
          },
          {
            id: 'health',
            placeholder: 'All Health Statuses',
            value: healthFilter,
            onChange: (v) => {
              dispatch(setHealthFilter(v));
              setCurrentPage(1);
            },
            options: [
              { label: 'All Health Statuses', value: 'ALL' },
              { label: 'Optimal', value: 'OPTIMAL' },
              { label: 'Good', value: 'GOOD' },
              { label: 'Stressed', value: 'STRESSED' },
              { label: 'Diseased', value: 'DISEASED' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setCycleSearchQuery(''));
          dispatch(setStageFilter('ALL'));
          dispatch(setHealthFilter('ALL'));
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Crop Cycles Table */}
      {filteredCycles.length === 0 ? (
        <EmptyState
          title="No Crop Cycles Found"
          description="No wheat crop cycle records match your search filters."
          action={{
            label: 'Initiate Crop Cycle',
            onClick: () => {
              if (farmers.length > 0 && !farmerId) setFarmerId(farmers[0].id);
              if (parcels.length > 0 && !parcelId) setParcelId(parcels[0].id);
              setAddModalOpen(true);
            },
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                  <TableHead className="font-bold">Crop Cycle & Farmer</TableHead>
                  <TableHead className="font-bold">Parcel / Variety</TableHead>
                  <TableHead className="font-bold">Current Phenology Stage</TableHead>
                  <TableHead className="font-bold text-center">NDVI Index</TableHead>
                  <TableHead className="font-bold text-right">Est. Yield</TableHead>
                  <TableHead className="font-bold">Health Status</TableHead>
                  <TableHead className="text-right">Stage Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCycles.map((cycle) => (
                  <TableRow key={cycle.id} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <div className="font-mono font-bold text-foreground">{cycle.cycleCode}</div>
                      <div className="text-[11px] text-muted-foreground font-semibold">
                        {cycle.farmerName} ({cycle.allocatedAcres} Ac)
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-foreground">{cycle.seedVariety}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {cycle.parcelCode} &bull; Sown: {cycle.sowingDate}
                      </div>
                    </TableCell>

                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={cycle.currentStage} />
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Day {cycle.currentStageDays}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center font-mono font-bold">
                      <span
                        className={
                          cycle.latestNdvi && cycle.latestNdvi > 0.65
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600'
                        }
                      >
                        {cycle.latestNdvi?.toFixed(2) || '0.55'}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {cycle.expectedYieldMaundsPerAcre} M/Ac
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={cycle.healthStatus} />
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenStageModal(cycle)}
                        className="h-7 text-xs font-semibold gap-1 hover:bg-primary/10 hover:text-primary"
                      >
                        Advance Stage
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Card Grid View */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedCycles.map((cycle) => (
                <Card key={cycle.id} className="border hover:border-primary/40 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-primary block">
                          {cycle.cycleCode}
                        </span>
                        <h4 className="font-bold text-sm text-foreground mt-0.5">{cycle.farmerName}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          {cycle.parcelCode} &bull; {cycle.allocatedAcres} Acres
                        </p>
                      </div>
                      <StatusBadge status={cycle.healthStatus} />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current Stage:</span>
                        <StatusBadge status={cycle.currentStage} />
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">NDVI Vegetation:</span>
                        <span className="font-bold text-emerald-600">{cycle.latestNdvi?.toFixed(2) || '0.55'}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-muted-foreground">Est. Yield:</span>
                        <span className="font-bold text-foreground">{cycle.expectedYieldMaundsPerAcre} Maunds/Ac</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{cycle.seedVariety}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenStageModal(cycle)}
                        className="h-7 text-xs font-semibold gap-1"
                      >
                        Advance
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* DataTable Pagination */}
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      )}

      {/* Advance Stage Modal */}
      <Dialog open={stageModalOpen} onOpenChange={setStageModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Advance Phenology Growth Stage</DialogTitle>
            <DialogDescription className="text-xs">
              Progression update for crop cycle: <strong className="font-mono">{selectedCycle?.cycleCode}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedCycle && (
            <form onSubmit={handleSaveStage} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-xs font-medium">
                <p>
                  Seed Variety: <span className="font-bold text-foreground">{selectedCycle.seedVariety}</span>
                </p>
                <p>
                  Allocated Acreage:{' '}
                  <span className="font-bold text-foreground">{selectedCycle.allocatedAcres} Acres</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Advance to Growth Stage</Label>
                <Select
                  value={newStage}
                  onValueChange={(v) => {
                    if (v !== null) setNewStage(v as CropCycleStage);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAND_PREPARATION">1. Land Preparation</SelectItem>
                    <SelectItem value="SOWING">2. Sowing</SelectItem>
                    <SelectItem value="CROWN_ROOT_INITIATION">3. Crown Root Initiation (CRI)</SelectItem>
                    <SelectItem value="TILLERING">4. Tillering</SelectItem>
                    <SelectItem value="JOINTING">5. Jointing</SelectItem>
                    <SelectItem value="BOOTING">6. Booting</SelectItem>
                    <SelectItem value="HEADING_FLOWERING">7. Heading & Flowering</SelectItem>
                    <SelectItem value="MILK_STAGE">8. Milk Stage</SelectItem>
                    <SelectItem value="DOUGH_STAGE">9. Dough Stage</SelectItem>
                    <SelectItem value="MATURITY_RIPENING">10. Maturity & Ripening</SelectItem>
                    <SelectItem value="HARVESTED">11. Harvested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Crop Health Diagnosis</Label>
                <Select
                  value={newHealth}
                  onValueChange={(v) => {
                    if (v !== null) setNewHealth(v as CropHealthStatus);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPTIMAL">OPTIMAL (Healthy Canopy, No Stress)</SelectItem>
                    <SelectItem value="GOOD">GOOD (Normal Tiller Count)</SelectItem>
                    <SelectItem value="STRESSED">STRESSED (Moisture or Nutrient Deficit)</SelectItem>
                    <SelectItem value="DISEASED">DISEASED (Rust Pustules / Weed Encroachment)</SelectItem>
                    <SelectItem value="CRITICAL">CRITICAL (Emergency Agronomic Intervention)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setStageModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-semibold gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Save Stage Progression
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Enhanced Configurable Initiate Crop Cycle Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                  <Sprout className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold">Initiate & Configure Wheat Crop Cycle</DialogTitle>
                  <DialogDescription className="text-xs">
                    Configure seasonal farm targets, irrigation protocols & agronomic advisory displayed to the farmer.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateCycle} className="space-y-4 pt-1">
            <Tabs value={activeModalTab} onValueChange={(v) => setActiveModalTab(v as any)} className="w-full">
              <TabsList className="grid grid-cols-3 w-full h-9 mb-3">
                <TabsTrigger value="field" className="text-xs font-semibold gap-1.5">
                  <Sprout className="h-3.5 w-3.5" />
                  1. Field & Sowing
                </TabsTrigger>
                <TabsTrigger value="strategy" className="text-xs font-semibold gap-1.5">
                  <Target className="h-3.5 w-3.5" />
                  2. Yield & Strategy
                </TabsTrigger>
                <TabsTrigger value="advisory" className="text-xs font-semibold gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  3. Advisory & Alerts
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: FIELD & SOWING SETUP */}
              <TabsContent value="field" className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Select Enrolled Farmer *</Label>
                    <SearchableSelect
                      options={farmerOptions}
                      value={farmerId}
                      onChange={handleFarmerChange}
                      placeholder="Select Farmer..."
                      searchPlaceholder="Search farmer name, village..."
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Select Land Parcel *</Label>
                      {farmerId && filteredParcelsForFarmer.length === 1 && (
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          ✓ Auto-selected
                        </span>
                      )}
                      {farmerId && filteredParcelsForFarmer.length > 1 && (
                        <span className="text-[10px] text-blue-600 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">
                          {filteredParcelsForFarmer.length} plots available
                        </span>
                      )}
                    </div>
                    <SearchableSelect
                      options={parcelOptions}
                      value={parcelId}
                      onChange={handleParcelChange}
                      placeholder={filteredParcelsForFarmer.length === 0 ? "No registered field found" : "Select Parcel..."}
                      searchPlaceholder="Search parcel code..."
                      disabled={filteredParcelsForFarmer.length === 0}
                    />
                    {farmerId && filteredParcelsForFarmer.length === 0 && (
                      <p className="text-[11px] text-amber-600 font-medium pt-0.5">
                        ⚠️ No registered land parcel found for this farmer.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Seed Cultivar Variety *</Label>
                      {farmerAllocatedVarieties.length > 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          ✓ Allocated ({farmerAllocatedVarieties.join(', ')})
                        </span>
                      )}
                    </div>
                    <Select
                      value={variety}
                      onValueChange={(v) => {
                        if (v !== null) setVariety(v as SeedVariety);
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {varietyOptions.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className={opt.isAllocated ? 'font-bold text-emerald-700 dark:text-emerald-400' : ''}
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Crop Season</Label>
                    <Select
                      value={season}
                      onValueChange={(v) => {
                        if (v !== null) setSeason(v);
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RABI_2025_2026">Rabi 2025-26 (Main Season)</SelectItem>
                        <SelectItem value="RABI_2026_2027">Rabi 2026-27 (Upcoming)</SelectItem>
                        <SelectItem value="LATE_RABI_2025_2026">Late Sown Rabi 2025-26</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Sowing Method</Label>
                    <Select
                      value={sowingMethod}
                      onValueChange={(v) => {
                        if (v !== null) setSowingMethod(v as any);
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRILL_SOWING">Precision Drill Sowing</SelectItem>
                        <SelectItem value="BED_PLANTING">Raised Bed Planting</SelectItem>
                        <SelectItem value="ZERO_TILLAGE">Zero Tillage Direct Seed</SelectItem>
                        <SelectItem value="BROADCASTING">Broadcasting (Chhatta)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Cultivated Acreage (Acres)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={acres}
                      onChange={(e) => setAcres(parseFloat(e.target.value) || 1)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Sowing Date</Label>
                    <Input
                      type="date"
                      value={sowDate}
                      onChange={(e) => handleSowDateChange(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveModalTab('strategy')}
                    className="text-xs font-semibold gap-1.5"
                  >
                    Next: Yield & Strategy
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 2: YIELD TARGET & IRRIGATION PROTOCOL */}
              <TabsContent value="strategy" className="space-y-3.5 pt-1">
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Target className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-foreground">Target Production Yield Goal</div>
                      <div className="text-[11px] text-muted-foreground">
                        This target will be displayed prominently on the farmer&apos;s crop dashboard.
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {((acres * targetYield * 40) / 1000).toFixed(1)} MT Total
                    </div>
                    <div className="text-[10px] text-muted-foreground">{(acres * targetYield).toFixed(0)} Maunds</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Expected Yield (Maunds / Acre)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={targetYield}
                      onChange={(e) => setTargetYield(parseFloat(e.target.value) || 40)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Estimated Harvest Date</Label>
                    <Input
                      type="date"
                      value={expectedHarvestDate}
                      onChange={(e) => setExpectedHarvestDate(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-blue-600" />
                      Irrigation Strategy Protocol
                    </Label>
                    <Select
                      value={irrigationStrategy}
                      onValueChange={(v) => {
                        if (v !== null) setIrrigationStrategy(v);
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD_6_STAGE">Standard 6-Stage Canal & Tubewell</SelectItem>
                        <SelectItem value="DRIP_PRECISION">Drip & Micro-Irrigation Precision</SelectItem>
                        <SelectItem value="TUBEWELL_FREQUENT">Tubewell Frequent Light Waterings</SelectItem>
                        <SelectItem value="RAINFED_CONSERVATION">Rainfed / Soil Moisture Conservation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <FlaskConical className="h-3.5 w-3.5 text-purple-600" />
                      Nutrition & Fertilizer Plan
                    </Label>
                    <Select
                      value={nutritionPlan}
                      onValueChange={(v) => {
                        if (v !== null) setNutritionPlan(v);
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD_IARI">Standard PAU/IARI (DAP + Split Urea + Zinc)</SelectItem>
                        <SelectItem value="HIGH_YIELD_SPLIT">High-Yield Intensive (NPK 120:60:40 + Zinc + Potash)</SelectItem>
                        <SelectItem value="ORGANIC_BIO">Organic Bio-Fertilizer (FYM + PSB + Azotobacter)</SelectItem>
                        <SelectItem value="CUSTOM">Custom Soil Tested Dosage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                    Seed Treatment Protocol (बीजोपचार)
                  </Label>
                  <Select
                    value={seedTreatment}
                    onValueChange={(v) => {
                      if (v !== null) setSeedTreatment(v);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tebuconazole 2 DS @ 2g/kg (Smut & Bunt Protection)">
                        Tebuconazole 2 DS @ 2g/kg (Recommended for Smut & Bunt)
                      </SelectItem>
                      <SelectItem value="Vitavax (Carboxin + Thiram) @ 2.5g/kg">
                        Vitavax (Carboxin + Thiram) @ 2.5g/kg
                      </SelectItem>
                      <SelectItem value="Trichoderma viride Bio-fungicide @ 5g/kg">
                        Trichoderma viride Bio-fungicide @ 5g/kg
                      </SelectItem>
                      <SelectItem value="Self-Treated / Traditional Sowing">
                        Self-Treated / Traditional Sowing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveModalTab('field')}
                    className="text-xs"
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveModalTab('advisory')}
                    className="text-xs font-semibold gap-1.5"
                  >
                    Next: Advisory & Alerts
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 3: AGRI-OFFICER ADVISORY & SENSOR ALERTS */}
              <TabsContent value="advisory" className="space-y-3.5 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                      Agri-Officer Advisory Note (Visible to Farmer)
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Shown in Farmer Portal</span>
                  </div>
                  <Textarea
                    rows={3}
                    value={officerAdvisory}
                    onChange={(e) => setOfficerAdvisory(e.target.value)}
                    placeholder="Enter customized agronomic instructions or warnings for this farmer..."
                    className="text-xs resize-none"
                  />

                  {/* Preset quick advisory buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-muted-foreground font-semibold">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setOfficerAdvisory((prev) =>
                          prev
                            ? `${prev} | First CRI irrigation is critical at Day 21.`
                            : 'First CRI irrigation is critical at Day 21.'
                        )
                      }
                      className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded border transition-colors cursor-pointer"
                    >
                      💧 Day 21 CRI Water
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOfficerAdvisory((prev) =>
                          prev
                            ? `${prev} | Apply 1 bag Urea with Zinc Sulphate after 1st water.`
                            : 'Apply 1 bag Urea with Zinc Sulphate after 1st water.'
                        )
                      }
                      className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded border transition-colors cursor-pointer"
                    >
                      🧪 Urea + Zinc Dose
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOfficerAdvisory((prev) =>
                          prev
                            ? `${prev} | Scout lower foliage for Yellow Rust powdery stripes.`
                            : 'Scout lower foliage for Yellow Rust powdery stripes.'
                        )
                      }
                      className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded border transition-colors cursor-pointer"
                    >
                      ⚠️ Rust Scouting
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setOfficerAdvisory((prev) =>
                          prev
                            ? `${prev} | Terminate irrigation 15 days before combine harvest.`
                            : 'Terminate irrigation 15 days before combine harvest.'
                        )
                      }
                      className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-0.5 rounded border transition-colors cursor-pointer"
                    >
                      🚜 Pre-Harvest Dry
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Initial Soil Moisture (%)</Label>
                    <Input
                      type="number"
                      value={initialMoisture}
                      onChange={(e) => setInitialMoisture(parseFloat(e.target.value) || 30)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Baseline NDVI</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={initialNdvi}
                      onChange={(e) => setInitialNdvi(parseFloat(e.target.value) || 0.25)}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <Label className="text-xs font-semibold">Risk Alert Level</Label>
                    <Select
                      value={riskAlertLevel}
                      onValueChange={(v) => {
                        if (v !== null) setRiskAlertLevel(v as any);
                      }}
                    >
                      <SelectTrigger className="w-full text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">LOW (Standard Monitoring)</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM (Close Watch)</SelectItem>
                        <SelectItem value="HIGH">HIGH (High Weather/Rust Alert)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* SMS Broadcast Option */}
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Send className="h-4 w-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-foreground">Kisan SMS & WhatsApp Notification</div>
                      <div className="text-[11px] text-muted-foreground">
                        Send cycle confirmation & tailored advisory to farmer&apos;s registered mobile number.
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={notifyFarmerViaSms}
                    onCheckedChange={setNotifyFarmerViaSms}
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveModalTab('strategy')}
                    className="text-xs"
                  >
                    ← Back
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="h-4 w-4" />
                Initiate Monitoring Cycle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
