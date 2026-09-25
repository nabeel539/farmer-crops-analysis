'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
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

  // Filter cycles
  const filteredCycles = cycles.filter((cycle) => {
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

  const handleSaveStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;

    dispatch(updateCycleStage({ id: selectedCycle.id, stage: newStage }));
    dispatch(updateCycleHealth({ id: selectedCycle.id, health: newHealth }));
    toast.success(`Crop stage updated to ${newStage.replace(/_/g, ' ')}`);
    setStageModalOpen(false);
  };

  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!farmerId) {
      toast.error('Mandatory field required: Please select an enrolled farmer');
      return;
    }
    if (!parcelId) {
      toast.error('Mandatory field required: Please select a land parcel');
      return;
    }

    const selFarmer = farmers.find((f) => f.id === farmerId);
    const selParcel = parcels.find((p) => p.id === parcelId);

    const newCycleRecord: CropCycle = {
      id: `cycle-${Date.now()}`,
      cycleCode: `WH-2026-${Math.floor(100 + Math.random() * 900)}`,
      farmerId,
      farmerName: selFarmer ? selFarmer.fullName : 'Enrolled Farmer',
      fieldParcelId: parcelId,
      parcelCode: selParcel ? selParcel.parcelCode : 'PRCL-NEW',
      season: 'RABI_2025_2026',
      seedVariety: variety,
      sowingDate: sowDate,
      estimatedHarvestDate: '2026-04-20',
      sowingMethod,
      allocatedAcres: acres,
      currentStage: 'SOWING',
      currentStageDays: 1,
      healthStatus: 'OPTIMAL',
      latestNdvi: 0.28,
      soilMoisturePercent: 32,
      expectedYieldMaundsPerAcre: 52.0,
      actualYieldMaundsTotal: null,
      notes: 'Direct precision drilled with basal DAP application.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addCycle(newCycleRecord));
    toast.success(`New crop cycle ${newCycleRecord.cycleCode} initiated!`);
    setAddModalOpen(false);
  };

  const farmerOptions = farmers.map((f) => ({
    value: f.id,
    label: f.fullName,
    subLabel: f.village,
  }));

  const parcelOptions = parcels.map((p) => ({
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
          onClick: () => {
            if (farmers.length > 0 && !farmerId) setFarmerId(farmers[0].id);
            if (parcels.length > 0 && !parcelId) setParcelId(parcels[0].id);
            setAddModalOpen(true);
          },
        }}
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Active Monitored Cycles"
          value={cycles.length}
          subtitle="Rabi Season Wheat Plots"
          icon={Sprout}
          variant="primary"
        />
        <MetricCard
          title="Avg Health Score"
          value="94.2%"
          subtitle="Optimal / Good Canopy Index"
          icon={Activity}
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
                <Label className="text-xs font-semibold">Select Enrolled Farmer *</Label>
                <SearchableSelect
                  options={farmerOptions}
                  value={farmerId}
                  onChange={(val) => setFarmerId(val)}
                  placeholder="Select Farmer..."
                  searchPlaceholder="Search farmer name, village..."
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Select Land Parcel *</Label>
                <SearchableSelect
                  options={parcelOptions}
                  value={parcelId}
                  onChange={(val) => setParcelId(val)}
                  placeholder="Select Parcel..."
                  searchPlaceholder="Search parcel code..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Seed Variety</Label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cultivated Acreage (Acres)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={acres}
                  onChange={(e) => setAcres(parseFloat(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Sowing Date</Label>
                <Input
                  type="date"
                  value={sowDate}
                  onChange={(e) => setSowDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold gap-1.5">
                <Plus className="h-4 w-4" />
                Initiate Monitoring
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
