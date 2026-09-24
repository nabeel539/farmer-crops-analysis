'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import {
  addDistribution,
  setDistributionSearchQuery,
  setDistributionVarietyFilter,
  setDistributionPaymentFilter,
} from '@/store/slices/seedDistributionsSlice';
import { SeedDistributionRecord, SeedVariety } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  QrCode,
  CheckCircle2,
  Plus,
  Receipt,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Percent,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';

export default function SeedDistributionPage() {
  const dispatch = useAppDispatch();
  const { distributions, seedBags, searchQuery, varietyFilter, paymentStatusFilter } = useAppSelector(
    (state) => state.seedDistributions
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);

  const [activeTab, setActiveTab] = useState<'DISTRIBUTIONS' | 'INVENTORY'>('DISTRIBUTIONS');
  const [addDistModalOpen, setAddDistModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SeedDistributionRecord | null>(null);

  // Form State
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [variety, setVariety] = useState<SeedVariety>('HD-2967');
  const [quantityBags, setQuantityBags] = useState<number>(10);
  const [subsidyPerBag, setSubsidyPerBag] = useState<number>(600);
  const bagBasePrice = 2400; // INR standard per 50kg bag
  const totalPayable = (bagBasePrice - subsidyPerBag) * quantityBags;

  // Filter Logic
  const filteredDistributions = distributions.filter((d) => {
    const matchesSearch =
      searchQuery === '' ||
      d.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.farmerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.distributionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVariety = varietyFilter === 'ALL' || d.seedVariety === varietyFilter;
    const matchesPayment = paymentStatusFilter === 'ALL' || d.paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesVariety && matchesPayment;
  });

  const totalBags = distributions.reduce((sum, d) => sum + d.quantityBags, 0);
  const totalKg = distributions.reduce((sum, d) => sum + d.totalWeightKg, 0);
  const totalSubsidyAmount = distributions.reduce((sum, d) => sum + (d.subsidyRatePerBag * d.quantityBags), 0);

  const handleCreateDistribution = (e: React.FormEvent) => {
    e.preventDefault();
    const selFarmer = farmers.find(f => f.id === farmerId) || farmers[0];
    const newRecord: SeedDistributionRecord = {
      id: `DIST-${String(distributions.length + 1).padStart(3, '0')}`,
      distributionCode: `DIST-2025-${String(distributions.length + 1).padStart(3, '0')}`,
      farmerId: selFarmer.id,
      farmerName: selFarmer.fullName,
      farmerCode: selFarmer.farmerCode,
      village: selFarmer.village,
      seedVariety: variety,
      lotNumber: `LOT-${variety.substring(0, 3).toUpperCase()}-25-${String.fromCharCode(65 + distributions.length % 5)}`,
      quantityBags: Number(quantityBags),
      totalWeightKg: Number(quantityBags) * 50,
      allocatedAcres: Number(quantityBags),
      subsidyRatePerBag: Number(subsidyPerBag),
      totalPayable: totalPayable,
      paymentStatus: 'PAID',
      distributionDate: new Date().toISOString().split('T')[0],
      officerId: 'USR-003',
      officerName: 'Harvinder Singh',
      signatureReceived: true,
      assignedBagTags: [
        `SB-2025-${variety.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        `SB-2025-${variety.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
      ]
    };

    dispatch(addDistribution(newRecord));
    toast.success(`Allocated ${quantityBags} bags of ${variety} to ${selFarmer.fullName}!`);
    setAddDistModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Certified Wheat Seed Distribution"
        description="Traceable seed lot dispatch, QR barcoded bag allocation, and government subsidy reconciliation."
        actionButton={{
          label: 'New Seed Allocation',
          icon: Plus,
          onClick: () => setAddDistModalOpen(true),
        }}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Bags Distributed"
          value={`${totalBags} Bags`}
          subtitle={`${(totalKg / 1000).toFixed(1)} Metric Tons`}
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="Certified Varieties"
          value="6 Approved"
          subtitle="HD-2967, DBW-187, HD-3086, etc."
          icon={Layers}
        />
        <MetricCard
          title="Government Subsidy"
          value={`₹ ${(totalSubsidyAmount / 1000).toFixed(0)}k`}
          subtitle="₹ 600 per bag subsidy (SMSP)"
          icon={Coins}
        />
        <MetricCard
          title="Seed Quality Pass Rate"
          value="98.4%"
          subtitle="Avg Germination >94%"
          icon={Sparkles}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="DISTRIBUTIONS" className="text-xs font-semibold">
            Seed Passbook Records ({distributions.length})
          </TabsTrigger>
          <TabsTrigger value="INVENTORY" className="text-xs font-semibold">
            Certified Bag Batches ({seedBags.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Distribution Records */}
        <TabsContent value="DISTRIBUTIONS" className="space-y-4 pt-2">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => dispatch(setDistributionSearchQuery(q))}
            searchPlaceholder="Search distribution code, farmer name, lot #..."
            filters={[
              {
                id: 'variety',
                placeholder: 'All Varieties',
                value: varietyFilter,
                onChange: (v) => dispatch(setDistributionVarietyFilter(v)),
                options: [
                  { label: 'All Varieties', value: 'ALL' },
                  { label: 'HD-2967', value: 'HD-2967' },
                  { label: 'HD-3086', value: 'HD-3086' },
                  { label: 'DBW-187', value: 'DBW-187' },
                  { label: 'DBW-222', value: 'DBW-222' },
                  { label: 'PBW-550', value: 'PBW-550' },
                  { label: 'Sharbati C-306', value: 'Sharbati C-306' },
                ],
              },
              {
                id: 'payment',
                placeholder: 'Payment Status',
                value: paymentStatusFilter,
                onChange: (v) => dispatch(setDistributionPaymentFilter(v)),
                options: [
                  { label: 'All Payments', value: 'ALL' },
                  { label: 'Paid', value: 'PAID' },
                  { label: 'Subsidized', value: 'SUBSIDIZED' },
                  { label: 'Credit', value: 'CREDIT' },
                  { label: 'Partial', value: 'PARTIAL' },
                ],
              },
            ]}
            onReset={() => {
              dispatch(setDistributionSearchQuery(''));
              dispatch(setDistributionVarietyFilter('ALL'));
              dispatch(setDistributionPaymentFilter('ALL'));
            }}
          />

          {filteredDistributions.length === 0 ? (
            <EmptyState
              title="No Distribution Records Found"
              description="No seed distribution transactions match your search filters."
              action={{
                label: 'Create Seed Allocation',
                onClick: () => setAddDistModalOpen(true),
                icon: Plus,
              }}
            />
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                    <TableHead className="font-bold">Passbook ID</TableHead>
                    <TableHead className="font-bold">Farmer Name & Village</TableHead>
                    <TableHead className="font-bold">Seed Variety & Lot</TableHead>
                    <TableHead className="font-bold text-right">Bags / Weight</TableHead>
                    <TableHead className="font-bold text-right">Subsidy / Net</TableHead>
                    <TableHead className="font-bold text-center">QR Tags</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistributions.map((dist) => (
                    <TableRow key={dist.id} className="hover:bg-muted/30 text-xs">
                      <TableCell>
                        <span className="font-mono font-bold text-foreground block">{dist.distributionCode}</span>
                        <span className="text-[11px] text-muted-foreground">{dist.distributionDate}</span>
                      </TableCell>

                      <TableCell>
                        <div className="font-semibold text-foreground">{dist.farmerName}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {dist.farmerCode} &bull; {dist.village}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-foreground">{dist.seedVariety}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Lot: {dist.lotNumber}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="font-bold text-foreground">{dist.quantityBags} Bags</span>
                        <span className="text-[11px] text-muted-foreground block font-mono">
                          {dist.totalWeightKg} kg
                        </span>
                      </TableCell>

                      <TableCell className="text-right">
                        <span className="font-semibold text-emerald-600">
                          -₹ {(dist.subsidyRatePerBag * dist.quantityBags).toLocaleString()}
                        </span>
                        <span className="text-[11px] font-bold text-foreground block">
                          Payable: ₹ {dist.totalPayable.toLocaleString()}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1 font-mono text-[10px] bg-muted px-2 py-0.5 rounded border">
                          <QrCode className="h-3 w-3 text-muted-foreground" />
                          {dist.assignedBagTags?.[0] || 'SB-2025-TAG'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={dist.paymentStatus} />
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => {
                            setSelectedRecord(dist);
                            setReceiptModalOpen(true);
                          }}
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Slip</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Seed Bag Inventory & Quality */}
        <TabsContent value="INVENTORY" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {seedBags.map((bag) => (
              <Card key={bag.id} className="border shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {bag.bagTagNumber}
                    </Badge>
                    <StatusBadge status={bag.status} />
                  </div>
                  <CardTitle className="text-base font-bold pt-1">{bag.variety}</CardTitle>
                  <CardDescription className="text-xs font-mono">
                    Lot: {bag.lotNumber} &bull; Category: {bag.category.replace(/_/g, ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-muted/50 rounded-xl">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Germination</span>
                      <span className="font-bold text-emerald-600">{bag.germinationRate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Purity</span>
                      <span className="font-bold text-foreground">{bag.purityRate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Moisture</span>
                      <span className="font-bold text-blue-600">{bag.moistureContent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Standard Weight: {bag.weightKg} kg</span>
                    <span>Bagged: {bag.baggingDate}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Distribution Allocation Modal */}
      <Dialog open={addDistModalOpen} onOpenChange={setAddDistModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Allocate Certified Wheat Seed</DialogTitle>
            <DialogDescription className="text-xs">
              Issue certified seed bags to enrolled grower with digital subsidy calculation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateDistribution} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Enrolled Farmer</Label>
              <Select value={farmerId} onValueChange={(v) => { if (v !== null) setFarmerId(v); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.fullName} &bull; {f.village} ({f.wheatAcreage} Ac Wheat)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Seed Variety</Label>
                <Select value={variety} onValueChange={(v) => { if (v !== null) setVariety(v as SeedVariety); }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HD-2967">HD-2967 (High Yielding / Popular)</SelectItem>
                    <SelectItem value="DBW-187">DBW-187 / Karan Vandana (Rust Resistant)</SelectItem>
                    <SelectItem value="HD-3086">HD-3086 / Pusa Gautami (Heat Tolerant)</SelectItem>
                    <SelectItem value="DBW-222">DBW-222 / Karan Narendra</SelectItem>
                    <SelectItem value="PBW-550">PBW-550 (PAU Ludhiana)</SelectItem>
                    <SelectItem value="Sharbati C-306">Sharbati C-306 (Premium Atta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Quantity (50kg Bags)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={quantityBags}
                  onChange={(e) => setQuantityBags(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            {/* Live Subsidy Calculator Summary Box */}
            <div className="p-4 rounded-lg bg-muted/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standard Retail Price ({quantityBags} bags @ ₹ 2,400):</span>
                <span className="font-semibold">₹ {(quantityBags * 2400).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Government Subsidy ({quantityBags} bags @ ₹ {subsidyPerBag}):</span>
                <span className="font-semibold">-₹ {(quantityBags * subsidyPerBag).toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-sm text-foreground">
                <span>Net Payable by Farmer:</span>
                <span className="text-primary">₹ {totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddDistModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Print Passbook
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Seed Passbook Slip Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedRecord && (
            <div className="space-y-4 pt-2">
              <div className="text-center pb-3 border-b space-y-1">
                <Badge variant="outline" className="text-[10px] font-mono mb-1">
                  OFFICIAL DIGITAL PASSBOOK SLIP
                </Badge>
                <h3 className="font-bold text-base text-foreground">National Seeds Corporation (NSC)</h3>
                <p className="text-xs text-muted-foreground font-mono">Slip #{selectedRecord.distributionCode}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Farmer Name:</span>
                  <span className="font-bold">{selectedRecord.farmerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Farmer Code:</span>
                  <span className="font-mono">{selectedRecord.farmerCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Village:</span>
                  <span>{selectedRecord.village}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Seed Variety:</span>
                  <span className="font-bold">{selectedRecord.seedVariety}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Certified Lot:</span>
                  <span className="font-mono font-semibold">{selectedRecord.lotNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Allocated Quantity:</span>
                  <span className="font-bold">{selectedRecord.quantityBags} Bags ({selectedRecord.totalWeightKg} kg)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Government Subsidy (SMSP):</span>
                  <span className="font-semibold text-emerald-600">₹ {(selectedRecord.subsidyRatePerBag * selectedRecord.quantityBags).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-sm font-bold pt-2">
                  <span>Net Amount Paid:</span>
                  <span className="text-primary">₹ {selectedRecord.totalPayable.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground text-center space-y-1">
                <p>Verified by Agriculture Officer: <span className="font-semibold text-foreground">{selectedRecord.officerName}</span></p>
                <p className="font-mono">Security QR: {selectedRecord.assignedBagTags?.join(', ')}</p>
              </div>

              <DialogFooter>
                <Button 
                  onClick={() => {
                    toast.success('Passbook receipt sent to connected thermal printer');
                    setReceiptModalOpen(false);
                  }}
                  className="w-full font-semibold"
                >
                  Print Official Passbook Slip
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
