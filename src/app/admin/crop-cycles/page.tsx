'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import { StageProgressBar } from '@/components/shared/StageProgressBar';
import {
  addCycle,
  updateCycleStage,
  updateCycleHealth,
  setCycleSearchQuery,
  setStageFilter,
  setHealthFilter,
} from '@/store/slices/cropCyclesSlice';
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
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function CropCyclesPage() {
  const dispatch = useAppDispatch();
  const { cycles, searchQuery, stageFilter, healthFilter } = useAppSelector(
    (state) => state.cropCycles
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);
  const parcels = useAppSelector((state) => state.landParcels.parcels);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<CropCycle | null>(null);

  // Form State for Stage Advance
  const [newStage, setNewStage] = useState<CropCycleStage>('HEADING_FLOWERING');
  const [newHealth, setNewHealth] = useState<CropHealthStatus>('OPTIMAL');

  // Form State for New Cycle
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [parcelId, setParcelId] = useState(parcels[0]?.id || '');
  const [variety, setVariety] = useState<SeedVariety>('HD-2967');
  const [sowingMethod, setSowingMethod] = useState<'DRILL_SOWING' | 'BED_PLANTING' | 'ZERO_TILLAGE' | 'BROADCASTING'>('DRILL_SOWING');
  const [acres, setAcres] = useState<number>(10);

  // Filter Logic
  const filteredCycles = cycles.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.cycleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parcelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.seedVariety.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === 'ALL' || c.currentStage === stageFilter;
    const matchesHealth = healthFilter === 'ALL' || c.healthStatus === healthFilter;

    return matchesSearch && matchesStage && matchesHealth;
  });

  const totalAcres = cycles.reduce((sum, c) => sum + c.allocatedAcres, 0);
  const avgNdvi = (cycles.reduce((sum, c) => sum + c.ndviScore, 0) / (cycles.length || 1)).toFixed(2);

  const handleAdvanceStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCycle) {
      dispatch(updateCycleStage({ id: selectedCycle.id, stage: newStage }));
      dispatch(updateCycleHealth({ id: selectedCycle.id, health: newHealth }));
      toast.success(`Cycle ${selectedCycle.cycleCode} updated to stage ${newStage.replace(/_/g, ' ')}!`);
      setStageModalOpen(false);
    }
  };

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    const selFarmer = farmers.find(f => f.id === farmerId) || farmers[0];
    const selParcel = parcels.find(p => p.id === parcelId) || parcels[0];
    const newCycle: CropCycle = {
      id: `CYCLE-${String(cycles.length + 1).padStart(3, '0')}`,
      cycleCode: `WHEAT-2025-26-F0${cycles.length + 1}`,
      season: 'RABI_2025_2026',
      farmerId: selFarmer.id,
      farmerName: selFarmer.fullName,
      fieldParcelId: selParcel.id,
      parcelCode: selParcel.parcelCode,
      seedVariety: variety,
      sowingDate: new Date().toISOString().split('T')[0],
      sowingMethod: sowingMethod,
      allocatedAcres: Number(acres),
      currentStage: 'SOWING',
      healthStatus: 'OPTIMAL',
      expectedHarvestDate: '2026-04-20',
      expectedYieldMaundsPerAcre: 52,
      targetTotalYieldKg: Number(acres) * 52 * 40,
      ndviScore: 0.85,
      soilMoisturePct: 35,
      temperatureCelsius: 24,
      riskAlertLevel: 'NONE',
      lastInspectionDate: new Date().toISOString().split('T')[0]
    };

    dispatch(addCycle(newCycle));
    toast.success(`Wheat Crop Cycle ${newCycle.cycleCode} initiated!`);
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Wheat Crop Cycles & Phenology"
        description="10-stage growth phenology tracking from crown root initiation to maturity, satellite NDVI scoring, and yield forecasting."
        actionButton={{
          label: 'Initiate Crop Cycle',
          icon: Plus,
          onClick: () => setAddModalOpen(true),
        }}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Crop Cycles"
          value={`${cycles.length} Enrolled`}
          subtitle={`${totalAcres} Cultivated Wheat Acres`}
          icon={Sprout}
          variant="primary"
        />
        <MetricCard
          title="Mean NDVI Health Index"
          value={avgNdvi}
          subtitle="Target: > 0.75 (Healthy Canopy)"
          icon={Activity}
          trend={{ value: '0.04', isPositive: true, label: 'above target' }}
        />
        <MetricCard
          title="Avg Expected Yield"
          value="51.4 Maunds/Ac"
          subtitle="2,056 kg per Acre"
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
        onSearchChange={(q) => dispatch(setCycleSearchQuery(q))}
        searchPlaceholder="Search cycle code, farmer name, variety..."
        filters={[
          {
            id: 'stage',
            placeholder: 'All Stages',
            value: stageFilter,
            onChange: (v) => dispatch(setStageFilter(v)),
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
            onChange: (v) => dispatch(setHealthFilter(v)),
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
        }}
      />

      {/* Crop Cycles Table */}
      {filteredCycles.length === 0 ? (
        <EmptyState
          title="No Crop Cycles Found"
          description="No wheat crop cycle records match your search filters."
          action={{
            label: 'Initiate Crop Cycle',
            onClick: () => setAddModalOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                <TableHead className="font-bold">Cycle ID & Farmer</TableHead>
                <TableHead className="font-bold">Parcel / Variety</TableHead>
                <TableHead className="font-bold">Current Phenology Stage</TableHead>
                <TableHead className="font-bold text-center">NDVI Index</TableHead>
                <TableHead className="font-bold text-right">Est. Yield</TableHead>
                <TableHead className="font-bold">Health Status</TableHead>
                <TableHead className="text-right">Stage Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCycles.map((cycle) => (
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
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 font-mono">
                      Target Harvest: {cycle.expectedHarvestDate}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                      {cycle.ndviScore.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {cycle.soilMoisturePct}% Moist
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-bold text-foreground text-sm">
                      {cycle.expectedYieldMaundsPerAcre} Mnds/Ac
                    </span>
                    <span className="text-[11px] text-muted-foreground block font-mono">
                      {(cycle.targetTotalYieldKg / 1000).toFixed(1)} Tons Net
                    </span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={cycle.healthStatus} />
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] font-semibold gap-1"
                      onClick={() => {
                        setSelectedCycle(cycle);
                        setNewStage(cycle.currentStage);
                        setNewHealth(cycle.healthStatus);
                        setStageModalOpen(true);
                      }}
                    >
                      <span>Advance</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] text-muted-foreground"
                      onClick={() => {
                        setSelectedCycle(cycle);
                        setDetailSheetOpen(true);
                      }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Stage Advance Dialog */}
      <Dialog open={stageModalOpen} onOpenChange={setStageModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedCycle && (
            <form onSubmit={handleAdvanceStage} className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Advance Phenology Stage</DialogTitle>
                <DialogDescription className="text-xs">
                  Update crop growth phase and health diagnosis for {selectedCycle.farmerName} ({selectedCycle.cycleCode}).
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-xs font-medium">
                <p>Seed Variety: <span className="font-bold text-foreground">{selectedCycle.seedVariety}</span></p>
                <p>Allocated Acreage: <span className="font-bold text-foreground">{selectedCycle.allocatedAcres} Acres</span></p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Advance to Growth Stage</Label>
                <Select value={newStage} onValueChange={(v) => { if (v !== null) setNewStage(v as CropCycleStage); }}>
                  <SelectTrigger>
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
                <Select value={newHealth} onValueChange={(v) => { if (v !== null) setNewHealth(v as CropHealthStatus); }}>
                  <SelectTrigger>
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
                <Button type="button" variant="outline" onClick={() => setStageModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-semibold gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Save Stage Progression
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Initiate Crop Cycle Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Initiate Wheat Crop Cycle</DialogTitle>
            <DialogDescription className="text-xs">
              Link enrolled farmer parcel to seasonal wheat cultivation monitoring.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCycle} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Select Enrolled Farmer</Label>
                <Select value={farmerId} onValueChange={(v) => { if (v !== null) setFarmerId(v); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.fullName} &bull; {f.village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Select Land Parcel</Label>
                <Select value={parcelId} onValueChange={(v) => { if (v !== null) setParcelId(v); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {parcels.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.parcelCode} ({p.totalAcreage} Ac, {p.soilType.replace(/_/g, ' ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Seed Variety</Label>
                <Select value={variety} onValueChange={(v) => { if (v !== null) setVariety(v as SeedVariety); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HD-2967">HD-2967</SelectItem>
                    <SelectItem value="HD-3086">HD-3086</SelectItem>
                    <SelectItem value="DBW-187">DBW-187</SelectItem>
                    <SelectItem value="DBW-222">DBW-222</SelectItem>
                    <SelectItem value="PBW-550">PBW-550</SelectItem>
                    <SelectItem value="Sharbati C-306">Sharbati C-306</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Sowing Method</Label>
                <Select value={sowingMethod} onValueChange={(v) => { if (v !== null) setSowingMethod(v as any); }}>
                  <SelectTrigger className="w-full">
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
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Cultivated Acreage (Acres)</Label>
              <Input
                type="number"
                step="0.5"
                value={acres}
                onChange={(e) => setAcres(parseFloat(e.target.value) || 1)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold">
                Start Crop Cycle Monitoring
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cycle Phenology Inspector Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-6">
          {selectedCycle && (
            <>
              <SheetHeader className="space-y-2 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedCycle.cycleCode}
                  </Badge>
                  <StatusBadge status={selectedCycle.healthStatus} />
                </div>
                <SheetTitle className="text-xl font-bold">{selectedCycle.farmerName}</SheetTitle>
                <SheetDescription className="text-xs">
                  {selectedCycle.seedVariety} &bull; {selectedCycle.parcelCode} ({selectedCycle.allocatedAcres} Acres)
                </SheetDescription>
              </SheetHeader>

              {/* Full Stage Progression Visual */}
              <div className="p-4 border rounded-lg bg-card space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Wheat Phenology Progress Timeline
                </h4>
                <StageProgressBar currentStage={selectedCycle.currentStage} />
              </div>

              {/* Satellite Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-muted/60 rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">NDVI Index</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedCycle.ndviScore}</p>
                </div>
                <div className="p-3 bg-muted/60 rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Moisture</p>
                  <p className="text-lg font-bold text-blue-600">{selectedCycle.soilMoisturePct}%</p>
                </div>
                <div className="p-3 bg-muted/60 rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Forecast Yield</p>
                  <p className="text-lg font-bold text-foreground">{selectedCycle.expectedYieldMaundsPerAcre} Mnds</p>
                </div>
              </div>

              {/* Agronomic Parameters */}
              <div className="p-4 border rounded-lg bg-card space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Sowing Method:</span>
                  <span className="font-semibold">{selectedCycle.sowingMethod.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Sowing Date:</span>
                  <span className="font-mono">{selectedCycle.sowingDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Expected Harvest:</span>
                  <span className="font-mono font-bold text-primary">{selectedCycle.expectedHarvestDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Last Field Inspection:</span>
                  <span className="font-mono">{selectedCycle.lastInspectionDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Target Total Output:</span>
                  <span className="font-bold text-foreground">{(selectedCycle.targetTotalYieldKg / 1000).toFixed(1)} Metric Tons</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setDetailSheetOpen(false);
                  setNewStage(selectedCycle.currentStage);
                  setNewHealth(selectedCycle.healthStatus);
                  setStageModalOpen(true);
                }}
                className="w-full font-semibold"
              >
                Advance Phenology Stage
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
