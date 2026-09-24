'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
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
import {
  Wheat,
  Plus,
  Scale,
  Sparkles,
  Truck,
  Droplets,
  CheckCircle2,
  Warehouse
} from 'lucide-react';
import { toast } from 'sonner';

export default function HarvestPage() {
  const dispatch = useAppDispatch();
  const { harvests, searchQuery, gradeFilter, statusFilter } = useAppSelector(
    (state) => state.harvests
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);

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
      h.harvestCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.procurementCenterAssigned.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = gradeFilter === 'ALL' || h.grainQualityGrade === gradeFilter;
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const totalMaunds = harvests.reduce((sum, h) => sum + h.totalWeightMaunds, 0);
  const totalTons = (harvests.reduce((sum, h) => sum + h.totalWeightKg, 0) / 1000).toFixed(1);
  const avgMoisture = (harvests.reduce((sum, h) => sum + h.grainMoisturePct, 0) / (harvests.length || 1)).toFixed(1);

  const handleCreateHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    const selFarmer = farmers.find(f => f.id === farmerId) || farmers[0];
    const totalKg = Number(maundsYield) * 40;
    const yieldPerAc = Number(acres) > 0 ? (Number(maundsYield) / Number(acres)) : 50;

    const newHrv: HarvestRecord = {
      id: `HRV-${String(harvests.length + 1).padStart(3, '0')}`,
      harvestCode: `HRV-2026-${String(harvests.length + 1).padStart(3, '0')}`,
      cropCycleId: 'CYCLE-001',
      farmerId: selFarmer.id,
      farmerName: selFarmer.fullName,
      farmerCode: selFarmer.farmerCode,
      fieldParcelId: 'PRCL-001',
      harvestDate: harvestDate,
      harvestMethod: method,
      totalAcreageHarvested: Number(acres),
      totalBagsCollected: Number(maundsYield),
      totalWeightMaunds: Number(maundsYield),
      totalWeightKg: totalKg,
      yieldPerAcreMaunds: parseFloat(yieldPerAc.toFixed(1)),
      grainMoisturePct: Number(moisture),
      grainQualityGrade: grade,
      dockagePercentage: 0.8,
      procurementCenterAssigned: silo,
      officerVerified: true,
      status: 'STORED_IN_SILO'
    };

    dispatch(addHarvest(newHrv));
    toast.success(`Harvest record ${newHrv.harvestCode} logged for ${selFarmer.fullName}!`);
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Wheat Harvest & Grain Quality Records"
        description="Weighbridge receipts, grain moisture inspection, quality classification (Grade A/B/C), and silo intake tracking."
        actionButton={{
          label: 'Log Harvest Intake',
          icon: Plus,
          onClick: () => setAddModalOpen(true),
        }}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Harvested Output"
          value={`${totalTons} Tons`}
          subtitle={`${totalMaunds.toLocaleString()} Maunds Received`}
          icon={Wheat}
          variant="primary"
        />
        <MetricCard
          title="Average Yield / Acre"
          value="52.0 Maunds"
          subtitle="2,080 kg / Acre standard"
          icon={Scale}
        />
        <MetricCard
          title="Mean Grain Moisture"
          value={`${avgMoisture}%`}
          subtitle="Target < 12% (Safe Silo Storage)"
          icon={Droplets}
        />
        <MetricCard
          title="Premium Grade A Share"
          value="82%"
          subtitle="Eligible for Export & High Extraction Atta"
          icon={Sparkles}
        />
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => dispatch(setHarvestSearchQuery(q))}
        searchPlaceholder="Search harvest code, farmer name, silo..."
        filters={[
          {
            id: 'grade',
            placeholder: 'All Grain Grades',
            value: gradeFilter,
            onChange: (v) => dispatch(setHarvestGradeFilter(v)),
            options: [
              { label: 'All Grades', value: 'ALL' },
              { label: 'Grade A Premium', value: 'GRADE_A_PREMIUM' },
              { label: 'Grade B Standard', value: 'GRADE_B_STANDARD' },
              { label: 'Grade C Feed', value: 'GRADE_C_FEED' },
            ],
          },
          {
            id: 'status',
            placeholder: 'All Intake Statuses',
            value: statusFilter,
            onChange: (v) => dispatch(setHarvestStatusFilter(v)),
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Stored in Silo', value: 'STORED_IN_SILO' },
              { label: 'Delivered to Mill', value: 'DELIVERED_TO_MILL' },
              { label: 'Pending Delivery', value: 'PENDING_DELIVERY' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setHarvestSearchQuery(''));
          dispatch(setHarvestGradeFilter('ALL'));
          dispatch(setHarvestStatusFilter('ALL'));
        }}
      />

      {/* Harvest Table */}
      {filteredHarvests.length === 0 ? (
        <EmptyState
          title="No Harvest Records Found"
          description="No grain intake records match your search criteria."
          action={{
            label: 'Record Harvest Intake',
            onClick: () => setAddModalOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                <TableHead className="font-bold">Harvest Receipt / Farmer</TableHead>
                <TableHead className="font-bold">Harvest Date & Method</TableHead>
                <TableHead className="font-bold text-right">Harvested Area</TableHead>
                <TableHead className="font-bold text-right">Total Maunds / Weight</TableHead>
                <TableHead className="font-bold text-center">Moisture %</TableHead>
                <TableHead className="font-bold">Grain Quality</TableHead>
                <TableHead className="font-bold">Silo Destination</TableHead>
                <TableHead className="font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHarvests.map((hrv) => (
                <TableRow key={hrv.id} className="hover:bg-muted/30 text-xs">
                  <TableCell>
                    <div className="font-mono font-bold text-foreground">{hrv.harvestCode}</div>
                    <div className="text-[11px] text-muted-foreground font-semibold">
                      {hrv.farmerName} ({hrv.farmerCode})
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground">{hrv.harvestDate}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {hrv.harvestMethod.replace(/_/g, ' ')}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-bold text-foreground">{hrv.totalAcreageHarvested} Ac</span>
                    <span className="text-[11px] text-muted-foreground block">
                      {hrv.yieldPerAcreMaunds} Mnds/Ac
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-bold text-foreground text-sm">
                      {hrv.totalWeightMaunds.toLocaleString()} Maunds
                    </span>
                    <span className="text-[11px] text-muted-foreground block font-mono">
                      {(hrv.totalWeightKg / 1000).toFixed(1)} Tons
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-mono font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded text-[11px]">
                      {hrv.grainMoisturePct}%
                    </span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={hrv.grainQualityGrade} />
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground truncate max-w-[150px]">
                      {hrv.procurementCenterAssigned}
                    </div>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={hrv.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Log Harvest Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Log Wheat Harvest Intake</DialogTitle>
            <DialogDescription className="text-xs">
              Record final grain yield, lab moisture percentage, and assign storage silo batch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHarvest} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Select Farmer</Label>
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
                <Label className="text-xs font-semibold">Harvest Date</Label>
                <Input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvested Acres</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={acres}
                  onChange={(e) => setAcres(parseFloat(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Yield (Maunds)</Label>
                <Input
                  type="number"
                  value={maundsYield}
                  onChange={(e) => setMaundsYield(parseFloat(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Moisture (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value) || 10)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvesting Method</Label>
                <Select value={method} onValueChange={(v) => { if (v !== null) setMethod(v as any); }}>
                  <SelectTrigger className="w-full">
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
                <Select value={grade} onValueChange={(v) => { if (v !== null) setGrade(v as any); }}>
                  <SelectTrigger className="w-full">
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
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold gap-1.5">
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
