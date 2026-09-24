'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  addFarmer,
  updateFarmer,
  deleteFarmer,
  setFarmerSearchQuery,
  setFarmerStatusFilter,
  setFarmerDistrictFilter,
} from '@/store/slices/farmersSlice';
import { Farmer } from '@/types';
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
import {
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Download,
  Phone,
  MapPin,
  LandPlot,
  Star,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export default function FarmersPage() {
  const dispatch = useAppDispatch();
  const { farmers, searchQuery, statusFilter, districtFilter } = useAppSelector(
    (state) => state.farmers
  );
  const parcels = useAppSelector((state) => state.landParcels.parcels);
  const cropCycles = useAppSelector((state) => state.cropCycles.cycles);
  const distributions = useAppSelector((state) => state.seedDistributions.distributions);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [farmerToDeleteId, setFarmerToDeleteId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Farmer>>({
    fullName: '',
    fatherName: '',
    cnicOrId: '',
    mobile: '',
    village: '',
    unionCouncil: '',
    tehsil: '',
    district: 'Ludhiana',
    totalLandAcres: 10,
    wheatAcreage: 8,
    bankName: 'State Bank of India (SBI)',
    bankAccountNumber: '',
    bankAccountTitle: '',
    status: 'ACTIVE',
  });

  // Filter Logic
  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      searchQuery === '' ||
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.farmerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cnicOrId.includes(searchQuery) ||
      f.mobile.includes(searchQuery);

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    const matchesDistrict = districtFilter === 'ALL' || f.district === districtFilter;

    return matchesSearch && matchesStatus && matchesDistrict;
  });

  const handleOpenAddModal = () => {
    setEditingFarmer(null);
    setFormData({
      fullName: '',
      fatherName: '',
      cnicOrId: '',
      mobile: '+91 98',
      village: '',
      unionCouncil: 'Panchayat-Gill',
      tehsil: 'Ludhiana West',
      district: 'Ludhiana',
      totalLandAcres: 15,
      wheatAcreage: 12,
      bankName: 'State Bank of India (SBI)',
      bankAccountNumber: 'SBIN0001234',
      bankAccountTitle: '',
      status: 'ACTIVE',
    });
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({ ...farmer });
    setAddModalOpen(true);
  };

  const handleSaveFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobile || !formData.cnicOrId) {
      toast.error('Please fill required fields (Name, CNIC, Mobile)');
      return;
    }

    if (editingFarmer) {
      dispatch(updateFarmer({ ...editingFarmer, ...formData } as Farmer));
      toast.success(`Farmer ${formData.fullName} updated successfully!`);
    } else {
      const newFarmer: Farmer = {
        id: `FARM-${String(farmers.length + 1).padStart(3, '0')}`,
        farmerCode: `FARM-2026-${String(farmers.length + 1).padStart(3, '0')}`,
        fullName: formData.fullName || '',
        fatherName: formData.fatherName || '',
        cnicOrId: formData.cnicOrId || '',
        mobile: formData.mobile || '',
        village: formData.village || '',
        unionCouncil: formData.unionCouncil || 'UC-01',
        tehsil: formData.tehsil || 'Central',
        district: formData.district || 'Ludhiana',
        totalLandAcres: Number(formData.totalLandAcres) || 0,
        wheatAcreage: Number(formData.wheatAcreage) || 0,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
        bankAccountTitle: formData.bankAccountTitle || formData.fullName,
        status: (formData.status as any) || 'ACTIVE',
        createdDate: new Date().toISOString().split('T')[0],
        ratingScore: 4.5,
      };
      dispatch(addFarmer(newFarmer));
      toast.success(`Farmer ${formData.fullName} registered successfully!`);
    }
    setAddModalOpen(false);
  };

  const handleDeleteFarmer = () => {
    if (farmerToDeleteId) {
      dispatch(deleteFarmer(farmerToDeleteId));
      toast.success('Farmer record deleted from database');
      setFarmerToDeleteId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Farmer Code', 'Full Name', 'CNIC', 'Mobile', 'Village', 'District', 'Wheat Acreage', 'Status'];
    const rows = filteredFarmers.map(f => [
      f.farmerCode,
      f.fullName,
      f.cnicOrId,
      f.mobile,
      f.village,
      f.district,
      f.wheatAcreage,
      f.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
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
        description="Official wheat growers database: CNIC verification, digital passbook allocations, and land ownership records."
        actionButton={{
          label: 'Register Farmer',
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
        onSearchChange={(q) => dispatch(setFarmerSearchQuery(q))}
        searchPlaceholder="Search by farmer name, CNIC, village, or ID..."
        filters={[
          {
            id: 'district',
            placeholder: 'All Districts',
            value: districtFilter,
            onChange: (v) => dispatch(setFarmerDistrictFilter(v)),
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
            onChange: (v) => dispatch(setFarmerStatusFilter(v)),
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Pending Verification', value: 'PENDING_VERIFICATION' },
              { label: 'Flagged', value: 'FLAGGED' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setFarmerSearchQuery(''));
          dispatch(setFarmerDistrictFilter('ALL'));
          dispatch(setFarmerStatusFilter('ALL'));
        }}
      />

      {/* Farmers Table */}
      {filteredFarmers.length === 0 ? (
        <EmptyState
          title="No Farmers Found"
          description="No farmer records match the current search or filter criteria. Try resetting filters or adding a new farmer."
          action={{
            label: 'Register New Farmer',
            onClick: handleOpenAddModal,
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
                <TableHead className="font-bold">Farmer Code / Name</TableHead>
                <TableHead className="font-bold">CNIC & Contact</TableHead>
                <TableHead className="font-bold">Location (Village / District)</TableHead>
                <TableHead className="font-bold text-right">Wheat Acreage</TableHead>
                <TableHead className="font-bold text-center">Score</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="w-12 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.map((farmer) => (
                <TableRow key={farmer.id} className="hover:bg-muted/30 text-xs">
                  <TableCell>
                    <div className="font-semibold text-foreground">{farmer.fullName}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {farmer.farmerCode} &bull; s/o {farmer.fatherName}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-mono text-[11px]">{farmer.cnicOrId}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {farmer.mobile}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground">{farmer.village}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {farmer.tehsil}, {farmer.district}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-bold text-foreground">{farmer.wheatAcreage} Ac</span>
                    <span className="text-[11px] text-muted-foreground block">
                      of {farmer.totalLandAcres} total
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full text-[11px]">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {farmer.ratingScore?.toFixed(1) || '4.5'}
                    </div>
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
                          View Full Dossier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenEditModal(farmer)}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-amber-500" />
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setFarmerToDeleteId(farmer.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Record
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
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingFarmer ? 'Edit Farmer Profile' : 'Enroll New Wheat Farmer'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete farmer registry form with CNIC verification, acreage details, and bank subsidy account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveFarmer} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Farmer Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Chaudhry Bashir Ahmed"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Father Name *</Label>
                <Input
                  required
                  placeholder="e.g. Haji Ghulam Rasool"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">CNIC / National ID *</Label>
                <Input
                  required
                  placeholder="33100-1284918-1"
                  value={formData.cnicOrId}
                  onChange={(e) => setFormData({ ...formData, cnicOrId: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input
                  required
                  placeholder="+92 302 9876543"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Village / Chak</Label>
                <Input
                  placeholder="e.g. Chak 54-RB"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tehsil</Label>
                <Input
                  placeholder="e.g. Chak Jhumra"
                  value={formData.tehsil}
                  onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">District</Label>
                <Select
                  value={formData.district || 'Ludhiana'}
                  onValueChange={(v) => {
                    if (v !== null) setFormData({ ...formData, district: v });
                  }}
                >
                  <SelectTrigger className="w-full">
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Total Holding Land (Acres)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.totalLandAcres}
                  onChange={(e) => setFormData({ ...formData, totalLandAcres: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Allocated Wheat Acreage (Acres) *</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.wheatAcreage}
                  onChange={(e) => setFormData({ ...formData, wheatAcreage: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg">
              <div className="space-y-1.5">
                <Label className="text-xs">Bank Name</Label>
                <Input
                  placeholder="State Bank of India / HDFC"
                  value={formData.bankName || ''}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Bank IFSC & Account Number</Label>
                <Input
                  placeholder="SBIN0001234 - 987654321012"
                  value={formData.bankAccountNumber || ''}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Enrollment Status</Label>
              <Select
                value={formData.status || 'ACTIVE'}
                onValueChange={(v) => {
                  if (v !== null) setFormData({ ...formData, status: v as any });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE (Approved & Verified)</SelectItem>
                  <SelectItem value="PENDING_VERIFICATION">PENDING_VERIFICATION</SelectItem>
                  <SelectItem value="FLAGGED">FLAGGED</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold">
                {editingFarmer ? 'Save Changes' : 'Enroll Farmer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Farmer Dossier Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-6">
          {selectedFarmer && (
            <>
              <SheetHeader className="space-y-2 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs">
                    {selectedFarmer.farmerCode}
                  </Badge>
                  <StatusBadge status={selectedFarmer.status} />
                </div>
                <SheetTitle className="text-xl font-bold">{selectedFarmer.fullName}</SheetTitle>
                <SheetDescription className="text-xs">
                  Father Name: {selectedFarmer.fatherName} &bull; Registered on {selectedFarmer.createdDate}
                </SheetDescription>
              </SheetHeader>

              {/* Dossier Quick Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-muted/60 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Wheat Acreage</p>
                  <p className="text-lg font-bold text-primary">{selectedFarmer.wheatAcreage} Ac</p>
                </div>
                <div className="p-3 bg-muted/60 rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Land</p>
                  <p className="text-lg font-bold text-foreground">{selectedFarmer.totalLandAcres} Ac</p>
                </div>
                <div className="p-3 bg-muted/60 rounded-md">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Compliance</p>
                  <p className="text-lg font-bold text-amber-600">{selectedFarmer.ratingScore?.toFixed(1) || '4.8'} / 5</p>
                </div>
              </div>

              {/* Contact & Banking Info */}
              <div className="space-y-3 p-4 border rounded-lg bg-card">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Identification & Banking
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">CNIC:</span>
                    <span className="font-mono font-semibold">{selectedFarmer.cnicOrId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mobile:</span>
                    <span className="font-semibold">{selectedFarmer.mobile}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Bank Name:</span>
                    <span className="font-semibold">{selectedFarmer.bankName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">IBAN / Account:</span>
                    <span className="font-mono text-[11px] truncate block">{selectedFarmer.bankAccountNumber || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Location:</span>
                    <span>{selectedFarmer.village}, {selectedFarmer.unionCouncil}, {selectedFarmer.tehsil}, {selectedFarmer.district}</span>
                  </div>
                </div>
              </div>

              {/* Connected Land Parcels */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <LandPlot className="h-4 w-4 text-primary" />
                  Assigned Land Parcels
                </h4>
                <div className="space-y-2">
                  {parcels.filter(p => p.farmerId === selectedFarmer.id).map(parcel => (
                    <div key={parcel.id} className="p-3 border rounded-xl bg-card flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold">{parcel.parcelCode} ({parcel.totalAcreage} Acres)</p>
                        <p className="text-[11px] text-muted-foreground">{parcel.titleDeedOrKhasraNo} &bull; {parcel.soilType.replace(/_/g, ' ')}</p>
                      </div>
                      <StatusBadge status={parcel.verificationStatus} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Seed Allocation Passbook */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  Seed Distribution Passbook
                </h4>
                <div className="space-y-2">
                  {distributions.filter(d => d.farmerId === selectedFarmer.id).map(dist => (
                    <div key={dist.id} className="p-3 border rounded-xl bg-card flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold">{dist.seedVariety} ({dist.quantityBags} Bags / {dist.totalWeightKg}kg)</p>
                        <p className="text-[11px] text-muted-foreground font-mono">Lot: {dist.lotNumber} &bull; Distributed: {dist.distributionDate}</p>
                      </div>
                      <StatusBadge status={dist.paymentStatus} />
                    </div>
                  ))}
                </div>
              </div>

              {selectedFarmer.notes && (
                <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-foreground">Agronomic Notes:</span>
                  <p className="text-muted-foreground">{selectedFarmer.notes}</p>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Farmer Record?"
        description="Are you sure you want to delete this farmer? This action will remove their profile and associated passbook records."
        confirmLabel="Delete Farmer"
        variant="destructive"
        onConfirm={handleDeleteFarmer}
      />
    </div>
  );
}
