'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  addHarvest,
  setHarvestSearchQuery,
  setHarvestGradeFilter,
  setHarvestStatusFilter,
} from '@/store/slices/harvestsSlice';
import { HarvestRecord } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Wheat,
  Plus,
  Scale,
  Sparkles,
  Truck,
  Droplets,
  CheckCircle2,
  Warehouse,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HarvestPage() {
  const dispatch = useAppDispatch();
  const { harvests, searchQuery, gradeFilter, statusFilter } = useAppSelector(
    (state) => state.harvests
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);

  // Pagination & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'MECHANICAL_HARVESTER' | 'MANUAL_COMBINE' | 'REAPER'>('MECHANICAL_HARVESTER');
  const [acres, setAcres] = useState<number>(10);
  const [maundsYield, setMaundsYield] = useState<number>(520);
  const [moisture, setMoisture] = useState<number>(10.2);
  const [grade, setGrade] = useState<'GRADE_A_PREMIUM' | 'GRADE_B_STANDARD' | 'GRADE_C_FEED'>('GRADE_A_PREMIUM');
  const [silo, setSilo] = useState('Salarwala Strategic Grain Silo #4');

  // Filter Logic
  const filteredHarvests = harvests.filter((h) => {
    const matchesSearch =
      searchQuery === '' ||
      h.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.harvestCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.procurementCenterAssigned.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = gradeFilter === 'ALL' || h.grainQualityGrade === gradeFilter;
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  // Pagination Slicing
  const totalItems = filteredHarvests.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedHarvests = filteredHarvests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalMaunds = harvests.reduce((sum, h) => sum + h.totalWeightMaunds, 0);
  const totalTons = (harvests.reduce((sum, h) => sum + h.totalWeightKg, 0) / 1000).toFixed(1);
  const avgMoisture = (harvests.reduce((sum, h) => sum + h.grainMoisturePct, 0) / (harvests.length || 1)).toFixed(1);

  const handleCreateHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId) {
      toast.error('Mandatory field required: Please select a registered farmer');
      return;
    }
    if (!acres || Number(acres) <= 0) {
      toast.error('Mandatory field required: Harvested acreage must be greater than 0');
      return;
    }
    if (!maundsYield || Number(maundsYield) <= 0) {
      toast.error('Mandatory field required: Yield must be greater than 0');
      return;
    }

    const selFarmer = farmers.find((f) => f.id === farmerId);
    const totalKg = maundsYield * 40;

    const newRecord: HarvestRecord = {
      id: `hrv-${Date.now()}`,
      harvestCode: `HRV-2026-${Math.floor(100 + Math.random() * 900)}`,
      cropCycleId: 'cycle-101',
      farmerId,
      farmerName: selFarmer ? selFarmer.fullName : 'Ramesh Patel',
      fieldParcelId: 'prcl-01',
      harvestDate,
      harvestMethod: method,
      acreageHarvested: acres,
      totalWeightKg: totalKg,
      totalWeightMaunds: maundsYield,
      averageYieldMaundsPerAcre: parseFloat((maundsYield / acres).toFixed(1)),
      grainMoisturePct: moisture,
      grainQualityGrade: grade,
      procurementCenterAssigned: silo,
      storageSiloId: 'SILO-04',
      status: 'STORED_IN_SILO',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addHarvest(newRecord));
    toast.success(`Harvest intake ${newRecord.harvestCode} logged and stored in ${silo}!`);
    setAddModalOpen(false);
  };

  const farmerOptions = farmers.map((f) => ({
    value: f.id,
    label: f.fullName,
    subLabel: f.village,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Harvest Records & Grain Silo Intake"
        description="Log harvested grain weights, laboratory moisture test percentages, quality grades, and silo storage allocations."
        actionButton={{
          label: 'Record Harvest Intake',
          icon: Scale,
          onClick: () => {
            if (farmers.length > 0 && !farmerId) setFarmerId(farmers[0].id);
            setAddModalOpen(true);
          },
        }}
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Procured Grain"
          value={`${totalMaunds.toLocaleString()} Maunds`}
          subtitle={`${totalTons} Metric Tons`}
          icon={Wheat}
          variant="primary"
        />
        <MetricCard
          title="Avg Lab Moisture"
          value={`${avgMoisture}%`}
          subtitle="Optimal Safe Storage (10-12%)"
          icon={Droplets}
        />
        <MetricCard
          title="Avg Yield Efficiency"
          value="52.2 M/Ac"
          subtitle="2,088 kg per Cultivated Acre"
          icon={Sparkles}
        />
        <MetricCard
          title="Active Silos"
          value="4 Strategic Silos"
          subtitle="Direct Silo-to-Mill Link Active"
          icon={Warehouse}
        />
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          dispatch(setHarvestSearchQuery(q));
          setCurrentPage(1);
        }}
        searchPlaceholder="Search harvest code, farmer, silo location..."
        filters={[
          {
            id: 'grade',
            placeholder: 'All Quality Grades',
            value: gradeFilter,
            onChange: (v) => {
              dispatch(setHarvestGradeFilter(v));
              setCurrentPage(1);
            },
            options: [
              { label: 'All Quality Grades', value: 'ALL' },
              { label: 'Grade A Premium', value: 'GRADE_A_PREMIUM' },
              { label: 'Grade B Standard', value: 'GRADE_B_STANDARD' },
              { label: 'Grade C Feed Wheat', value: 'GRADE_C_FEED' },
            ],
          },
          {
            id: 'status',
            placeholder: 'All Storage Statuses',
            value: statusFilter,
            onChange: (v) => {
              dispatch(setHarvestStatusFilter(v));
              setCurrentPage(1);
            },
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Stored in Silo', value: 'STORED_IN_SILO' },
              { label: 'In Transit', value: 'IN_TRANSIT' },
              { label: 'Pending Inspection', value: 'PENDING_INSPECTION' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setHarvestSearchQuery(''));
          dispatch(setHarvestGradeFilter('ALL'));
          dispatch(setHarvestStatusFilter('ALL'));
          setCurrentPage(1);
        }}
      />

      {/* Harvest Table */}
      {filteredHarvests.length === 0 ? (
        <EmptyState
          title="No Harvest Records Found"
          description="No wheat harvest batch entries match your search criteria."
          action={{
            label: 'Record Harvest Intake',
            onClick: () => {
              if (farmers.length > 0 && !farmerId) setFarmerId(farmers[0].id);
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
                  <TableHead className="font-bold">Harvest Code & Farmer</TableHead>
                  <TableHead className="font-bold">Harvest Date</TableHead>
                  <TableHead className="font-bold text-right">Harvested Acres</TableHead>
                  <TableHead className="font-bold text-right">Yield (Maunds)</TableHead>
                  <TableHead className="font-bold text-right">Total Metric Tons</TableHead>
                  <TableHead className="font-bold text-center">Moisture %</TableHead>
                  <TableHead className="font-bold">Quality Grade</TableHead>
                  <TableHead className="font-bold">Assigned Silo</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHarvests.map((h) => (
                  <TableRow key={h.id} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <div className="font-mono font-bold text-foreground">{h.harvestCode}</div>
                      <div className="text-[11px] text-muted-foreground">{h.farmerName}</div>
                    </TableCell>

                    <TableCell className="font-mono text-[11px] text-muted-foreground">{h.harvestDate}</TableCell>

                    <TableCell className="text-right font-mono">{h.acreageHarvested} Ac</TableCell>

                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {h.totalWeightMaunds.toLocaleString()} M
                    </TableCell>

                    <TableCell className="text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                      {(h.totalWeightKg / 1000).toFixed(1)} MT
                    </TableCell>

                    <TableCell className="text-center font-mono font-bold">
                      <span className={h.grainMoisturePct <= 11.5 ? 'text-emerald-600' : 'text-amber-600'}>
                        {h.grainMoisturePct}%
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          h.grainQualityGrade === 'GRADE_A_PREMIUM'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : 'bg-muted'
                        }
                      >
                        {h.grainQualityGrade.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="text-[11px] font-medium text-foreground max-w-[150px] truncate">
                        {h.procurementCenterAssigned}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={h.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Card Grid View */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedHarvests.map((h) => (
                <Card key={h.id} className="border hover:border-primary/40 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-primary block">{h.harvestCode}</span>
                        <h4 className="font-bold text-sm text-foreground mt-0.5">{h.farmerName}</h4>
                        <p className="text-[11px] text-muted-foreground">{h.procurementCenterAssigned}</p>
                      </div>
                      <StatusBadge status={h.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Total Yield:</span>
                        <span className="font-bold font-mono text-foreground">
                          {h.totalWeightMaunds} Maunds ({(h.totalWeightKg / 1000).toFixed(1)} MT)
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Lab Moisture:</span>
                        <span className="font-bold font-mono text-emerald-600">{h.grainMoisturePct}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-[10px]">
                        {h.grainQualityGrade.replace(/_/g, ' ')}
                      </Badge>
                      <span className="font-mono text-[11px] text-muted-foreground">{h.harvestDate}</span>
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

      {/* Record Harvest Intake Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Record Wheat Harvest Intake</DialogTitle>
            <DialogDescription className="text-xs">
              Record final grain yield, lab moisture percentage, and assign storage silo batch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHarvest} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Select Farmer *</Label>
                <SearchableSelect
                  options={farmerOptions}
                  value={farmerId}
                  onChange={(val) => setFarmerId(val)}
                  placeholder="Select Farmer..."
                  searchPlaceholder="Search farmer name, village..."
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvest Date *</Label>
                <Input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvested Acres *</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={acres}
                  onChange={(e) => setAcres(parseFloat(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Yield (Maunds) *</Label>
                <Input
                  type="number"
                  value={maundsYield}
                  onChange={(e) => setMaundsYield(parseFloat(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Moisture (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value) || 10)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvesting Method</Label>
                <Select
                  value={method}
                  onValueChange={(v) => {
                    if (v !== null) setMethod(v as any);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MECHANICAL_HARVESTER">Combine Mechanical Harvester</SelectItem>
                    <SelectItem value="MANUAL_COMBINE">Manual Cutting & Thresher</SelectItem>
                    <SelectItem value="REAPER">Tractor Mounted Reaper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Quality Grade</Label>
                <Select
                  value={grade}
                  onValueChange={(v) => {
                    if (v !== null) setGrade(v as any);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRADE_A_PREMIUM">Grade A Premium (Clean, &gt;92% Gluten)</SelectItem>
                    <SelectItem value="GRADE_B_STANDARD">Grade B Standard</SelectItem>
                    <SelectItem value="GRADE_C_FEED">Grade C Feed Wheat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Procurement Silo</Label>
              <Input
                value={silo}
                onChange={(e) => setSilo(e.target.value)}
                placeholder="e.g. Salarwala Strategic Grain Silo #4"
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Record Harvest Intake
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
