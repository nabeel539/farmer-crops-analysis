'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetSeedBatchesQuery,
  useGetSeedSuppliesQuery,
  useCreateSeedSupplyMutation,
} from '@/store/api/seedApi';
import {
  useGetAllocationsQuery,
  useCreateAllocationMutation,
} from '@/store/api/allocationApi';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
import { useGetVendorsQuery } from '@/store/api/vendorApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { MetricCard } from '@/components/shared/MetricCard';
import { EmptyState } from '@/components/shared/EmptyState';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sprout,
  Plus,
  Package,
  Layers,
  ArrowDownToLine,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  Truck,
  CheckCircle2,
  Calendar,
  Warehouse,
  ShoppingBag,
  Clock,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  MOCK_FARMERS,
  MOCK_LAND_PARCELS,
} from '@/data/mockData';

const allocationSchema = z.object({
  seed_batch_id: z.string().min(1, 'Please select a seed batch from warehouse inventory'),
  farmer_id: z.string().min(1, 'Please select a registered farmer'),
  field_id: z.string().min(1, 'Please select a field plot belonging to the farmer'),
  quantity: z.number().positive('Allocation quantity must be greater than 0'),
  remarks: z.string().optional(),
});

type AllocationFormValues = z.infer<typeof allocationSchema>;

const supplySchema = z.object({
  vendor_id: z.string().min(1, 'Please select an authorized seed vendor'),
  crop: z.string().min(1, 'Crop type is required'),
  variety: z.string().min(1, 'Seed variety is required'),
  batch_number: z.string().min(2, 'Batch / Lot number must be at least 2 characters'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  supply_date: z.string().min(1, 'Supply delivery date is required'),
  purchase_reference: z.string().optional(),
  remarks: z.string().optional(),
});

type SupplyFormValues = z.infer<typeof supplySchema>;

export default function SeedDistributionPage() {
  const [activeTab, setActiveTab] = useState<'allocations' | 'inventory' | 'supplies'>('allocations');
  const [searchQuery, setSearchQuery] = useState('');
  const [varietyFilter, setVarietyFilter] = useState('ALL');

  // Pagination & View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [allocPage, setAllocPage] = useState(1);
  const [allocPageSize, setAllocPageSize] = useState(10);
  const [supplyPage, setSupplyPage] = useState(1);
  const [supplyPageSize, setSupplyPageSize] = useState(10);

  // Modals
  const [addAllocationModalOpen, setAddAllocationModalOpen] = useState(false);
  const [addSupplyModalOpen, setAddSupplyModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);

  // RTK Queries
  const { data: apiBatches = [], isLoading: isBatchesLoading } = useGetSeedBatchesQuery();
  const { data: apiSupplies = [], isLoading: isSuppliesLoading } = useGetSeedSuppliesQuery();
  const { data: apiAllocations = [], isLoading: isAllocationsLoading } = useGetAllocationsQuery();
  const { data: apiFarmers = [] } = useGetFarmersQuery();
  const { data: apiFields = [] } = useGetFieldsQuery();
  const { data: apiVendors = [] } = useGetVendorsQuery();

  const [createAllocation, { isLoading: isCreatingAlloc }] = useCreateAllocationMutation();
  const [createSeedSupply, { isLoading: isCreatingSupply }] = useCreateSeedSupplyMutation();

  const farmers = apiFarmers.length > 0 ? apiFarmers : MOCK_FARMERS.map((f) => ({
    id: f.id,
    name: f.fullName,
    mobile_number: f.mobile,
    village: f.village,
    district: f.district,
  }));

  const fields = apiFields.length > 0 ? apiFields : MOCK_LAND_PARCELS.map((p) => ({
    id: p.id,
    farmer_id: p.farmerId,
    field_name: p.parcelCode,
    area: p.totalAcreage,
    crop: 'Wheat',
  }));

  const vendors = apiVendors;

  const batches = apiBatches;
  const supplies = apiSupplies;
  const allocations = apiAllocations;

  // Form Hooks
  const {
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

  const onInvalidAlloc = (errors: any) => {
    const errorMessages = Object.values(errors)
      .map((err: any) => err?.message)
      .filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(`Mandatory field required: ${errorMessages[0]}`);
    } else {
      toast.error('Please fill all mandatory fields marked with *');
    }
  };

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

  const onInvalidSupply = (errors: any) => {
    const errorMessages = Object.values(errors)
      .map((err: any) => err?.message)
      .filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(`Mandatory field required: ${errorMessages[0]}`);
    } else {
      toast.error('Please fill all mandatory fields marked with *');
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
      batchNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalAllocItems = filteredAllocations.length;
  const totalAllocPages = Math.ceil(totalAllocItems / allocPageSize);
  const paginatedAllocations = filteredAllocations.slice(
    (allocPage - 1) * allocPageSize,
    allocPage * allocPageSize
  );

  // Filtered Supplies
  const filteredSupplies = supplies.filter((s) => {
    const vendorName = vendors.find((v) => v.id === s.vendor_id)?.vendor_name || '';
    const company = vendors.find((v) => v.id === s.vendor_id)?.company_name || '';
    return (
      searchQuery === '' ||
      vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.variety.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalSupplyItems = filteredSupplies.length;
  const totalSupplyPages = Math.ceil(totalSupplyItems / supplyPageSize);
  const paginatedSupplies = filteredSupplies.slice(
    (supplyPage - 1) * supplyPageSize,
    supplyPage * supplyPageSize
  );

  // Searchable Select Options
  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: `${b.batch_number}`,
    subLabel: `Available: ${b.available_quantity} ${b.unit}`,
    disabled: b.available_quantity <= 0,
  }));

  const farmerOptions = farmers.map((f) => ({
    value: f.id,
    label: f.name,
    subLabel: `${f.village} (${f.district})`,
  }));

  const fieldOptions = farmerFields.map((f) => ({
    value: f.id,
    label: f.field_name,
    subLabel: `${f.area} Acres (${f.crop || 'Wheat'})`,
  }));

  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: v.vendor_name,
    subLabel: v.company_name,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Seed Procurement & Distribution"
        description="Warehouse stock inventory, vendor deliveries, and certified seed allotments to verified farmer parcels."
        actionButton={{
          label: 'Distribute Seed to Farmer',
          icon: Sprout,
          onClick: () => setAddAllocationModalOpen(true),
        }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAddSupplyModalOpen(true)}
          className="gap-1.5 text-xs font-semibold"
        >
          <Truck className="h-3.5 w-3.5 text-primary" />
          Receive Vendor Delivery
        </Button>
      </PageHeader>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Warehouse Stock"
          value={`${totalReceivedStock.toLocaleString()} KG`}
          subtitle="Total Certified Inflow"
          icon={Warehouse}
          variant="primary"
        />
        <MetricCard
          title="Allocated to Farmers"
          value={`${totalAllocatedStock.toLocaleString()} KG`}
          subtitle={`${allocations.length} Active Field Allotments`}
          icon={ShoppingBag}
        />
        <MetricCard
          title="Available Inventory"
          value={`${totalAvailableStock.toLocaleString()} KG`}
          subtitle="Ready for Field Allocation"
          icon={Layers}
        />
        <MetricCard
          title="Certified Batches"
          value={batches.length}
          subtitle="High-Yield Varieties (HD-2967, PBW-550)"
          icon={CheckCircle2}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="allocations" className="text-xs">
              Farmer Allocations ({allocations.length})
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-xs">
              Batches ({batches.length})
            </TabsTrigger>
            <TabsTrigger value="supplies" className="text-xs">
              Vendor Supplies ({supplies.length})
            </TabsTrigger>
          </TabsList>

          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setAllocPage(1);
              setSupplyPage(1);
            }}
            searchPlaceholder="Search farmer, plot, batch..."
            filters={[]}
            onReset={() => {
              setSearchQuery('');
              setAllocPage(1);
              setSupplyPage(1);
            }}
            className="w-full sm:w-72"
          />
        </div>

        {/* TAB 1: FIELD ALLOCATIONS */}
        <TabsContent value="allocations" className="space-y-4">
          {isAllocationsLoading ? (
            <Card className="border border-border/80 shadow-2xs">
              <CardContent className="p-8 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
                Loading allocations...
              </CardContent>
            </Card>
          ) : filteredAllocations.length === 0 ? (
            <EmptyState
              icon={Sprout}
              title="No Seed Allocations Found"
              description="No certified seed has been allocated yet matching your search filter."
              action={{
                label: 'Make First Allocation',
                onClick: () => setAddAllocationModalOpen(true),
                icon: Plus,
              }}
            />
          ) : (
            <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
              {viewMode === 'table' ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                      <TableHead className="font-bold">Slip No.</TableHead>
                      <TableHead className="font-bold">Farmer Recipient</TableHead>
                      <TableHead className="font-bold">Target Field Plot</TableHead>
                      <TableHead className="font-bold">Batch Number</TableHead>
                      <TableHead className="font-bold text-right">Quantity</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="text-right">Passbook Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAllocations.map((alloc) => {
                      const farmer = farmers.find((f) => f.id === alloc.farmer_id);
                      const field = fields.find((f) => f.id === alloc.field_id);
                      const batch = batches.find((b) => b.id === alloc.seed_batch_id);

                      return (
                        <TableRow key={alloc.id} className="hover:bg-muted/30 text-xs">
                          <TableCell>
                            <span className="font-mono font-bold text-foreground block">
                              SLIP-#{alloc.id.slice(0, 6).toUpperCase()}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="font-semibold text-foreground">
                              {farmer ? farmer.name : 'Unknown Farmer'}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {farmer ? farmer.mobile_number : ''}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-foreground">
                              {field ? field.field_name : 'General Plot'}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {field ? `${field.area} Acres` : ''}
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline" className="font-mono text-[11px] bg-muted/60">
                              {batch ? batch.batch_number : 'Batch'}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right font-mono font-bold text-foreground">
                            {alloc.quantity} {alloc.unit || 'KG'}
                          </TableCell>

                          <TableCell>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {alloc.allocation_date}
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAllocation(alloc);
                                setReceiptModalOpen(true);
                              }}
                              className="h-7 text-xs gap-1 font-semibold"
                            >
                              <Printer className="h-3.5 w-3.5 text-primary" />
                              View Slip
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                /* Card Grid View */
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {paginatedAllocations.map((alloc) => {
                    const farmer = farmers.find((f) => f.id === alloc.farmer_id);
                    const field = fields.find((f) => f.id === alloc.field_id);
                    const batch = batches.find((b) => b.id === alloc.seed_batch_id);

                    return (
                      <Card key={alloc.id} className="border hover:border-primary/40 transition-all shadow-xs">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono font-bold text-xs text-primary block">
                                SLIP-#{alloc.id.slice(0, 6).toUpperCase()}
                              </span>
                              <h4 className="font-bold text-sm text-foreground mt-0.5">
                                {farmer?.name || 'Farmer'}
                              </h4>
                              <p className="text-[11px] text-muted-foreground">{farmer?.village}</p>
                            </div>
                            <Badge variant="outline" className="text-xs font-mono font-bold bg-muted/50">
                              {alloc.quantity} {alloc.unit || 'KG'}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t text-muted-foreground">
                            <div>
                              <span className="text-[11px] block">Field Plot:</span>
                              <span className="font-semibold text-foreground">{field?.field_name || 'Plot'}</span>
                            </div>
                            <div>
                              <span className="text-[11px] block">Batch Number:</span>
                              <span className="font-mono text-foreground">{batch?.batch_number}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t flex items-center justify-between">
                            <span className="text-[11px] text-muted-foreground font-mono">{alloc.allocation_date}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAllocation(alloc);
                                setReceiptModalOpen(true);
                              }}
                              className="h-7 text-xs gap-1 font-semibold"
                            >
                              <Printer className="h-3 w-3" />
                              Slip
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* DataTable Pagination */}
              <DataTablePagination
                currentPage={allocPage}
                totalPages={totalAllocPages}
                pageSize={allocPageSize}
                totalItems={totalAllocItems}
                onPageChange={setAllocPage}
                onPageSizeChange={setAllocPageSize}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          )}
        </TabsContent>

        {/* TAB 2: INVENTORY BATCHES */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches.map((b) => (
              <Card key={b.id} className="border shadow-2xs hover:border-border transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[11px] bg-primary/10 text-primary border-primary/30">
                      {b.batch_number}
                    </Badge>
                    <Badge variant={b.available_quantity > 0 ? 'default' : 'secondary'} className="text-[10px]">
                      {b.available_quantity > 0 ? 'IN STOCK' : 'EXHAUSTED'}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold pt-1">
                    {b.available_quantity.toLocaleString()} {b.unit} Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Allocated / Dispatched</span>
                      <span className="font-mono">{b.allocated_quantity} {b.unit}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(100, (b.allocated_quantity / b.received_quantity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Received: {b.received_quantity} {b.unit}</span>
                    <span>Created: {b.created_at ? b.created_at.split('T')[0] : 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: VENDOR SUPPLIES */}
        <TabsContent value="supplies" className="space-y-4">
          {isSuppliesLoading ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">Loading supplies...</Card>
          ) : filteredSupplies.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No Vendor Supplies Recorded"
              description="Record new incoming certified seed batches from authorized seed vendors."
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
                    <TableHead className="font-bold">Vendor Organization</TableHead>
                    <TableHead className="font-bold">Crop & Variety</TableHead>
                    <TableHead className="font-bold">PO / Invoice Ref</TableHead>
                    <TableHead className="font-bold">Delivery Date</TableHead>
                    <TableHead className="font-bold">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSupplies.map((supply) => {
                    const vendor = vendors.find((v) => v.id === supply.vendor_id);
                    return (
                      <TableRow key={supply.id} className="hover:bg-muted/30 text-xs">
                        <TableCell>
                          <div className="font-semibold text-foreground">
                            {vendor ? vendor.company_name : 'Authorized Vendor'}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium">
                            {vendor ? vendor.vendor_name : ''}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-foreground">{supply.variety}</div>
                          <div className="text-[11px] text-muted-foreground">{supply.crop}</div>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {supply.purchase_reference || 'N/A'}
                          </span>
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

              <DataTablePagination
                currentPage={supplyPage}
                totalPages={totalSupplyPages}
                pageSize={supplyPageSize}
                totalItems={totalSupplyItems}
                onPageChange={setSupplyPage}
                onPageSizeChange={setSupplyPageSize}
                showViewToggle={false}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New Seed Allocation Modal (Searchable Selects) */}
      <Dialog open={addAllocationModalOpen} onOpenChange={setAddAllocationModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Issue Seed to Farmer (Field Plot Allotment)</DialogTitle>
            <DialogDescription className="text-xs">
              Select available warehouse batch, recipient farmer, and verified field plot.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAlloc(onAllocationSubmit, onInvalidAlloc)} className="space-y-4 pt-2">
            {/* Step 1: Batch */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">1. Select Seed Batch (Inventory Source) *</Label>
              <SearchableSelect
                options={batchOptions}
                value={selectedBatchId}
                onChange={(val) => setValueAlloc('seed_batch_id', val)}
                placeholder="Choose in-stock batch..."
                searchPlaceholder="Search batch number..."
              />
              {errorsAlloc.seed_batch_id && (
                <p className="text-[10px] text-destructive">{errorsAlloc.seed_batch_id.message}</p>
              )}
            </div>

            {/* Step 2: Farmer */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">2. Select Farmer Recipient *</Label>
              <SearchableSelect
                options={farmerOptions}
                value={selectedFarmerId}
                onChange={(val) => {
                  setValueAlloc('farmer_id', val);
                  const farmerPlot = fields.find((f) => f.farmer_id === val);
                  if (farmerPlot) {
                    setValueAlloc('field_id', farmerPlot.id);
                  } else {
                    setValueAlloc('field_id', '');
                  }
                }}
                placeholder="Choose farmer recipient..."
                searchPlaceholder="Search farmer name, village..."
              />
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
                <SearchableSelect
                  options={fieldOptions}
                  value={selectedFieldId}
                  onChange={(val) => setValueAlloc('field_id', val)}
                  placeholder="Choose field plot..."
                  searchPlaceholder="Search field plot..."
                />
              )}
              {errorsAlloc.field_id && (
                <p className="text-[10px] text-destructive">{errorsAlloc.field_id.message}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">4. Allotment Quantity (KG) *</Label>
              <Input
                type="number"
                step="5"
                min="1"
                placeholder="50"
                value={requestedQuantity}
                onChange={(e) => setValueAlloc('quantity', parseFloat(e.target.value) || 0)}
                className="text-xs"
              />
              {errorsAlloc.quantity && (
                <p className="text-[10px] text-destructive">{errorsAlloc.quantity.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddAllocationModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreatingAlloc} className="font-semibold">
                {isCreatingAlloc ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Allocating...
                  </>
                ) : (
                  'Confirm Seed Allocation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Receive Vendor Delivery Modal */}
      <Dialog open={addSupplyModalOpen} onOpenChange={setAddSupplyModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Receive Vendor Seed Supply</DialogTitle>
            <DialogDescription className="text-xs">
              Record new delivery batch from an authorized seed vendor to replenish warehouse stock.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitSupply(onSupplySubmit, onInvalidSupply)} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Authorized Seed Vendor *</Label>
              <SearchableSelect
                options={vendorOptions}
                value={selectedVendorId}
                onChange={(val) => setValueSupply('vendor_id', val)}
                placeholder="Select Vendor..."
                searchPlaceholder="Search vendor name, company..."
              />
              {errorsSupply.vendor_id && (
                <p className="text-[10px] text-destructive">{errorsSupply.vendor_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Crop Type *</Label>
                <Input placeholder="Wheat" {...registerSupply('crop')} className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Seed Variety *</Label>
                <Input placeholder="e.g., HD-2967 / PBW-550" {...registerSupply('variety')} className="text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Batch / Lot Number *</Label>
                <Input placeholder="e.g., BATCH-WHT-2026-009" {...registerSupply('batch_number')} className="text-xs" />
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
                  className="text-xs"
                />
                {errorsSupply.quantity && (
                  <p className="text-[10px] text-destructive">{errorsSupply.quantity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Delivery Date *</Label>
                <Input type="date" {...registerSupply('supply_date')} className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">PO / Invoice Number</Label>
                <Input placeholder="e.g., PO-2026-089" {...registerSupply('purchase_reference')} className="text-xs" />
              </div>
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
                <p className="text-xs text-muted-foreground font-mono">
                  Allocation Slip: SLIP-#{selectedAllocation.id.slice(0, 6).toUpperCase()}
                </p>
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
                  <span className="font-mono font-bold">
                    {batches.find((b) => b.id === selectedAllocation.seed_batch_id)?.batch_number || 'Batch'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Quantity Allotted:</span>
                  <span className="font-bold font-mono text-emerald-600">
                    {selectedAllocation.quantity} {selectedAllocation.unit || 'KG'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed">
                  <span className="text-muted-foreground">Allocation Date:</span>
                  <span className="font-mono">{selectedAllocation.allocation_date}</span>
                </div>
              </div>

              <div className="p-2.5 bg-muted/60 rounded-md text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Certified high-germination seed under National Wheat Cultivation Program.</span>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setReceiptModalOpen(false)}>
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    window.print();
                  }}
                  className="font-semibold gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Passbook Slip
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
