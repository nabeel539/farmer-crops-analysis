'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetFarmersQuery,
  useCreateFarmerMutation,
  useUpdateFarmerMutation,
  Farmer as ApiFarmer,
} from '@/store/api/farmerApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  RefreshCw,
  Download,
  Phone,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

// Zod Schema for Farmer form validation per FE Best Practices
const farmerFormSchema = z.object({
  name: z.string().min(2, 'Farmer name must be at least 2 characters'),
  mobile_number: z.string().regex(/^[0-9+\-\s]{10,15}$/, 'Enter a valid 10-digit mobile number'),
  village: z.string().min(1, 'Village is required'),
  block: z.string().optional().or(z.literal('')),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  address: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION']),
});

type FarmerFormValues = z.infer<typeof farmerFormSchema>;

export default function FarmersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // Modal & Sheet states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<ApiFarmer | null>(null);
  const [editingFarmer, setEditingFarmer] = useState<ApiFarmer | null>(null);

  // RTK Query API Hooks
  const {
    data: farmers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFarmersQuery({
    search: searchQuery || undefined,
    district: districtFilter !== 'ALL' ? districtFilter : undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const [createFarmer, { isLoading: isCreating }] = useCreateFarmerMutation();
  const [updateFarmer, { isLoading: isUpdating }] = useUpdateFarmerMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerFormSchema),
    defaultValues: {
      name: '',
      mobile_number: '',
      village: '',
      block: '',
      district: 'Ludhiana',
      state: 'Punjab',
      address: '',
      status: 'ACTIVE',
    },
  });

  const selectedStatus = watch('status');
  const selectedDistrict = watch('district');

  const handleOpenAddModal = () => {
    setEditingFarmer(null);
    reset({
      name: '',
      mobile_number: '',
      village: '',
      block: '',
      district: 'Ludhiana',
      state: 'Punjab',
      address: '',
      status: 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (farmer: ApiFarmer) => {
    setEditingFarmer(farmer);
    reset({
      name: farmer.name,
      mobile_number: farmer.mobile_number,
      village: farmer.village,
      block: farmer.block || '',
      district: farmer.district,
      state: farmer.state,
      address: farmer.address || '',
      status: farmer.status,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: FarmerFormValues) => {
    try {
      if (editingFarmer) {
        await updateFarmer({
          id: editingFarmer.id,
          data: values,
        }).unwrap();
        toast.success(`Farmer "${values.name}" profile updated successfully!`);
      } else {
        await createFarmer(values).unwrap();
        toast.success(`Farmer "${values.name}" enrolled successfully!`);
      }
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to save farmer profile. Please try again.');
    }
  };

  const handleExportCSV = () => {
    if (farmers.length === 0) {
      toast.error('No farmer records to export');
      return;
    }
    const headers = ['Farmer ID', 'Name', 'Mobile', 'Village', 'Block', 'District', 'State', 'Status', 'Registered Date'];
    const rows = farmers.map((f) => [
      f.id,
      f.name,
      f.mobile_number,
      f.village,
      f.block || '',
      f.district,
      f.state,
      f.status,
      f.registration_date,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Farmers_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Farmers Registry exported as CSV');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Registered Farmers Registry"
        description="Official wheat growers database: Farmer enrollment, village mapping, and crop land records."
        actionButton={{
          label: 'Enroll Farmer',
          icon: Plus,
          onClick: handleOpenAddModal,
        }}
      >
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs font-semibold">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Search and Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by farmer name, mobile, village, or ID..."
        filters={[
          {
            id: 'district',
            placeholder: 'All Districts',
            value: districtFilter,
            onChange: (v) => setDistrictFilter(v),
            options: [
              { label: 'All Districts', value: 'ALL' },
              { label: 'Ludhiana', value: 'Ludhiana' },
              { label: 'Karnal', value: 'Karnal' },
              { label: 'Patiala', value: 'Patiala' },
              { label: 'Bathinda', value: 'Bathinda' },
              { label: 'Meerut', value: 'Meerut' },
              { label: 'Indore', value: 'Indore' },
              { label: 'Ambala', value: 'Ambala' },
              { label: 'Sirsa', value: 'Sirsa' },
              { label: 'Sangrur', value: 'Sangrur' },
            ],
          },
          {
            id: 'status',
            placeholder: 'All Statuses',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v),
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Pending Verification', value: 'PENDING_VERIFICATION' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setDistrictFilter('ALL');
          setStatusFilter('ALL');
        }}
      />

      {/* Main Content Area: Loading / Error / Empty / Table */}
      {isLoading ? (
        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Fetching farmers registry from server...</span>
            </div>
            <div className="space-y-2 pt-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
            <h3 className="text-base font-semibold text-foreground">Failed to load farmers registry</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {(error as any)?.data?.detail || 'Unable to connect to backend server. Please verify database connection.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : farmers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery || statusFilter !== 'ALL' || districtFilter !== 'ALL' ? 'No matching farmers found' : 'No farmers registered yet'}
          description={
            searchQuery || statusFilter !== 'ALL' || districtFilter !== 'ALL'
              ? 'Try resetting your search query or district filters.'
              : 'Enroll your first wheat farmer to start tracking field plots, seed allotments, and crop plans.'
          }
          action={{
            label: 'Enroll First Farmer',
            onClick: handleOpenAddModal,
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
                <TableHead className="font-bold">Farmer Name</TableHead>
                <TableHead className="font-bold">Contact Number</TableHead>
                <TableHead className="font-bold">Location (Village / District)</TableHead>
                <TableHead className="font-bold">Registration Date</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="w-12 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farmers.map((farmer) => (
                <TableRow key={farmer.id} className="hover:bg-muted/30 text-xs">
                  <TableCell>
                    <div className="font-semibold text-foreground">{farmer.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      ID: {farmer.id.slice(0, 8)}...
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-primary" />
                      <span className="font-mono text-foreground font-medium">{farmer.mobile_number}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {farmer.village}
                    </div>
                    <div className="text-[11px] text-muted-foreground pl-4">
                      {farmer.block ? `${farmer.block}, ` : ''}{farmer.district}, {farmer.state}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-[11px] text-muted-foreground">{farmer.registration_date}</span>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={farmer.status} />
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      } />
                      <DropdownMenuContent align="end" className="w-44 text-xs">
                        <DropdownMenuLabel>Farmer Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedFarmer(farmer);
                            setDetailSheetOpen(true);
                          }}
                          className="gap-2 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-blue-500" />
                          View Dossier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenEditModal(farmer)}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-amber-500" />
                          Edit Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Farmer Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingFarmer ? 'Edit Farmer Profile' : 'Enroll New Wheat Farmer'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete farmer registry form with contact details and regional mapping.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Farmer Full Name *</Label>
                <Input
                  placeholder="e.g., Balwinder Singh"
                  {...register('name')}
                />
                {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input
                  placeholder="e.g., 9876540001"
                  {...register('mobile_number')}
                />
                {errors.mobile_number && <p className="text-[10px] text-destructive">{errors.mobile_number.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Village *</Label>
                <Input
                  placeholder="e.g., Rampur"
                  {...register('village')}
                />
                {errors.village && <p className="text-[10px] text-destructive">{errors.village.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Block / Tehsil</Label>
                <Input
                  placeholder="e.g., Samrala"
                  {...register('block')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">District *</Label>
                <Select
                  value={selectedDistrict || 'Ludhiana'}
                  onValueChange={(v) => {
                    if (v) setValue('district', v);
                  }}
                >
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ludhiana">Ludhiana (Punjab)</SelectItem>
                    <SelectItem value="Karnal">Karnal (Haryana)</SelectItem>
                    <SelectItem value="Patiala">Patiala (Punjab)</SelectItem>
                    <SelectItem value="Bathinda">Bathinda (Punjab)</SelectItem>
                    <SelectItem value="Meerut">Meerut (UP)</SelectItem>
                    <SelectItem value="Indore">Indore (MP)</SelectItem>
                    <SelectItem value="Ambala">Ambala (Haryana)</SelectItem>
                    <SelectItem value="Sirsa">Sirsa (Haryana)</SelectItem>
                    <SelectItem value="Sangrur">Sangrur (Punjab)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.district && <p className="text-[10px] text-destructive">{errors.district.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">State *</Label>
                <Input
                  placeholder="e.g., Punjab"
                  {...register('state')}
                />
                {errors.state && <p className="text-[10px] text-destructive">{errors.state.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Physical Address</Label>
              <Input
                placeholder="e.g., House No. 42, Near Gurdwara Sahib"
                {...register('address')}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Enrollment Status</Label>
              <Select
                value={selectedStatus || 'ACTIVE'}
                onValueChange={(v) => {
                  if (v) setValue('status', v as 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION');
                }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE (Approved & Verified)</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">PENDING_VERIFICATION</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreating || isUpdating} className="font-semibold">
                {isCreating || isUpdating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : editingFarmer ? (
                  'Save Changes'
                ) : (
                  'Enroll Farmer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Farmer Dossier Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {selectedFarmer && (
            <>
              <SheetHeader className="space-y-2 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    ID: {selectedFarmer.id.slice(0, 8)}
                  </Badge>
                  <StatusBadge status={selectedFarmer.status} />
                </div>
                <SheetTitle className="text-xl font-bold">{selectedFarmer.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  Registered on {selectedFarmer.registration_date}
                </SheetDescription>
              </SheetHeader>

              {/* Identification & Contact */}
              <div className="space-y-3 p-4 border rounded-lg bg-card text-xs">
                <h4 className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Farmer Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mobile Number:</span>
                    <span className="font-semibold">{selectedFarmer.mobile_number}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">District:</span>
                    <span className="font-semibold">{selectedFarmer.district}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Village:</span>
                    <span className="font-semibold">{selectedFarmer.village}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">State:</span>
                    <span className="font-semibold">{selectedFarmer.state}</span>
                  </div>
                  {selectedFarmer.address && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground block text-[11px]">Address:</span>
                      <span>{selectedFarmer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
