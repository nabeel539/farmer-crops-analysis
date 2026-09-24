'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetSeedBatchesQuery,
  useGetSeedSuppliesQuery,
  useCreateSeedSupplyMutation,
  SeedBatch,
  SeedSupply,
} from '@/store/api/seedApi';
import {
  useGetAllocationsQuery,
  useCreateAllocationMutation,
  SeedAllocation,
} from '@/store/api/allocationApi';
import { useGetVendorsQuery } from '@/store/api/vendorApi';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
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
  CheckCircle2,
  Plus,
  Receipt,
  Layers,
  Sparkles,
  Building2,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

// Schema for Allocating Seed to Farmer Field
const allocationSchema = z.object({
  seed_batch_id: z.string().min(1, 'Please select a seed batch'),
  farmer_id: z.string().min(1, 'Please select a farmer'),
  field_id: z.string().min(1, 'Please select a field plot'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  remarks: z.string().optional().or(z.literal('')),
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

// Schema for Receiving New Seed Supply Batch from Vendor
const supplySchema = z.object({
  vendor_id: z.string().min(1, 'Please select an authorized vendor'),
  crop: z.string().min(1, 'Crop type is required'),
  variety: z.string().min(1, 'Variety is required'),
  batch_number: z.string().min(2, 'Batch number is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string(),
  supply_date: z.string().min(1, 'Supply date is required'),
  purchase_reference: z.string().optional().or(z.literal('')),
  remarks: z.string().optional().or(z.literal('')),
});

type SupplyFormValues = z.infer<typeof supplySchema>;

export default function SeedDistributionPage() {
  const [activeTab, setActiveTab] = useState<'ALLOCATIONS' | 'INVENTORY' | 'SUPPLIES'>('ALLOCATIONS');
  const [searchQuery, setSearchQuery] = useState('');
  const [addAllocationModalOpen, setAddAllocationModalOpen] = useState(false);
  const [addSupplyModalOpen, setAddSupplyModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<SeedAllocation | null>(null);

  // RTK Query API Hooks
  const { data: allocations = [], isLoading: isLoadingAlloc, refetch: refetchAlloc } = useGetAllocationsQuery();
  const { data: batches = [], isLoading: isLoadingBatches, refetch: refetchBatches } = useGetSeedBatchesQuery();
  const { data: supplies = [], isLoading: isLoadingSupplies, refetch: refetchSupplies } = useGetSeedSuppliesQuery();
  const { data: vendors = [] } = useGetVendorsQuery();
  const { data: farmers = [] } = useGetFarmersQuery();
  const { data: fields = [] } = useGetFieldsQuery();

  const [createAllocation, { isLoading: isAllocating }] = useCreateAllocationMutation();
  const [createSeedSupply, { isLoading: isCreatingSupply }] = useCreateSeedSupplyMutation();

  // Allocation Form
  const {
    register: registerAlloc,
    handleSubmit: handleSubmitAlloc,
    reset: resetAlloc,
    setValue: setValueAlloc,
    watch: watchAlloc,
    formState: { errors: errorsAlloc },
  } = useForm<AllocationFormValues>({
    resolver: zodResolver(allocationSchema),
    defaultValues: {
      seed_batch_id: '',
      farmer_id: '',
      field_id: '',
      quantity: 50,
      remarks: '',
    },
  });

  const selectedBatchId = watchAlloc('seed_batch_id');
  const selectedFarmerId = watchAlloc('farmer_id');
  const selectedFieldId = watchAlloc('field_id');
  const requestedQuantity = watchAlloc('quantity') || 0;

  const currentBatch = batches.find((b) => b.id === selectedBatchId);
  const farmerFields = fields.filter((f) => f.farmer_id === selectedFarmerId);

  // Supply Form
  const {
    register: registerSupply,
    handleSubmit: handleSubmitSupply,
    reset: resetSupply,
    setValue: setValueSupply,
    watch: watchSupply,
    formState: { errors: errorsSupply },
  } = useForm<SupplyFormValues>({
    resolver: zodResolver(supplySchema),
    defaultValues: {
      vendor_id: '',
      crop: 'Wheat',
      variety: 'HD-2967',
      batch_number: '',
      quantity: 500,
      unit: 'KG',
      supply_date: new Date().toISOString().split('T')[0],
      purchase_reference: '',
      remarks: '',
    },
  });

  const selectedVendorId = watchSupply('vendor_id');

  const onAllocationSubmit = async (values: AllocationFormValues) => {
    try {
      await createAllocation({
        seed_batch_id: values.seed_batch_id,
        farmer_id: values.farmer_id,
        field_id: values.field_id,
        quantity: values.quantity,
        unit: currentBatch?.unit || 'KG',
        allocation_date: new Date().toISOString().split('T')[0],
        remarks: values.remarks,
      }).unwrap();

      const farmerName = farmers.find((f) => f.id === values.farmer_id)?.name || 'Farmer';
      toast.success(`Allocated ${values.quantity} ${currentBatch?.unit || 'KG'} to ${farmerName}!`);
      setAddAllocationModalOpen(false);
      resetAlloc();
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Allocation failed. Please verify stock availability.');
    }
  };

  const onSupplySubmit = async (values: SupplyFormValues) => {
    try {
      await createSeedSupply(values).unwrap();
      toast.success(`New seed supply & batch "${values.batch_number}" received and added to inventory!`);
      setAddSupplyModalOpen(false);
      resetSupply();
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to record seed supply');
    }
  };

  // Metrics
  const totalReceivedStock = batches.reduce((sum, b) => sum + b.received_quantity, 0);
  const totalAllocatedStock = batches.reduce((sum, b) => sum + b.allocated_quantity, 0);
  const totalAvailableStock = batches.reduce((sum, b) => sum + b.available_quantity, 0);

  // Filtered Allocations
  const filteredAllocations = allocations.filter((a) => {
    const farmerName = farmers.find((f) => f.id === a.farmer_id)?.name || '';
    const fieldName = fields.find((f) => f.id === a.field_id)?.field_name || '';
    const batchNo = batches.find((b) => b.id === a.seed_batch_id)?.batch_number || '';
    return (
      searchQuery === '' ||
      farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Certified Seed Inventory & Allocations"
        description="Receive vendor seed supplies, monitor real-time stock balances, and allocate certified seed batches to farmer plots."
        actionButton={{
          label: 'New Seed Allocation',
          icon: Plus,
          onClick: () => {
            if (batches.length > 0 && !selectedBatchId) {
              const activeBatch = batches.find((b) => b.available_quantity > 0) || batches[0];
              setValueAlloc('seed_batch_id', activeBatch.id);
            }
            if (farmers.length > 0 && !selectedFarmerId) {
              setValueAlloc('farmer_id', farmers[0].id);
            }
            setAddAllocationModalOpen(true);
          },
        }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (vendors.length > 0 && !selectedVendorId) {
              setValueSupply('vendor_id', vendors[0].id);
            }
            setAddSupplyModalOpen(true);
          }}
          className="gap-1.5 text-xs font-semibold"
        >
          <Building2 className="h-3.5 w-3.5" />
          Receive Vendor Supply
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Seed Received"
          value={`${(totalReceivedStock / 1000).toFixed(1)} MT`}
          subtitle={`${totalReceivedStock.toLocaleString()} KG across all batches`}
          icon={Package}
          variant="primary"
        />
        <MetricCard
          title="Stock Allocated"
          value={`${(totalAllocatedStock / 1000).toFixed(1)} MT`}
          subtitle={`${allocations.length} Active Farmer Dispatches`}
          icon={Layers}
        />
        <MetricCard
          title="Available In Warehouse"
          value={`${(totalAvailableStock / 1000).toFixed(1)} MT`}
          subtitle={`${batches.filter((b) => b.available_quantity > 0).length} Ready Batches`}
          icon={Sparkles}
        />
        <MetricCard
          title="Active Seed Vendors"
          value={`${vendors.filter((v) => v.status === 'ACTIVE').length} Suppliers`}
          subtitle="Certified Seed Quality"
          icon={Building2}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="ALLOCATIONS" className="text-xs font-semibold">
            Allocations ({allocations.length})
          </TabsTrigger>
          <TabsTrigger value="INVENTORY" className="text-xs font-semibold">
            Batches & Stock ({batches.length})
          </TabsTrigger>
          <TabsTrigger value="SUPPLIES" className="text-xs font-semibold">
            Vendor Supplies ({supplies.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Allocations */}
        <TabsContent value="ALLOCATIONS" className="space-y-4 pt-2">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by farmer name, field, or batch number..."
            onReset={() => setSearchQuery('')}
          />

          {isLoadingAlloc ? (
            <Card className="border border-border/80 shadow-2xs">
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Loading allocations...</p>
              </CardContent>
            </Card>
          ) : filteredAllocations.length === 0 ? (
            <EmptyState
              icon={Package}
              title={searchQuery ? 'No matching allocations found' : 'No seed allocations recorded yet'}
              description={
                searchQuery
                  ? 'Try changing your search keywords.'
                  : 'Allocate certified seed from your warehouse inventory directly to farmer field plots.'
              }
              action={{
                label: 'Allocate Seeds',
                onClick: () => setAddAllocationModalOpen(true),
                icon: Plus,
              }}
            />
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                    <TableHead className="font-bold">Allocation ID</TableHead>
                    <TableHead className="font-bold">Farmer Recipient</TableHead>
                    <TableHead className="font-bold">Target Field Plot</TableHead>
                    <TableHead className="font-bold">Batch Number</TableHead>
                    <TableHead className="font-bold text-right">Quantity</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllocations.map((alloc) => {
                    const farmer = farmers.find((f) => f.id === alloc.farmer_id);
                    const field = fields.find((f) => f.id === alloc.field_id);
                    const batch = batches.find((b) => b.id === alloc.seed_batch_id);

                    return (
                      <TableRow key={alloc.id} className="hover:bg-muted/30 text-xs">
                        <TableCell>
                          <span className="font-mono font-bold text-foreground block">
                            ID: {alloc.id.slice(0, 8)}...
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-foreground">{farmer ? farmer.name : 'Unknown Farmer'}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {farmer ? farmer.mobile_number : ''}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-foreground">{field ? field.field_name : 'General Plot'}</div>
                          <div className="text-[11px] text-muted-foreground">{field ? `${field.area} Acres` : ''}</div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="font-mono text-[11px] bg-muted/60">
                            {batch ? batch.batch_number : 'Batch'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-bold text-foreground text-sm">
                            {alloc.quantity} {alloc.unit}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-[11px] text-muted-foreground">{alloc.allocation_date}</span>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-xs"
                            onClick={() => {
                              setSelectedAllocation(alloc);
                              setReceiptModalOpen(true);
                            }}
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            Passbook
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Batches & Real-time Inventory */}
        <TabsContent value="INVENTORY" className="space-y-4 pt-2">
          {isLoadingBatches ? (
            <Card className="border border-border/80 shadow-2xs">
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Loading batch inventory...</p>
              </CardContent>
            </Card>
          ) : batches.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No Seed Batches Available"
              description="Receive supplies from certified vendors to generate inventory batches."
              action={{
                label: 'Receive First Supply',
                onClick: () => setAddSupplyModalOpen(true),
                icon: Plus,
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {batches.map((batch) => {
                const percentAllocated = Math.round((batch.allocated_quantity / (batch.received_quantity || 1)) * 100);

                return (
                  <Card key={batch.id} className="border shadow-xs">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-mono text-[11px] font-bold">
                          {batch.batch_number}
                        </Badge>
                        <Badge
                          variant={batch.available_quantity > 0 ? 'default' : 'secondary'}
                          className={batch.available_quantity > 0 ? 'bg-emerald-500/15 text-emerald-700' : ''}
                        >
                          {batch.available_quantity > 0 ? 'In Stock' : 'Depleted'}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-bold pt-1">
                        Available: {batch.available_quantity.toLocaleString()} {batch.unit}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Total Received: {batch.received_quantity.toLocaleString()} {batch.unit}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-xs">
                      {/* Inventory progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Allocated ({percentAllocated}%)</span>
                          <span>{batch.allocated_quantity} {batch.unit}</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${percentAllocated}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Created: {new Date(batch.created_at).toLocaleDateString()}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          disabled={batch.available_quantity <= 0}
                          onClick={() => {
                            setValueAlloc('seed_batch_id', batch.id);
                            setAddAllocationModalOpen(true);
                          }}
                        >
                          Allocate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Vendor Supplies */}
        <TabsContent value="SUPPLIES" className="space-y-4 pt-2">
          {isLoadingSupplies ? (
            <Card className="border border-border/80 shadow-2xs">
              <CardContent className="p-8 text-center">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Loading vendor supplies...</p>
              </CardContent>
            </Card>
          ) : supplies.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Vendor Supply Deliveries Recorded"
              description="Record official vendor seed dispatches and deliveries."
              action={{
                label: 'Record Supply',
                onClick: () => setAddSupplyModalOpen(true),
                icon: Plus,
              }}
            />
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                    <TableHead className="font-bold">Vendor Name</TableHead>
                    <TableHead className="font-bold">Crop & Variety</TableHead>
                    <TableHead className="font-bold">PO / Invoice Ref</TableHead>
                    <TableHead className="font-bold">Supply Date</TableHead>
                    <TableHead className="font-bold">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplies.map((supply) => {
                    const vendor = vendors.find((v) => v.id === supply.vendor_id);
                    return (
                      <TableRow key={supply.id} className="hover:bg-muted/30 text-xs">
                        <TableCell>
                          <div className="font-semibold text-foreground">{vendor ? vendor.vendor_name : 'Vendor'}</div>
                          <div className="text-[11px] text-muted-foreground">{vendor ? vendor.company_name : ''}</div>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-foreground">{supply.crop}</span>
                          <span className="text-[11px] text-muted-foreground block font-mono">{supply.variety}</span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs">{supply.purchase_reference || 'N/A'}</span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-[11px] text-muted-foreground">{supply.supply_date}</span>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-muted-foreground">{supply.remarks || 'Standard Delivery'}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Seed Allocation Modal (Batch -> Farmer -> Field) */}
      <Dialog open={addAllocationModalOpen} onOpenChange={setAddAllocationModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Allocate Certified Seed to Field</DialogTitle>
            <DialogDescription className="text-xs">
              Select available warehouse batch, recipient farmer, and verified field plot.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAlloc(onAllocationSubmit)} className="space-y-4 pt-2">
            {/* Step 1: Batch */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1. Select Seed Batch (Inventory Source) *</Label>
              <Select
                value={selectedBatchId}
                onValueChange={(v) => { if (v) setValueAlloc('seed_batch_id', v); }}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="Choose in-stock batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id} disabled={b.available_quantity <= 0}>
                      {b.batch_number} &bull; Available: {b.available_quantity} {b.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsAlloc.seed_batch_id && (
                <p className="text-[10px] text-destructive">{errorsAlloc.seed_batch_id.message}</p>
              )}
            </div>

            {/* Step 2: Farmer */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">2. Select Farmer Recipient *</Label>
              <Select
                value={selectedFarmerId}
                onValueChange={(v) => {
                  if (v) {
                    setValueAlloc('farmer_id', v);
                    const farmerPlot = fields.find((f) => f.farmer_id === v);
                    if (farmerPlot) {
                      setValueAlloc('field_id', farmerPlot.id);
                    } else {
                      setValueAlloc('field_id', '');
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="Choose farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} &bull; {f.village} ({f.district})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsAlloc.farmer_id && (
                <p className="text-[10px] text-destructive">{errorsAlloc.farmer_id.message}</p>
              )}
            </div>

            {/* Step 3: Field Plot */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">3. Select Field Plot *</Label>
              {farmerFields.length === 0 ? (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs text-amber-700 dark:text-amber-400">
                  This farmer has no registered field plots yet. Please register a field plot first.
                </div>
              ) : (
                <Select
                  value={selectedFieldId}
                  onValueChange={(v) => { if (v) setValueAlloc('field_id', v); }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="Choose field plot" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmerFields.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.field_name} &bull; {f.area} Acres ({f.crop || 'Wheat'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errorsAlloc.field_id && (
                <p className="text-[10px] text-destructive">{errorsAlloc.field_id.message}</p>
              )}
            </div>

            {/* Step 4: Quantity */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <Label className="text-xs font-semibold">Allocation Quantity ({currentBatch?.unit || 'KG'}) *</Label>
                {currentBatch && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Max Available: {currentBatch.available_quantity} {currentBatch.unit}
                  </span>
                )}
              </div>
              <Input
                type="number"
                step="1"
                min="1"
                max={currentBatch?.available_quantity || 1000}
                placeholder="50"
                {...registerAlloc('quantity', { valueAsNumber: true })}
                className="text-xs h-9"
              />
              {errorsAlloc.quantity && (
                <p className="text-[10px] text-destructive">{errorsAlloc.quantity.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Remarks / Dispatch Notes</Label>
              <Input
                placeholder="e.g., Certified tag issued for Kharif / Rabi sowing"
                {...registerAlloc('remarks')}
                className="text-xs h-9"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddAllocationModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isAllocating || farmerFields.length === 0 || !currentBatch || requestedQuantity > currentBatch.available_quantity}
                className="font-semibold gap-1.5"
              >
                {isAllocating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Allocating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Allocation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receive New Vendor Seed Supply Modal */}
      <Dialog open={addSupplyModalOpen} onOpenChange={setAddSupplyModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Receive Vendor Seed Supply</DialogTitle>
            <DialogDescription className="text-xs">
              Record new delivery batch from an authorized seed vendor to replenish warehouse stock.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSupply(onSupplySubmit)} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Authorized Seed Vendor *</Label>
              <Select
                value={selectedVendorId}
                onValueChange={(v) => { if (v) setValueSupply('vendor_id', v); }}
              >
                <SelectTrigger className="w-full text-xs h-8.5">
                  <SelectValue placeholder="Select Vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vendor_name} ({v.company_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errorsSupply.vendor_id && (
                <p className="text-[10px] text-destructive">{errorsSupply.vendor_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Crop Type *</Label>
                <Input
                  placeholder="e.g., Wheat"
                  {...registerSupply('crop')}
                  className="text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Seed Variety *</Label>
                <Input
                  placeholder="e.g., PBW-550 / HD-2967"
                  {...registerSupply('variety')}
                  className="text-xs h-8.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Batch / Lot Number *</Label>
                <Input
                  placeholder="e.g., BATCH-WHT-2026-001"
                  {...registerSupply('batch_number')}
                  className="text-xs h-8.5"
                />
                {errorsSupply.batch_number && (
                  <p className="text-[10px] text-destructive">{errorsSupply.batch_number.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Received Quantity (KG) *</Label>
                <Input
                  type="number"
                  step="10"
                  placeholder="500"
                  {...registerSupply('quantity', { valueAsNumber: true })}
                  className="text-xs h-8.5"
                />
                {errorsSupply.quantity && (
                  <p className="text-[10px] text-destructive">{errorsSupply.quantity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Delivery Date *</Label>
                <Input
                  type="date"
                  {...registerSupply('supply_date')}
                  className="text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">PO / Invoice Number</Label>
                <Input
                  placeholder="e.g., PO-2026-089"
                  {...registerSupply('purchase_reference')}
                  className="text-xs h-8.5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Remarks</Label>
              <Input
                placeholder="e.g., Certified seed delivery with test certificates"
                {...registerSupply('remarks')}
                className="text-xs h-8.5"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddSupplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreatingSupply} className="font-semibold">
                {isCreatingSupply ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Recording Supply...
                  </>
                ) : (
                  'Add to Warehouse Inventory'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Passbook Slip Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedAllocation && (
            <div className="space-y-4 pt-2">
              <div className="text-center pb-3 border-b space-y-1">
                <Badge variant="outline" className="text-[10px] font-mono mb-1">
                  OFFICIAL DIGITAL PASSBOOK SLIP
                </Badge>
                <h3 className="font-bold text-base text-foreground">Krishi AgriTech Seed Distribution</h3>
                <p className="text-xs text-muted-foreground font-mono">Allocation ID: #{selectedAllocation.id.slice(0, 12)}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Farmer Name:</span>
                  <span className="font-bold">
                    {farmers.find((f) => f.id === selectedAllocation.farmer_id)?.name || 'Farmer'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Field Plot:</span>
                  <span className="font-medium">
                    {fields.find((f) => f.id === selectedAllocation.field_id)?.field_name || 'Assigned Field'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Batch Number:</span>
                  <span className="font-mono font-semibold">
                    {batches.find((b) => b.id === selectedAllocation.seed_batch_id)?.batch_number || 'Batch'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Allocated Quantity:</span>
                  <span className="font-bold text-primary">
                    {selectedAllocation.quantity} {selectedAllocation.unit}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Allocation Date:</span>
                  <span className="font-mono">{selectedAllocation.allocation_date}</span>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    toast.success('Passbook receipt printed successfully');
                    setReceiptModalOpen(false);
                  }}
                  className="w-full font-semibold"
                >
                  Print Digital Passbook Slip
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
