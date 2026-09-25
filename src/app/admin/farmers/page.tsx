'use client';

import React, { useState, useMemo } from 'react';
import {
  useGetFarmersQuery,
  useCreateFarmerMutation,
  useUpdateFarmerMutation,
  useResetFarmerCredentialsMutation,
  Farmer as ApiFarmer,
} from '@/store/api/farmerApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Download,
  Users,
  Phone,
  MapPin,
  RefreshCw,
  FileSpreadsheet,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  Sparkles,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const farmerSchema = z.object({
  name: z.string().min(2, 'Farmer name must be at least 2 characters'),
  mobile_number: z.string().min(10, 'Mobile number must be at least 10 digits'),
  village: z.string().min(2, 'Village name is mandatory'),
  block: z.string().optional(),
  district: z.string().min(2, 'District is mandatory'),
  state: z.string().min(2, 'State is mandatory'),
  address: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION']),
});

type FarmerFormValues = z.infer<typeof farmerSchema>;

import {
  getAllStateOptions,
  getDistrictsForState,
  getAllDistrictOptions,
} from '@/data/indiaStatesDistricts';

const STATE_OPTIONS = getAllStateOptions();
const ALL_DISTRICT_OPTIONS = getAllDistrictOptions();

export default function FarmersPage() {
  const { data: rawFarmers = [], isLoading, refetch } = useGetFarmersQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const [createFarmer, { isLoading: isCreating }] = useCreateFarmerMutation();
  const [updateFarmer, { isLoading: isUpdating }] = useUpdateFarmerMutation();
  const [resetFarmerCredentials, { isLoading: isResettingCreds }] = useResetFarmerCredentialsMutation();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination & View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Detail Sheet State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<ApiFarmer | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<ApiFarmer | null>(null);

  // Reset Credentials Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [farmerToReset, setFarmerToReset] = useState<ApiFarmer | null>(null);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Credentials Generated / Updated Modal
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{
    userId: string;
    pass: string;
    name: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FarmerFormValues>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: '',
      mobile_number: '',
      village: '',
      block: '',
      district: 'Karnal',
      state: 'Haryana',
      address: '',
      status: 'ACTIVE',
    },
  });

  const selectedState = watch('state');
  const selectedDistrict = watch('district');
  const selectedStatus = watch('status');

  const formDistrictOptions = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  const filterDistrictOptions = useMemo(() => {
    const presentDistricts = Array.from(new Set(rawFarmers.map((f) => f.district).filter(Boolean)));
    const uniqueDistricts = Array.from(
      new Set([...presentDistricts, ...ALL_DISTRICT_OPTIONS.map((d) => d.value)])
    );
    return [
      { label: 'All Districts', value: 'ALL' },
      ...uniqueDistricts.map((dist) => {
        const found = ALL_DISTRICT_OPTIONS.find((d) => d.value === dist);
        return {
          label: found ? `${dist} (${found.subLabel})` : dist,
          value: dist,
        };
      }),
    ];
  }, [rawFarmers]);

  // Filter Farmers
  const filteredFarmers = rawFarmers.filter((farmer) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      farmer.name.toLowerCase().includes(q) ||
      farmer.mobile_number.includes(q) ||
      farmer.village.toLowerCase().includes(q) ||
      farmer.district.toLowerCase().includes(q);

    const matchesDistrict = districtFilter === 'ALL' || farmer.district === districtFilter;
    const matchesStatus = statusFilter === 'ALL' || farmer.status === statusFilter;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  // Paginated Slicing
  const totalItems = filteredFarmers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedFarmers = filteredFarmers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setEditingFarmer(null);
    reset({
      name: '',
      mobile_number: '',
      village: '',
      block: '',
      district: 'Karnal',
      state: 'Haryana',
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

  const onInvalid = (errors: any) => {
    const errorMessages = Object.values(errors)
      .map((err: any) => err?.message)
      .filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(`Mandatory field required: ${errorMessages[0]}`);
    } else {
      toast.error('Please fill all mandatory fields marked with *');
    }
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
        const res = await createFarmer(values).unwrap();
        
        // Auto-generate Farmer Login Credentials
        const tempPassword = `Kisan@${Math.floor(1000 + Math.random() * 9000)}`;
        const credRecord = {
          userId: values.mobile_number,
          pass: tempPassword,
          name: values.name,
          village: values.village,
        };

        // Persist to local farmer credentials for login authentication
        try {
          const existing = JSON.parse(localStorage.getItem('registered_farmer_credentials') || '[]');
          existing.push(credRecord);
          localStorage.setItem('registered_farmer_credentials', JSON.stringify(existing));
        } catch (e) {
          console.error(e);
        }

        setGeneratedCreds(credRecord);
        setCredentialsModalOpen(true);
        toast.success(`Farmer "${values.name}" enrolled successfully with login credentials!`);
      }
      setIsModalOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to save farmer profile. Please try again.');
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenResetModal = (farmer: ApiFarmer) => {
    setFarmerToReset(farmer);
    setNewUserId(farmer.mobile_number);
    setNewPassword(`Kisan@${Math.floor(1000 + Math.random() * 9000)}`);
    setConfirmPassword('');
    setShowNewPassword(false);
    setResetModalOpen(true);
  };

  const handleGenerateRandomPassword = () => {
    const randomPass = `Kisan@${Math.floor(1000 + Math.random() * 9000)}`;
    setNewPassword(randomPass);
    setConfirmPassword(randomPass);
    toast.success('Generated new secure password!');
  };

  const handleSaveResetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerToReset) return;

    if (!newUserId.trim()) {
      toast.error('User ID / Mobile Number cannot be blank.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (confirmPassword && confirmPassword !== newPassword) {
      toast.error('Passwords do not match. Please verify.');
      return;
    }

    try {
      await resetFarmerCredentials({
        id: farmerToReset.id,
        data: {
          new_user_id: newUserId.trim(),
          new_password: newPassword.trim(),
        },
      }).unwrap();

      // Sync localStorage credentials for immediate login
      try {
        const existing = JSON.parse(localStorage.getItem('registered_farmer_credentials') || '[]');
        const filtered = existing.filter(
          (c: any) =>
            c.userId !== farmerToReset.mobile_number &&
            c.userId !== newUserId.trim()
        );
        filtered.push({
          userId: newUserId.trim(),
          pass: newPassword.trim(),
          name: farmerToReset.name,
          village: farmerToReset.village,
        });
        localStorage.setItem('registered_farmer_credentials', JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }

      setResetModalOpen(false);
      setGeneratedCreds({
        userId: newUserId.trim(),
        pass: newPassword.trim(),
        name: farmerToReset.name,
      });
      setCredentialsModalOpen(true);

      toast.success(`Login credentials for "${farmerToReset.name}" updated successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to update credentials. Please try again.');
    }
  };

  const handleCopyWhatsAppShare = (farmerName: string, userId: string, pass: string) => {
    const text = `🌾 *Krishi AgriTech - Farmer Login Account*\n\n` +
      `👤 *Farmer Name:* ${farmerName}\n` +
      `📱 *Login User ID / Mobile:* ${userId}\n` +
      `🔑 *Password:* ${pass}\n` +
      `🌐 *Login Portal:* http://localhost:3000/login\n\n` +
      `_Please keep this password secure._`;
    navigator.clipboard.writeText(text);
    setCopiedKey('share');
    toast.success('Formatted credentials copied! Ready to paste into WhatsApp / SMS.');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleExportCSV = () => {
    if (rawFarmers.length === 0) {
      toast.error('No farmer records to export');
      return;
    }
    const headers = ['Farmer Name', 'Mobile', 'Village', 'Block', 'District', 'State', 'Status', 'Registered Date'];
    const rows = rawFarmers.map((f) => [
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
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by farmer name, mobile, village..."
        filters={[
          {
            id: 'district',
            placeholder: 'All Districts',
            value: districtFilter,
            onChange: (v) => {
              setDistrictFilter(v);
              setCurrentPage(1);
            },
            options: filterDistrictOptions,
          },
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
              { label: 'Pending Verification', value: 'PENDING_VERIFICATION' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setDistrictFilter('ALL');
          setStatusFilter('ALL');
          setCurrentPage(1);
        }}
      />

      {/* Main Content Area */}
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
      ) : filteredFarmers.length === 0 ? (
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
          {viewMode === 'table' ? (
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
                {paginatedFarmers.map((farmer) => (
                  <TableRow key={farmer.id} className="hover:bg-muted/30 transition-colors text-xs">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                          {farmer.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-foreground block">{farmer.name}</span>
                          <span className="text-[11px] text-muted-foreground block">
                            {farmer.village} &bull; {farmer.district}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{farmer.mobile_number}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {farmer.village}, {farmer.district} ({farmer.state})
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground">
                        {farmer.registration_date}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={farmer.status} />
                    </TableCell>

                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedFarmer(farmer);
                              setDetailSheetOpen(true);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 text-primary" />
                            View Full Dossier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenResetModal(farmer)}
                            className="gap-2 cursor-pointer text-blue-600 focus:text-blue-700"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-blue-600" />
                            Reset Login & Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditModal(farmer)}
                            className="gap-2 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-amber-600" />
                            Edit Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Card Grid View */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedFarmers.map((farmer) => (
                <Card key={farmer.id} className="border hover:border-primary/40 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                          {farmer.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{farmer.name}</h4>
                          <p className="text-[11px] text-muted-foreground">{farmer.village}, {farmer.district}</p>
                        </div>
                      </div>
                      <StatusBadge status={farmer.status} />
                    </div>

                    <div className="space-y-1 pt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        <span className="font-mono">{farmer.mobile_number}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                        <span>State: {farmer.state}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFarmer(farmer);
                          setDetailSheetOpen(true);
                        }}
                        className="h-7 text-xs gap-1 px-2"
                      >
                        <Eye className="h-3 w-3" />
                        Dossier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenResetModal(farmer)}
                        className="h-7 text-xs gap-1 px-2 text-blue-600 hover:text-blue-700 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
                        title="Reset User ID & Password"
                      >
                        <KeyRound className="h-3 w-3" />
                        Reset Login
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(farmer)}
                        className="h-7 text-xs gap-1 px-2 text-amber-600 hover:text-amber-700"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
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

      {/* Auto-Generated / Updated Login Credentials Modal */}
      <Dialog open={credentialsModalOpen} onOpenChange={setCredentialsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 mx-auto flex items-center justify-center shadow-xs border border-emerald-500/30">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold">Farmer Login Account Ready</DialogTitle>
            <DialogDescription className="text-xs">
              Hand over or send these secure login credentials to <strong>{generatedCreds?.name}</strong> to access their mobile Kisan Passbook.
            </DialogDescription>
          </DialogHeader>

          {generatedCreds && (
            <div className="space-y-3.5 py-2">
              <div className="p-3.5 bg-muted/60 rounded-xl border border-border/70 space-y-3 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-1">Farmer User ID / Login Mobile:</span>
                  <div className="flex items-center justify-between bg-background p-2 rounded-lg border font-mono font-bold text-foreground">
                    <span>{generatedCreds.userId}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generatedCreds.userId, 'user')}
                      className="h-6 px-2 text-xs"
                      title="Copy User ID"
                    >
                      {copiedKey === 'user' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-muted-foreground block mb-1">Password:</span>
                  <div className="flex items-center justify-between bg-background p-2 rounded-lg border font-mono font-bold text-emerald-600">
                    <span>{generatedCreds.pass}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(generatedCreds.pass, 'pass')}
                      className="h-6 px-2 text-xs"
                      title="Copy Password"
                    >
                      {copiedKey === 'pass' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* One-Click Share WhatsApp Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCopyWhatsAppShare(generatedCreds.name, generatedCreds.userId, generatedCreds.pass)}
                className="w-full text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                {copiedKey === 'share' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Formatted Text Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Copy All Details (WhatsApp / SMS Format)</span>
                  </>
                )}
              </Button>

              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" />
                  Direct Mobile & Portal Login Active
                </p>
                <p className="text-[11px] leading-relaxed">
                  The farmer can now visit <strong>http://localhost:3000/login</strong>, enter this User ID and password, and instantly access their digital slip book & farm planner.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              className="w-full font-semibold"
              onClick={() => setCredentialsModalOpen(false)}
            >
              Done & Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RESET FARMER CREDENTIALS & PASSWORD MODAL */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 mb-1">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Reset Farmer Login & Password
            </DialogTitle>
            <DialogDescription className="text-xs">
              Change the Login User ID (Mobile) and set a new password for <strong>{farmerToReset?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {farmerToReset && (
            <form onSubmit={handleSaveResetCredentials} className="space-y-4 pt-1">
              {/* Farmer Info Strip */}
              <div className="p-3 bg-muted/50 rounded-xl border border-border/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Selected Farmer</span>
                  <span className="font-bold text-foreground text-sm">{farmerToReset.name}</span>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono bg-background">
                  {farmerToReset.village}, {farmerToReset.district}
                </Badge>
              </div>

              {/* Login User ID / Mobile Number */}
              <div className="space-y-1.5">
                <Label htmlFor="reset_user_id" className="text-xs font-semibold flex items-center justify-between">
                  <span>Farmer Login User ID (Mobile / Username) *</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Used to log in</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset_user_id"
                    type="text"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                    placeholder="e.g., 9876543210"
                    className="pl-9 h-9 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reset_password" className="text-xs font-semibold">
                    New Password *
                  </Label>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Auto-Generate Password
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset_password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="pl-9 pr-9 h-9 text-xs font-mono font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-semibold">
                  Confirm Password (Optional)
                </Label>
                <Input
                  id="confirm_password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password to match"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg text-xs text-blue-800 dark:text-blue-300">
                <p className="text-[11px] leading-relaxed">
                  💡 After saving, you can copy the login details to instantly send to the farmer via WhatsApp or SMS.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResetModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isResettingCreds}
                  className="font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                >
                  {isResettingCreds ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-3.5 w-3.5" />
                      Save & Update Credentials
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Farmer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingFarmer ? `Edit Farmer: ${editingFarmer.name}` : 'Enroll New Wheat Farmer'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fill in farmer KYC and residential location.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-3.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Farmer Full Name *</Label>
                <Input
                  placeholder="e.g., Ramesh Patel"
                  {...register('name')}
                  className="text-xs"
                />
                {errors.name && <p className="text-[10px] text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mobile Number *</Label>
                <Input
                  placeholder="e.g., 9876543210"
                  {...register('mobile_number')}
                  className="text-xs"
                />
                {errors.mobile_number && <p className="text-[10px] text-destructive">{errors.mobile_number.message}</p>}
              </div>
            </div>

            {/* Places Geocoding Search */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Auto-Locate Village / District (Places API)</span>
                <span className="text-[10px] text-emerald-600 font-normal">Auto-Fills Form</span>
              </Label>
              <AddressAutocomplete
                value=""
                onChange={() => {}}
                onSelectPlace={(place) => {
                  if (place.village) setValue('village', place.village);
                  if (place.district) setValue('district', place.district);
                  if (place.state) setValue('state', place.state);
                  if (place.address) setValue('address', place.address);
                }}
                placeholder="Type village, town, or city to auto-fill..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Village *</Label>
                <Input
                  placeholder="e.g., Rampur / Samrala"
                  {...register('village')}
                  className="text-xs"
                />
                {errors.village && <p className="text-[10px] text-destructive">{errors.village.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Tehsil / Block</Label>
                <Input
                  placeholder="e.g., Samrala Block"
                  {...register('block')}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">State *</Label>
                <SearchableSelect
                  options={STATE_OPTIONS}
                  value={selectedState}
                  onChange={(val) => {
                    setValue('state', val, { shouldValidate: true });
                    const validDistricts = getDistrictsForState(val);
                    if (!validDistricts.some((d) => d.value === selectedDistrict)) {
                      setValue('district', validDistricts[0]?.value || '', { shouldValidate: true });
                    }
                  }}
                  placeholder="Select State"
                  searchPlaceholder="Search Indian state / UT..."
                />
                {errors.state && <p className="text-[10px] text-destructive">{errors.state.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">District *</Label>
                <SearchableSelect
                  options={formDistrictOptions}
                  value={selectedDistrict}
                  onChange={(val) => {
                    setValue('district', val, { shouldValidate: true });
                    const found = ALL_DISTRICT_OPTIONS.find((d) => d.value === val);
                    if (found && (!selectedState || selectedState !== found.state)) {
                      setValue('state', found.state, { shouldValidate: true });
                    }
                  }}
                  placeholder="Select District"
                  searchPlaceholder="Search district..."
                />
                {errors.district && <p className="text-[10px] text-destructive">{errors.district.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Physical Address / Landmark</Label>
              <Input
                placeholder="e.g., Near Primary School, Main Road"
                {...register('address')}
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreating || isUpdating} className="font-semibold">
                {isCreating || isUpdating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Enrolling...
                  </>
                ) : editingFarmer ? (
                  'Save Profile Changes'
                ) : (
                  'Enroll Farmer & Generate Login'
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
                  <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
                    Verified Wheat Grower
                  </Badge>
                  <StatusBadge status={selectedFarmer.status} />
                </div>
                <SheetTitle className="text-xl font-bold">{selectedFarmer.name}</SheetTitle>
                <SheetDescription className="text-xs">
                  Registered on {selectedFarmer.registration_date}
                </SheetDescription>
              </SheetHeader>

              {/* Login Credentials Action Box in Dossier */}
              <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <KeyRound className="h-4 w-4 text-blue-600" />
                    Farmer Login Access
                  </h5>
                  <Badge variant="outline" className="text-[10px] bg-background font-mono">
                    User ID: {selectedFarmer.mobile_number}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Reset password or change login User ID to grant the farmer access to their Kisan Passbook.
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setDetailSheetOpen(false);
                    handleOpenResetModal(selectedFarmer);
                  }}
                  className="w-full h-8 text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset / Change Login Credentials
                </Button>
              </div>

              {/* Identification & Contact */}
              <div className="space-y-3 p-4 border rounded-lg bg-card text-xs">
                <h4 className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Farmer Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mobile Number:</span>
                    <span className="font-semibold font-mono">{selectedFarmer.mobile_number}</span>
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
