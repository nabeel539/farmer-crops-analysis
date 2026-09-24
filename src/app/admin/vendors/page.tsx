'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  RefreshCw,
  FileCheck,
  AlertCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  Vendor,
} from '@/store/api/vendorApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

// Zod Schema for Vendor Form validation
const vendorSchema = z.object({
  vendor_name: z.string().min(2, 'Vendor name must be at least 2 characters'),
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  contact_person: z.string().min(2, 'Contact person must be at least 2 characters'),
  mobile_number: z.string().regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  gstin: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // RTK Query hooks
  const { data: vendors = [], isLoading, isError, error, refetch } = useGetVendorsQuery();
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
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      vendor_name: '',
      company_name: '',
      contact_person: '',
      mobile_number: '',
      email: '',
      address: '',
      gstin: '',
      status: 'ACTIVE',
    },
  });

  const selectedStatus = watch('status');

  const handleOpenCreateDialog = () => {
    setEditingVendor(null);
    reset({
      vendor_name: '',
      company_name: '',
      contact_person: '',
      mobile_number: '',
      email: '',
      address: '',
      gstin: '',
      status: 'ACTIVE',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    reset({
      vendor_name: vendor.vendor_name,
      company_name: vendor.company_name,
      contact_person: vendor.contact_person,
      mobile_number: vendor.mobile_number,
      email: vendor.email || '',
      address: vendor.address || '',
      gstin: vendor.gstin || '',
      status: vendor.status,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: VendorFormValues) => {
    try {
      if (editingVendor) {
        await updateVendor({
          id: editingVendor.id,
          data: values,
        }).unwrap();
        toast.success(`Vendor "${values.vendor_name}" updated successfully`);
      } else {
        await createVendor(values).unwrap();
        toast.success(`Vendor "${values.vendor_name}" created successfully`);
      }
      setIsDialogOpen(false);
      reset();
    } catch (err: any) {
      const errorDetail = err?.data?.detail || 'An unexpected error occurred. Please try again.';
      toast.error(errorDetail);
    }
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      await deleteVendor(vendorToDelete.id).unwrap();
      toast.success(`Vendor "${vendorToDelete.vendor_name}" set to Inactive`);
      setVendorToDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to deactivate vendor');
    }
  };

  // Filtered vendors
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.mobile_number.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = vendors.filter((v) => v.status === 'ACTIVE').length;
  const inactiveCount = vendors.filter((v) => v.status === 'INACTIVE').length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Vendor Management"
        description="Register and manage authorized seed vendors, supplier profiles, and supply agreements"
        actionButton={{
          label: 'Add New Vendor',
          onClick: handleOpenCreateDialog,
          icon: Plus,
        }}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-md bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Suppliers</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{vendors.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-600">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Active Vendors</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{activeCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Inactive / Paused</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{inactiveCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3.5 rounded-md border border-border/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendor, company, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(val) => { if (val) setStatusFilter(val); }}>
            <SelectTrigger className="w-36 h-9 text-xs">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active Only</SelectItem>
              <SelectItem value="INACTIVE">Inactive Only</SelectItem>
            </SelectContent>
          </Select>


          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-9 gap-1.5 text-xs"
            title="Refresh list"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content Area: Loading / Error / Empty / Table */}
      {isLoading ? (
        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading vendor directory from server...</span>
            </div>
            <div className="space-y-2 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted/60 rounded-md animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border border-destructive/30 bg-destructive/5 shadow-2xs">
          <CardContent className="p-8 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-destructive/10 text-destructive mb-1">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Failed to load vendors</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {(error as any)?.data?.detail || 'Unable to connect to backend server. Please verify database and backend status.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredVendors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={searchTerm || statusFilter !== 'ALL' ? 'No matching vendors found' : 'No seed vendors registered yet'}
          description={
            searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your search terms or status filters.'
              : 'Add your first certified seed supplier to start tracking seed batches and inventory allocations.'
          }
          action={
            searchTerm || statusFilter !== 'ALL'
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                  },
                }
              : {
                  label: 'Add First Vendor',
                  onClick: handleOpenCreateDialog,
                  icon: Plus,
                }
          }
        />
      ) : (
        <Card className="border border-border/80 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Vendor & Company</TableHead>
                <TableHead className="text-xs font-semibold">Contact Person</TableHead>
                <TableHead className="text-xs font-semibold">Contact Info</TableHead>
                <TableHead className="text-xs font-semibold">GSTIN / Address</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-foreground">{vendor.vendor_name}</span>
                      <span className="text-[11px] text-muted-foreground">{vendor.company_name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs text-foreground font-medium">{vendor.contact_person}</span>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
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
                          ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 border-emerald-500/30'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {vendor.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEditDialog(vendor)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Edit Vendor"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>

                      {vendor.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setVendorToDelete(vendor)}
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          title="Deactivate Vendor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add / Edit Vendor Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingVendor ? 'Edit Vendor Details' : 'Register New Seed Vendor'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter supplier business credentials and contact information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="vendor_name" className="text-xs">Vendor Name *</Label>
                <Input
                  id="vendor_name"
                  placeholder="e.g., IFFCO Seeds"
                  {...register('vendor_name')}
                  className="text-xs h-8.5"
                />
                {errors.vendor_name && (
                  <p className="text-[10px] text-destructive">{errors.vendor_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="company_name" className="text-xs">Company Name *</Label>
                <Input
                  id="company_name"
                  placeholder="e.g., IFFCO Seeds Ltd"
                  {...register('company_name')}
                  className="text-xs h-8.5"
                />
                {errors.company_name && (
                  <p className="text-[10px] text-destructive">{errors.company_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="contact_person" className="text-xs">Contact Person *</Label>
                <Input
                  id="contact_person"
                  placeholder="e.g., Ramesh Kumar"
                  {...register('contact_person')}
                  className="text-xs h-8.5"
                />
                {errors.contact_person && (
                  <p className="text-[10px] text-destructive">{errors.contact_person.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile_number" className="text-xs">Mobile Number *</Label>
                <Input
                  id="mobile_number"
                  placeholder="e.g., 9876543210"
                  {...register('mobile_number')}
                  className="text-xs h-8.5"
                />
                {errors.mobile_number && (
                  <p className="text-[10px] text-destructive">{errors.mobile_number.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="supplier@example.com"
                  {...register('email')}
                  className="text-xs h-8.5"
                />
                {errors.email && (
                  <p className="text-[10px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gstin" className="text-xs">GSTIN / Tax ID</Label>
                <Input
                  id="gstin"
                  placeholder="e.g., 07AAAAA0000A1Z5"
                  {...register('gstin')}
                  className="text-xs h-8.5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">Physical Address / City / State</Label>
              <Input
                id="address"
                placeholder="e.g., Saket District Center, New Delhi, Delhi 110017"
                {...register('address')}
                className="text-xs h-8.5"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Operational Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => { if (val) setValue('status', val as 'ACTIVE' | 'INACTIVE'); }}
              >
                <SelectTrigger className="h-8.5 text-xs">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE (Authorized Supplier)</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE (Temporarily Paused)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating || isUpdating}
                className="text-xs"
              >
                {isCreating || isUpdating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : editingVendor ? (
                  'Update Vendor'
                ) : (
                  'Create Vendor'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Soft Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(vendorToDelete)}
        onOpenChange={(open) => !open && setVendorToDelete(null)}
        title="Deactivate Vendor?"
        description={`Are you sure you want to deactivate "${vendorToDelete?.vendor_name}"? Existing seed batches will remain intact for audit and traceability.`}
        confirmLabel={isDeleting ? 'Deactivating...' : 'Deactivate'}
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
