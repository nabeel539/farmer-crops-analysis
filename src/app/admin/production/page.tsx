'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import {
  addBatch,
  setBatchSearchQuery,
  setBatchStatusFilter,
} from '@/store/slices/millingSlice';
import { MillingBatch } from '@/types';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Factory,
  Plus,
  Percent,
  Warehouse,
  CheckCircle2,
  Sparkles,
  Layers,
  Scale
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductionPage() {
  const dispatch = useAppDispatch();
  const { batches, searchQuery, statusFilter } = useAppSelector(
    (state) => state.milling
  );

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [inputWheatKg, setInputWheatKg] = useState<number>(50000);
  const [siloId, setSiloId] = useState('SILO-FLOUR-04');
  const [supervisor, setSupervisor] = useState('Engr. Kamran Tariq');

  const extractionRate = 77.0; // 77% extraction
  const flourOutputKg = Math.round(inputWheatKg * 0.77);
  const fineAttaKg = Math.round(inputWheatKg * 0.60);
  const sujiKg = Math.round(inputWheatKg * 0.07);
  const branKg = Math.round(inputWheatKg * 0.23);

  // Filter Logic
  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      searchQuery === '' ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.storageSiloId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.supervisorName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.batchStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalInputKg = batches.reduce((sum, b) => sum + b.totalInputWheatKg, 0);
  const totalFlourKg = batches.reduce((sum, b) => sum + b.flourYieldKg, 0);
  const totalBranKg = batches.reduce((sum, b) => sum + b.branYieldKg, 0);

  // Silo Capacities Mock
  const silos = [
    { id: 'SILO-FLOUR-02', name: 'Strategic Wheat Silo 02', capacityKg: 200000, currentKg: 150000, type: 'Raw Wheat' },
    { id: 'SILO-FLOUR-04', name: 'Refined Flour Silo 04', capacityKg: 100000, currentKg: 68000, type: 'Fine Atta' },
    { id: 'SILO-FLOUR-07', name: 'Bulk Bran Silo 07', capacityKg: 80000, currentKg: 42000, type: 'Wheat Bran (Choker)' },
  ];

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: MillingBatch = {
      id: `MIL-${String(batches.length + 1).padStart(3, '0')}`,
      batchNumber: `MIL-BATCH-2026-0${batches.length + 1}`,
      receivedDate: new Date().toISOString().split('T')[0],
      sourceFarmerIds: ['FARM-001', 'FARM-002'],
      totalInputWheatKg: Number(inputWheatKg),
      flourYieldKg: flourOutputKg,
      fineAttaYieldKg: fineAttaKg,
      semolinaSujiYieldKg: sujiKg,
      branYieldKg: branKg,
      extractionRatePct: extractionRate,
      qualityTestScore: 92.0,
      processedDate: new Date().toISOString().split('T')[0],
      storageSiloId: siloId,
      batchStatus: 'IN_PROCESSING',
      supervisorName: supervisor
    };

    dispatch(addBatch(newBatch));
    toast.success(`Milling batch ${newBatch.batchNumber} created and sent to processing!`);
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Flour Milling & Silo Storage Operations"
        description="Trace wheat from raw grain intake through milling extraction (Atta, Suji, Choker), quality gluten tests, and strategic silo storage."
        actionButton={{
          label: 'Create Milling Batch',
          icon: Plus,
          onClick: () => setAddModalOpen(true),
        }}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Wheat Input Processed"
          value={`${(totalInputKg / 1000).toFixed(1)} Tons`}
          subtitle="From enrolled farmers"
          icon={Factory}
          variant="primary"
        />
        <MetricCard
          title="Flour / Atta Yield"
          value={`${(totalFlourKg / 1000).toFixed(1)} Tons`}
          subtitle={`${(totalBranKg / 1000).toFixed(1)} Tons Bran byproduct`}
          icon={Scale}
        />
        <MetricCard
          title="Average Extraction Rate"
          value="77.3%"
          subtitle="Benchmark Standard: 76-78%"
          icon={Percent}
          trend={{ value: '0.8%', isPositive: true, label: 'above standard' }}
        />
        <MetricCard
          title="Gluten & Baking Score"
          value="92.8 / 100"
          subtitle="High protein quality index"
          icon={Sparkles}
        />
      </div>

      {/* Silo Capacity Visual Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {silos.map((silo) => {
          const pct = Math.round((silo.currentKg / silo.capacityKg) * 100);
          return (
            <Card key={silo.id} className="border shadow-xs">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {silo.id}
                  </Badge>
                  <span className="text-xs font-semibold text-primary">{silo.type}</span>
                </div>
                <CardTitle className="text-sm font-bold pt-1">{silo.name}</CardTitle>
                <CardDescription className="text-xs">
                  Capacity: {(silo.capacityKg / 1000).toFixed(0)} Tons
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Current Fill:</span>
                  <span className="text-foreground font-mono">{(silo.currentKg / 1000).toFixed(1)} Tons ({pct}%)</span>
                </div>
                <Progress value={pct} className="h-2.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => dispatch(setBatchSearchQuery(q))}
        searchPlaceholder="Search batch number, silo ID, supervisor..."
        filters={[
          {
            id: 'status',
            placeholder: 'All Batch Statuses',
            value: statusFilter,
            onChange: (v) => dispatch(setBatchStatusFilter(v)),
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'In Processing', value: 'IN_PROCESSING' },
              { label: 'Quality Hold', value: 'QUALITY_HOLD' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setBatchSearchQuery(''));
          dispatch(setBatchStatusFilter('ALL'));
        }}
      />

      {/* Batches Table */}
      {filteredBatches.length === 0 ? (
        <EmptyState
          title="No Milling Batches Found"
          description="No production records match your search filters."
          action={{
            label: 'Start New Batch',
            onClick: () => setAddModalOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-2xl bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                <TableHead className="font-bold">Batch ID / Process Date</TableHead>
                <TableHead className="font-bold text-right">Wheat Input (kg)</TableHead>
                <TableHead className="font-bold text-right">Fine Atta Output</TableHead>
                <TableHead className="font-bold text-right">Suji / Semolina</TableHead>
                <TableHead className="font-bold text-right">Bran (Choker)</TableHead>
                <TableHead className="font-bold text-center">Extraction %</TableHead>
                <TableHead className="font-bold">Storage Silo</TableHead>
                <TableHead className="font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-muted/30 text-xs">
                  <TableCell>
                    <div className="font-mono font-bold text-foreground">{batch.batchNumber}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Processed: {batch.processedDate} &bull; {batch.supervisorName}
                    </div>
                  </TableCell>

                  <TableCell className="text-right font-mono font-bold text-foreground">
                    {batch.totalInputWheatKg.toLocaleString()} kg
                  </TableCell>

                  <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                    {batch.fineAttaYieldKg.toLocaleString()} kg
                  </TableCell>

                  <TableCell className="text-right font-mono text-foreground">
                    {batch.semolinaSujiYieldKg.toLocaleString()} kg
                  </TableCell>

                  <TableCell className="text-right font-mono text-amber-600">
                    {batch.branYieldKg.toLocaleString()} kg
                  </TableCell>

                  <TableCell className="text-center">
                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-[11px]">
                      {batch.extractionRatePct}%
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Score: {batch.qualityTestScore}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground">{batch.storageSiloId}</div>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={batch.batchStatus} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Milling Batch Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Initiate Flour Milling Run</DialogTitle>
            <DialogDescription className="text-xs">
              Load grain from verified harvest silos and calculate automated output yields.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBatch} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Wheat Input Weight (kg)</Label>
              <Input
                type="number"
                step="1000"
                value={inputWheatKg}
                onChange={(e) => setInputWheatKg(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            {/* Live Yield Calculation Preview */}
            <div className="p-4 rounded-2xl bg-muted/60 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-foreground border-b pb-1">
                <span>Calculated Extraction ({extractionRate}%):</span>
                <span>{flourOutputKg.toLocaleString()} kg Flour</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Fine Atta (60%):</span>
                <span className="font-mono font-semibold text-foreground">{fineAttaKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Semolina / Suji (7%):</span>
                <span className="font-mono font-semibold text-foreground">{sujiKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between text-amber-600">
                <span>Bran / Choker Byproduct (23%):</span>
                <span className="font-mono font-semibold">{branKg.toLocaleString()} kg</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Destination Silo</Label>
                <Select value={siloId} onValueChange={(v) => { if (v !== null) setSiloId(v); }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SILO-FLOUR-02">SILO-FLOUR-02 (Raw Wheat)</SelectItem>
                    <SelectItem value="SILO-FLOUR-04">SILO-FLOUR-04 (Fine Atta)</SelectItem>
                    <SelectItem value="SILO-FLOUR-07">SILO-FLOUR-07 (Bran / Choker)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Milling Supervisor</Label>
                <Input
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Engr. Kamran Tariq"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Start Milling Run
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
