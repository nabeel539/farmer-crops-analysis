'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetFieldsQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldMutation,
  useDeleteFieldPolygonMutation,
  Field as ApiField,
} from '@/store/api/fieldApi';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import AddressAutocomplete from '@/components/shared/AddressAutocomplete';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Plus,
  LandPlot,
  CheckCircle2,
  LocateFixed,
  RefreshCw,
  AlertCircle,
  Trash2,
  Pencil,
  Palette,
  Maximize2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { DynamicLocationPickerMap } from '@/components/map/DynamicLocationPickerMap';
import { calculateDefaultPolygonPoints } from '@/lib/gisUtils';
import { MOCK_LAND_PARCELS, MOCK_FARMERS } from '@/data/mockData';

const fieldFormSchema = z.object({
  farmer_id: z.string().min(1, 'Please select a registered farmer'),
  field_name: z.string().min(2, 'Field name must be at least 2 characters'),
  village: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  area: z.number().positive('Area must be greater than 0'),
  crop: z.string().min(1, 'Crop type is required'),
  season: z.string().optional().or(z.literal('')),
  polygon_color: z.string().min(1, 'Color is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'HARVESTED']),
});

type FieldFormValues = z.infer<typeof fieldFormSchema>;



export default function LandParcelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Pagination & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Redux GIS polygon configurations from Admin Settings
  const gisSettings = useAppSelector((state) => state.ui.gisSettings);
  const defaultPoints = (gisSettings?.defaultPointsCount || 4) as 4 | 6 | 8;

  // GPS Coordinates & Polygon Points state for Register
  const [lat, setLat] = useState(30.901);
  const [lng, setLng] = useState(75.8573);
  const [addPointsCount, setAddPointsCount] = useState<4 | 6 | 8>(defaultPoints);
  const [addCustomPolygon, setAddCustomPolygon] = useState<[number, number][] | undefined>(undefined);
  const [selectedHexColor, setSelectedHexColor] = useState('#10b981');

  // Edit Field & Polygon Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<ApiField | null>(null);
  const [editLat, setEditLat] = useState(30.901);
  const [editLng, setEditLng] = useState(75.8573);
  const [editPointsCount, setEditPointsCount] = useState<4 | 6 | 8>(defaultPoints);
  const [editFieldName, setEditFieldName] = useState('');
  const [editFarmerId, setEditFarmerId] = useState('');
  const [editArea, setEditArea] = useState(5.0);
  const [editCrop, setEditCrop] = useState('Wheat');
  const [editSeason, setEditSeason] = useState('Rabi 2026-27');
  const [editColor, setEditColor] = useState('#10b981');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE' | 'HARVESTED'>('ACTIVE');
  const [editVillage, setEditVillage] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editCustomPolygon, setEditCustomPolygon] = useState<[number, number][] | undefined>(undefined);

  // Sync with defaultPoints if changed in settings
  useEffect(() => {
    setAddPointsCount(defaultPoints);
  }, [defaultPoints]);

  // RTK Query hooks
  const { data: apiFields = [], isLoading, isError, error, refetch } = useGetFieldsQuery();
  const { data: apiFarmers = [] } = useGetFarmersQuery();
  const [createField, { isLoading: isCreating }] = useCreateFieldMutation();
  const [updateField, { isLoading: isUpdating }] = useUpdateFieldMutation();
  const [deleteField, { isLoading: isDeleting }] = useDeleteFieldMutation();
  const [deleteFieldPolygon] = useDeleteFieldPolygonMutation();

  const baseFarmers =
    apiFarmers.length > 0
      ? apiFarmers
      : MOCK_FARMERS.map((f) => ({
          id: f.id,
          name: f.fullName,
          mobile_number: f.mobile,
          address: f.village,
          village: f.village,
          block: f.tehsil || '',
          district: f.district,
          state: 'Haryana',
          status: 'ACTIVE' as const,
          registration_date: f.createdDate,
          created_at: f.createdDate,
          updated_at: f.createdDate,
        }));

  const farmers = React.useMemo(() => {
    const list = [...baseFarmers];
    if (!list.some((f) => f.name.includes('Ramesh') || f.name.includes('Patel'))) {
      list.unshift({
        id: 'farmer-ramesh-patel-001',
        name: 'Ramesh Patel',
        mobile_number: '9812345678',
        address: 'Rampur Village, Karnal',
        village: 'Rampur',
        block: 'Karnal',
        district: 'Karnal',
        state: 'Haryana',
        status: 'ACTIVE' as const,
        registration_date: '2025-10-15',
        created_at: '2025-10-15',
        updated_at: '2025-10-15',
      });
    }
    return list;
  }, [baseFarmers]);

  const fields = React.useMemo(() => {
    return apiFields.map((f) => {
      const owner = farmers.find((fm) => fm.id === f.farmer_id);
      return {
        ...f,
        village: f.village || owner?.village || 'Rampur',
        district: f.district || owner?.district || 'Karnal',
      };
    });
  }, [apiFields, farmers]);

  const totalAcreage = fields.reduce((sum, f) => sum + (f.area || 0), 0);
  const polygonMappedCount = fields.filter((f) => !!f.polygon?.coordinates?.length).length;

  const filteredFields = fields.filter((f) => {
    const matchesSearch =
      searchQuery === '' ||
      f.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.village && f.village.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.district && f.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.crop && f.crop.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Slicing
  const totalItems = filteredFields.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedFields = filteredFields.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      farmer_id: farmers[0]?.id || '',
      field_name: '',
      village: '',
      district: 'Ludhiana',
      area: 5.0,
      crop: 'Wheat',
      season: 'Rabi 2026-27',
      polygon_color: '#10b981',
      status: 'ACTIVE',
    },
  });

  const selectedFarmerId = watch('farmer_id');
  const selectedCrop = watch('crop');
  const selectedStatus = watch('status');
  const currentArea = watch('area') || 5.0;

  const handleDetectLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      toast.info('Detecting current GPS position...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const detectedLat = parseFloat(position.coords.latitude.toFixed(4));
          const detectedLng = parseFloat(position.coords.longitude.toFixed(4));
          setLat(detectedLat);
          setLng(detectedLng);
          toast.success(`GPS Detected: ${detectedLat}, ${detectedLng}`);
        },
        (err) => {
          toast.error(`Location access denied (${err.message}). Enter coordinates manually.`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
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

  const onSubmit = async (values: FieldFormValues) => {
    try {
      let polyCoords: number[][];
      if (addCustomPolygon && addCustomPolygon.length >= 3) {
        polyCoords = addCustomPolygon.map((pt) => [
          parseFloat(pt[1].toFixed(5)),
          parseFloat(pt[0].toFixed(5)),
        ]);
        polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
      } else {
        const generatedPts = calculateDefaultPolygonPoints(lat, lng, values.area, addPointsCount);
        polyCoords = generatedPts.map((pt) => [
          parseFloat(pt[1].toFixed(5)),
          parseFloat(pt[0].toFixed(5)),
        ]);
        polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
      }

      const polygon = {
        type: 'Polygon' as const,
        coordinates: [polyCoords],
      };

      await createField({
        farmer_id: values.farmer_id,
        field_name: values.field_name,
        village: values.village,
        district: values.district,
        area: values.area,
        crop: values.crop,
        season: values.season,
        latitude: lat,
        longitude: lng,
        polygon: polygon,
        polygon_color: values.polygon_color as any,
        status: values.status,
      }).unwrap();

      toast.success(`Field "${values.field_name}" registered with ${addPointsCount}-point GPS polygon!`);
      setAddModalOpen(false);
      setAddCustomPolygon(undefined);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to register land parcel');
    }
  };

  const handleDeleteField = async (fieldId: string, fieldName: string) => {
    if (confirm(`Are you sure you want to delete field plot "${fieldName}"?`)) {
      try {
        await deleteField(fieldId).unwrap();
        toast.success(`Field plot "${fieldName}" deleted successfully`);
      } catch (err: any) {
        toast.error(err?.data?.detail || 'Failed to delete field plot');
      }
    }
  };

  const handleDeletePolygon = async (fieldId: string) => {
    try {
      await deleteFieldPolygon(fieldId).unwrap();
      toast.success('Field polygon detached');
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to remove polygon');
    }
  };

  const handleOpenEditModal = (field: ApiField) => {
    setEditingField(field);
    setEditFieldName(field.field_name);
    setEditFarmerId(field.farmer_id);
    setEditArea(field.area || 5.0);
    setEditCrop(field.crop || 'Wheat');
    setEditSeason(field.season || 'Rabi 2026-27');
    setEditColor(field.polygon_color || '#10b981');
    setEditStatus(field.status || 'ACTIVE');
    setEditVillage(field.village || '');
    setEditDistrict(field.district || 'Karnal');
    const fieldLat = field.latitude || 29.6857;
    const fieldLng = field.longitude || 76.9905;
    setEditLat(fieldLat);
    setEditLng(fieldLng);

    if (field.polygon?.coordinates?.[0] && field.polygon.coordinates[0].length >= 3) {
      const ring = field.polygon.coordinates[0];
      const isClosed =
        ring.length > 3 &&
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1];
      const uniqueRing = isClosed ? ring.slice(0, ring.length - 1) : ring;
      const pts: [number, number][] = uniqueRing.map((p) => [p[1], p[0]]);
      setEditCustomPolygon(pts);
      if (pts.length === 8) {
        setEditPointsCount(8);
      } else if (pts.length === 6) {
        setEditPointsCount(6);
      } else {
        setEditPointsCount(4);
      }
    } else {
      setEditCustomPolygon(undefined);
      setEditPointsCount((gisSettings?.defaultPointsCount || 4) as 4 | 6 | 8);
    }
    setEditModalOpen(true);
  };

  const handleUpdateFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;

    if (!editFieldName || editFieldName.trim().length < 2) {
      toast.error('Mandatory field required: Field name must be at least 2 characters');
      return;
    }

    try {
      let polyCoords: number[][];
      if (editCustomPolygon && editCustomPolygon.length >= 3) {
        polyCoords = editCustomPolygon.map((pt) => [
          parseFloat(pt[1].toFixed(5)),
          parseFloat(pt[0].toFixed(5)),
        ]);
        polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
      } else {
        const generatedPts = calculateDefaultPolygonPoints(
          editLat,
          editLng,
          editArea,
          editPointsCount
        );
        polyCoords = generatedPts.map((pt) => [
          parseFloat(pt[1].toFixed(5)),
          parseFloat(pt[0].toFixed(5)),
        ]);
        polyCoords.push([polyCoords[0][0], polyCoords[0][1]]);
      }

      const polygon = {
        type: 'Polygon' as const,
        coordinates: [polyCoords],
      };

      await updateField({
        id: editingField.id,
        data: {
          field_name: editFieldName,
          farmer_id: editFarmerId,
          area: editArea,
          crop: editCrop,
          season: editSeason,
          polygon_color: editColor as any,
          status: editStatus,
          village: editVillage,
          district: editDistrict,
          latitude: editLat,
          longitude: editLng,
          polygon: polygon,
        },
      }).unwrap();

      toast.success(`Field "${editFieldName}" updated successfully with ${editPointsCount}-point GPS polygon!`);
      setEditModalOpen(false);
      setEditingField(null);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to update field');
    }
  };

  const farmerOptions = farmers.map((f) => ({
    value: f.id,
    label: f.name,
    subLabel: `${f.village} (${f.district})`,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Land Parcels & Farm Fields"
        description="Register and manage GIS-tagged agricultural land parcels, soil profiles, and GPS polygon boundaries."
        actionButton={{
          label: 'Register Field Plot',
          icon: Plus,
          onClick: () => {
            if (farmers.length > 0 && !selectedFarmerId) {
              setValue('farmer_id', farmers[0].id);
            }
            setAddModalOpen(true);
          },
        }}
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Registered Fields"
          value={fields.length}
          subtitle={`${totalAcreage.toFixed(1)} Total Cultivated Acres`}
          icon={LandPlot}
          variant="primary"
        />
        <MetricCard
          title="GPS Polygon Mapped"
          value={`${polygonMappedCount} / ${fields.length}`}
          subtitle={
            fields.length
              ? `${Math.round((polygonMappedCount / fields.length) * 100)}% Boundary Mapped`
              : '0%'
          }
          icon={CheckCircle2}
        />
        <MetricCard
          title="Active Rabi Wheat Season"
          value="Rabi 2026-27"
          subtitle="Target Moisture: 11.2%"
          icon={MapPin}
        />
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by field name, village, district, or crop..."
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
              { label: 'Harvested', value: 'HARVESTED' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
          setCurrentPage(1);
        }}
      />

      {/* Main Table / Card View Area */}
      {isLoading ? (
        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Fetching field parcels from server...</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredFields.length === 0 ? (
        <EmptyState
          icon={LandPlot}
          title={searchQuery || statusFilter !== 'ALL' ? 'No matching fields found' : 'No field parcels registered'}
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your search criteria.'
              : 'Register your first field plot with GPS coordinates and satellite polygon boundaries.'
          }
          action={{
            label: 'Register First Field',
            onClick: () => {
              if (farmers.length > 0 && !selectedFarmerId) {
                setValue('farmer_id', farmers[0].id);
              }
              setAddModalOpen(true);
            },
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          {viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
                  <TableHead className="font-bold">Field Name & Plot Code</TableHead>
                  <TableHead className="font-bold">Landowner (Farmer)</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold text-right">Area (Acres)</TableHead>
                  <TableHead className="font-bold">Crop & Season</TableHead>
                  <TableHead className="font-bold">GPS Polygon Status</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="w-16 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFields.map((field) => {
                  const owner = farmers.find((f) => f.id === field.farmer_id);
                  const hasPoly = !!field.polygon?.coordinates?.length;
                  const ptsLen = field.polygon?.coordinates?.[0]?.length
                    ? field.polygon.coordinates[0].length - 1
                    : 0;

                  return (
                    <TableRow key={field.id} className="hover:bg-muted/30 transition-colors text-xs">
                      <TableCell>
                        <div className="font-semibold text-foreground">{field.field_name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          Lat: {field.latitude ? field.latitude.toFixed(4) : 'N/A'}, Lng:{' '}
                          {field.longitude ? field.longitude.toFixed(4) : 'N/A'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-foreground">
                          {owner ? owner.name : 'Unknown Farmer'}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {owner ? `${owner.village} • ${owner.mobile_number}` : ''}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-muted-foreground">
                          {field.village}, {field.district}
                        </span>
                      </TableCell>

                      <TableCell className="text-right font-mono font-bold">
                        {field.area ? `${field.area} Ac` : '-'}
                      </TableCell>

                      <TableCell>
                        <span className="font-medium">{field.crop || 'Wheat'}</span>
                        <span className="text-[11px] text-muted-foreground block">
                          {field.season || 'Rabi 2026-27'}
                        </span>
                      </TableCell>

                      <TableCell>
                        {hasPoly ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] gap-1 font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          >
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{
                                backgroundColor: field.polygon_color?.startsWith('#')
                                  ? field.polygon_color
                                  : '#10b981',
                              }}
                            />
                            {ptsLen > 0 ? `${ptsLen}-Pt Polygon` : 'Polygon Mapped'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Point Pin Only
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={field.status} />
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(field)}
                            title="Edit Field Plot & Polygon"
                            className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(field.id, field.field_name)}
                            title="Delete Field Plot"
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            /* Card Grid View */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedFields.map((field) => {
                const owner = farmers.find((f) => f.id === field.farmer_id);
                const hasPoly = !!field.polygon?.coordinates?.length;
                const ptsLen = field.polygon?.coordinates?.[0]?.length
                  ? field.polygon.coordinates[0].length - 1
                  : 0;

                return (
                  <Card key={field.id} className="border hover:border-primary/40 transition-all shadow-xs">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{field.field_name}</h4>
                          <p className="text-[11px] text-muted-foreground">
                            {owner?.name} &bull; {field.village}, {field.district}
                          </p>
                        </div>
                        <StatusBadge status={field.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Area & Crop:</span>
                          <span className="font-bold text-foreground">
                            {field.area} Acres ({field.crop || 'Wheat'})
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">GPS Boundary:</span>
                          <span className="font-semibold text-emerald-600 text-[11px]">
                            {hasPoly ? `${ptsLen}-Pt Polygon` : 'Point Pin'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(field)}
                          className="h-7 text-xs gap-1 text-amber-600"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit Boundary
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(field.id, field.field_name)}
                          className="h-7 text-xs gap-1 text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
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

      {/* REGISTER FIELD PLOT MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Register Field Plot & GPS Boundary</DialogTitle>
            <DialogDescription className="text-xs">
              Link field to farmer and shape polygon boundary with interactive vertex controls.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Farmer Searchable Select */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Landowner / Farmer *</Label>
                <SearchableSelect
                  options={farmerOptions}
                  value={selectedFarmerId}
                  onChange={(val) => {
                    setValue('farmer_id', val);
                    const selFarmer = farmers.find((f) => f.id === val);
                    if (selFarmer) {
                      setValue('village', selFarmer.village);
                      setValue('district', selFarmer.district);
                    }
                  }}
                  placeholder="Select Farmer..."
                  searchPlaceholder="Search farmer name, village..."
                />
                {errors.farmer_id && <p className="text-[10px] text-destructive">{errors.farmer_id.message}</p>}
              </div>

              {/* Field Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Field Name / Plot Title *</Label>
                <Input
                  placeholder="e.g., North Tubewell Khasra #401"
                  {...register('field_name')}
                  className="text-xs"
                />
                {errors.field_name && <p className="text-[10px] text-destructive">{errors.field_name.message}</p>}
              </div>
            </div>

            {/* Places Geocoding Autocomplete for Field */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Auto-Locate Field Location (Places Geocoding API)</span>
                <span className="text-[10px] text-emerald-600 font-normal">Centers Map & Fills Village</span>
              </Label>
              <AddressAutocomplete
                value=""
                onChange={() => {}}
                onSelectPlace={(place) => {
                  if (place.village) setValue('village', place.village);
                  if (place.district) setValue('district', place.district);
                  setLat(place.lat);
                  setLng(place.lng);
                  toast.success(`Map centered on: ${place.address}`);
                }}
                placeholder="Type village, tehsil, or district to center map..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Area (Acres) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="5.0"
                  {...register('area', { valueAsNumber: true })}
                  className="text-xs"
                />
                {errors.area && <p className="text-[10px] text-destructive">{errors.area.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Crop Type *</Label>
                <Input placeholder="Wheat" {...register('crop')} className="text-xs" />
                {errors.crop && <p className="text-[10px] text-destructive">{errors.crop.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cultivation Season</Label>
                <Input placeholder="Rabi 2026-27" {...register('season')} className="text-xs" />
              </div>
            </div>

            {/* Color Picker & Polygon Controls */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <Label className="text-xs font-semibold">Choose Custom Color:</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedHexColor}
                      onChange={(e) => {
                        setSelectedHexColor(e.target.value);
                        setValue('polygon_color', e.target.value);
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-background hover:scale-105 transition-transform"
                      title="Choose Custom Color"
                    />
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-background rounded-md border text-foreground shadow-xs">
                      {selectedHexColor.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs font-semibold">Corner Points:</Label>
                  <div className="flex bg-background border rounded-lg p-0.5 text-xs">
                    {([4, 6, 8] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => {
                          setAddPointsCount(cnt);
                          setAddCustomPolygon(undefined);
                        }}
                        className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                          addPointsCount === cnt
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {cnt}-Corners
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Leaflet Interactive Map */}
              <div className="pt-1">
                <DynamicLocationPickerMap
                  lat={lat}
                  lng={lng}
                  acreage={currentArea}
                  polygonColor={selectedHexColor}
                  pointsCount={addPointsCount}
                  customPolygon={addCustomPolygon}
                  onChange={(nLat, nLng) => {
                    setLat(nLat);
                    setLng(nLng);
                  }}
                  onPolygonChange={(pts) => {
                    setAddCustomPolygon(pts);
                  }}
                  className="w-full h-[320px]"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDetectLocation}
                    className="h-7 text-xs gap-1.5"
                  >
                    <LocateFixed className="h-3.5 w-3.5 text-primary" />
                    Detect Current GPS
                  </Button>
                </div>
                <span className="font-mono text-[11px]">
                  Center GPS: {lat.toFixed(4)}, {lng.toFixed(4)}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isCreating} className="font-semibold">
                {isCreating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Registering Field...
                  </>
                ) : (
                  'Register Field Plot'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT FIELD PLOT & POLYGON MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Field Plot & Polygon Boundary</DialogTitle>
            <DialogDescription className="text-xs">
              Modify acreage, crop type, or drag/delete polygon vertices directly on the satellite map.
            </DialogDescription>
          </DialogHeader>

          {editingField && (
            <form onSubmit={handleUpdateFieldSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Landowner / Farmer *</Label>
                  <SearchableSelect
                    options={farmerOptions}
                    value={editFarmerId}
                    onChange={(val) => {
                      setEditFarmerId(val);
                      const selFarmer = farmers.find((f) => f.id === val);
                      if (selFarmer) {
                        setEditVillage(selFarmer.village);
                        setEditDistrict(selFarmer.district);
                      }
                    }}
                    placeholder="Select Farmer..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Field Name *</Label>
                  <Input
                    value={editFieldName}
                    onChange={(e) => setEditFieldName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Area (Acres) *</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={editArea}
                    onChange={(e) => setEditArea(parseFloat(e.target.value) || 1.0)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Crop Type *</Label>
                  <Input
                    value={editCrop}
                    onChange={(e) => setEditCrop(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Status *</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) => {
                      if (v) setEditStatus(v as any);
                    }}
                  >
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue>{editStatus}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      <SelectItem value="HARVESTED">HARVESTED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Polygon Map & Color Picker in Edit Modal */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/70 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <Label className="text-xs font-semibold">Choose Custom Color:</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-border p-0.5 bg-background hover:scale-105 transition-transform"
                        title="Choose Custom Color"
                      />
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-background rounded-md border text-foreground shadow-xs">
                        {editColor.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold">Corner Points:</Label>
                    <div className="flex bg-background border rounded-lg p-0.5 text-xs">
                      {([4, 6, 8] as const).map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => {
                            setEditPointsCount(cnt);
                            setEditCustomPolygon(undefined);
                          }}
                          className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                            editPointsCount === cnt
                              ? 'bg-primary text-primary-foreground font-bold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {cnt}-Corners
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <DynamicLocationPickerMap
                    lat={editLat}
                    lng={editLng}
                    acreage={editArea}
                    polygonColor={editColor}
                    pointsCount={editPointsCount}
                    customPolygon={editCustomPolygon}
                    onChange={(nLat, nLng) => {
                      setEditLat(nLat);
                      setEditLng(nLng);
                    }}
                    onPolygonChange={(pts) => {
                      setEditCustomPolygon(pts);
                    }}
                    className="w-full h-[320px]"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating} className="font-semibold">
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Updating...
                    </>
                  ) : (
                    'Save Field Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
