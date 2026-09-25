'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  Vendor as ApiVendor,
} from '@/store/api/vendorApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { MetricCard } from '@/components/shared/MetricCard';
import { EmptyState } from '@/components/shared/EmptyState';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  RefreshCw,
  Truck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

const vendorFormSchema = z.object({
  vendor_name: z.string().min(2, 'Vendor name must be at least 2 characters'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  contact_person: z.string().min(2, 'Contact person name is required'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<ApiVendor | null>(null);

  const { data: apiVendors = [], isLoading, refetch } = useGetVendorsQuery();
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      vendor_name: '',
      company_name: '',
      contact_person: '',
      mobile_number: '',
      email: '',
      gstin: '',
      address: '',
      status: 'ACTIVE',
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
  });

  const filteredVendors = apiVendors.filter((v) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      v.vendor_name.toLowerCase().includes(q) ||
      v.company_name.toLowerCase().includes(q) ||
      v.contact_person.toLowerCase().includes(q) ||
      v.mobile_number.includes(q);

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Slicing
  const totalItems = filteredVendors.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeCount = apiVendors.filter((v) => v.status === 'ACTIVE').length;

  const handleOpenCreateDialog = () => {
    reset({
      vendor_name: '',
      company_name: '',
      contact_person: '',
      mobile_number: '',
      email: '',
      gstin: '',
      address: '',
      status: 'ACTIVE',
    });
    setCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (vendor: ApiVendor) => {
    setSelectedVendor(vendor);
    resetEdit({
      vendor_name: vendor.vendor_name,
      company_name: vendor.company_name,
      contact_person: vendor.contact_person,
      mobile_number: vendor.mobile_number,
      email: vendor.email || '',
      gstin: vendor.gstin || '',
      address: vendor.address || '',
      status: vendor.status as 'ACTIVE' | 'INACTIVE',
    });
    setEditDialogOpen(true);
  };

  const onCreateSubmit = async (values: VendorFormValues) => {
    try {
      await createVendor(values).unwrap();
      toast.success(`Vendor "${values.vendor_name}" added successfully`);
      setCreateDialogOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to create vendor');
    }
  };

  const onEditSubmit = async (values: VendorFormValues) => {
    if (!selectedVendor) return;
    try {
      await updateVendor({ id: selectedVendor.id, data: values }).unwrap();
      toast.success(`Vendor "${values.vendor_name}" updated successfully`);
      setEditDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to update vendor');
    }
  };

  const handleDeleteVendor = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete vendor "${name}"?`)) {
      try {
        await deleteVendor(id).unwrap();
        toast.success(`Vendor "${name}" deleted`);
      } catch (err: any) {
        toast.error(err?.data?.detail || 'Failed to delete vendor');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Seed & Input Vendors"
        description="Manage authorized seed corporations, agricultural input suppliers, and certified variety vendors."
        actionButton={{
          label: 'Register New Vendor',
          icon: Plus,
          onClick: handleOpenCreateDialog,
        }}
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Registered Vendors"
          value={apiVendors.length}
          subtitle="Authorized Supply Partners"
          icon={Building2}
          variant="primary"
        />
        <MetricCard
          title="Active Suppliers"
          value={activeCount}
          subtitle="Approved for Direct Seed Allotment"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Certified Seed Batches"
          value="HD-2967, PBW-550"
          subtitle="National Seed Varieties"
          icon={Truck}
        />
      </div>

      {/* Search & Filter */}
      <SearchFilterBar
        searchQuery={searchTerm}
        onSearchChange={(q) => {
          setSearchTerm(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search vendor name, company, contact person..."
        filters={[
          {
            id: 'status',
            placeholder: 'All Statuses',
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            },
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
        onReset={() => {
          setSearchTerm('');
          setStatusFilter('ALL');
          setCurrentPage(1);
        }}
      />

      {/* Vendors Table / Card View Area */}
      {isLoading ? (
        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-8 text-center text-xs text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin text-primary mx-auto mb-2" />
            Loading vendors...
          </CardContent>
        </Card>
      ) : filteredVendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Vendors Found"
          description="No agricultural seed vendors match your search filters."
          action={{
            label: 'Register First Vendor',
            onClick: handleOpenCreateDialog,
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          {viewMode === 'table' ? (
            <Table>
              <TableHeader className="bg-muted/40 text-xs">
                <TableRow>
                  <TableHead className="font-bold">Vendor & Company</TableHead>
                  <TableHead className="font-bold">Contact Person</TableHead>
                  <TableHead className="font-bold">Contact Info</TableHead>
                  <TableHead className="font-bold">GSTIN / Address</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-muted/30 transition-colors text-xs">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-xs">{vendor.vendor_name}</span>
                        <span className="text-[11px] text-muted-foreground font-medium">{vendor.company_name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-foreground">{vendor.contact_person}</span>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Phone className="h-3 w-3 text-primary" />
                          {vendor.mobile_number}
                        </span>
                        {vendor.email && (
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {vendor.email}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground max-w-xs truncate">
                        {vendor.gstin && (
                          <span className="font-mono text-foreground font-medium">GST: {vendor.gstin}</span>
                        )}
                        {vendor.address && (
                          <span className="flex items-center gap-1 text-muted-foreground truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {vendor.address}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={vendor.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={
                          vendor.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {vendor.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(vendor)}
                          className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor.id, vendor.vendor_name)}
                          className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Card Grid View */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedVendors.map((vendor) => (
                <Card key={vendor.id} className="border hover:border-primary/40 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{vendor.vendor_name}</h4>
                          <p className="text-[11px] text-muted-foreground">{vendor.company_name}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={vendor.status === 'ACTIVE' ? 'text-emerald-600 border-emerald-500/30' : ''}
                      >
                        {vendor.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 pt-1 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        <span>{vendor.mobile_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Contact: {vendor.contact_person}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{vendor.address || 'Standard Location'}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(vendor)}
                          className="h-7 text-xs gap-1 text-amber-600"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor.id, vendor.vendor_name)}
                          className="h-7 text-xs gap-1 text-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
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

      {/* Create Vendor Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Register Authorized Seed Vendor</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new seed corporation, distributor, or agricultural input vendor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Vendor / Brand Name *</Label>
                <Input placeholder="e.g. Punjab Seed Corp" {...register('vendor_name')} className="text-xs" />
                {errors.vendor_name && <p className="text-[10px] text-destructive">{errors.vendor_name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Registered Company Name *</Label>
                <Input placeholder="e.g. Punjab State Seeds Corporation Ltd." {...register('company_name')} className="text-xs" />
                {errors.company_name && <p className="text-[10px] text-destructive">{errors.company_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Person *</Label>
                <Input placeholder="e.g. Gurpreet Singh" {...register('contact_person')} className="text-xs" />
                {errors.contact_person && <p className="text-[10px] text-destructive">{errors.contact_person.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input placeholder="e.g. 9814012345" {...register('mobile_number')} className="text-xs" />
                {errors.mobile_number && <p className="text-[10px] text-destructive">{errors.mobile_number.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Email Address</Label>
                <Input type="email" placeholder="contact@punjabseeds.gov.in" {...register('email')} className="text-xs" />
                {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">GSTIN Number</Label>
                <Input placeholder="03AAAAA0000A1Z5" {...register('gstin')} className="text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Warehouse / Office Address</Label>
              <Input placeholder="Plot 12, Focal Point, Ludhiana, Punjab" {...register('address')} className="text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreating} className="font-semibold">
                {isCreating ? 'Saving...' : 'Register Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Vendor Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Vendor Profile</DialogTitle>
            <DialogDescription className="text-xs">
              Update contact information, GSTIN, and authorization status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Vendor Name *</Label>
                <Input {...registerEdit('vendor_name')} className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Company Name *</Label>
                <Input {...registerEdit('company_name')} className="text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Person *</Label>
                <Input {...registerEdit('contact_person')} className="text-xs" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input {...registerEdit('mobile_number')} className="text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => {
                  if (v) setValueEdit('status', v as any);
                }}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isUpdating} className="font-semibold">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
