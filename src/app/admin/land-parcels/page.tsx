'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useGetFieldsQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldPolygonMutation,
  Field as ApiField,
} from '@/store/api/fieldApi';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
  Map as MapIcon,
  LocateFixed,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DynamicLocationPickerMap } from '@/components/map/DynamicLocationPickerMap';

const fieldFormSchema = z.object({
  farmer_id: z.string().min(1, 'Please select a registered farmer'),
  field_name: z.string().min(2, 'Field name must be at least 2 characters'),
  village: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  area: z.number().positive('Area must be greater than 0'),
  crop: z.string().min(1, 'Crop type is required'),
  season: z.string().optional().or(z.literal('')),
  polygon_color: z.enum(['GREEN', 'YELLOW', 'RED', 'BLUE']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'HARVESTED']),
});

type FieldFormValues = z.infer<typeof fieldFormSchema>;

export default function LandParcelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // GPS Coordinates state
  const [lat, setLat] = useState(30.9010);
  const [lng, setLng] = useState(75.8573);

  // RTK Query hooks
  const { data: fields = [], isLoading, isError, error, refetch } = useGetFieldsQuery();
  const { data: farmers = [] } = useGetFarmersQuery();
  const [createField, { isLoading: isCreating }] = useCreateFieldMutation();
  const [updateField] = useUpdateFieldMutation();
  const [deleteFieldPolygon] = useDeleteFieldPolygonMutation();

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
      polygon_color: 'GREEN',
      status: 'ACTIVE',
    },
  });

  const selectedFarmerId = watch('farmer_id');
  const selectedCrop = watch('crop');
  const selectedColor = watch('polygon_color');
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

  const onSubmit = async (values: FieldFormValues) => {
    try {
      const offset = 0.0025 * Math.sqrt(values.area / 15);
      const polygon = {
        type: 'Polygon' as const,
        coordinates: [
          [
            [parseFloat((lng - offset).toFixed(5)), parseFloat((lat + offset).toFixed(5))],
            [parseFloat((lng + offset).toFixed(5)), parseFloat((lat + offset).toFixed(5))],
            [parseFloat((lng + offset).toFixed(5)), parseFloat((lat - offset).toFixed(5))],
            [parseFloat((lng - offset).toFixed(5)), parseFloat((lat - offset).toFixed(5))],
            [parseFloat((lng - offset).toFixed(5)), parseFloat((lat + offset).toFixed(5))],
          ],
        ],
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
        polygon_color: values.polygon_color,
        status: values.status,
      }).unwrap();

      toast.success(`Field "${values.field_name}" registered with GPS polygon!`);
      setAddModalOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to register land parcel');
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

  // Filter Logic
  const filteredFields = fields.filter((f) => {
    const farmerName = farmers.find((fa) => fa.id === f.farmer_id)?.name || '';
    const matchesSearch =
      searchQuery === '' ||
      f.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.village && f.village.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAcreage = fields.reduce((sum, f) => sum + (f.area || 0), 0);
  const polygonMappedCount = fields.filter((f) => f.polygon !== null).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Land Parcels & Field Polygons"
        description="GIS boundary registry, farmer land plot ownership, crop allocation, and GPS satellite coordinates."
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
      >
        <Link href="/admin/map">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
            <MapIcon className="h-3.5 w-3.5" />
            Open GIS Map View
          </Button>
        </Link>
      </PageHeader>

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
          subtitle={fields.length ? `${Math.round((polygonMappedCount / fields.length) * 100)}% Boundary Mapped` : '0%'}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Active Wheat Plots"
          value={fields.filter((f) => f.status === 'ACTIVE').length}
          subtitle="Currently under monitoring"
          icon={MapPin}
        />
      </div>

      {/* Search & Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search field name, owner, or village..."
        filters={[
          {
            id: 'status',
            placeholder: 'All Statuses',
            value: statusFilter,
            onChange: (v) => setStatusFilter(v),
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active Plots', value: 'ACTIVE' },
              { label: 'Harvested', value: 'HARVESTED' },
              { label: 'Inactive', value: 'INACTIVE' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setStatusFilter('ALL');
        }}
      />

      {/* Fields Table */}
      {isLoading ? (
        <Card className="border border-border/80 shadow-2xs">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Fetching field parcels from server...</span>
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
            <h3 className="text-base font-semibold text-foreground">Failed to load field parcels</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              {(error as any)?.data?.detail || 'Unable to connect to backend server. Please verify backend status.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : filteredFields.length === 0 ? (
        <EmptyState
          icon={LandPlot}
          title={searchQuery || statusFilter !== 'ALL' ? 'No matching field plots found' : 'No land plots registered yet'}
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'Try resetting your search query or status filter.'
              : 'Register your first agricultural land parcel to enable GPS polygon mapping and seed allocations.'
          }
          action={{
            label: 'Register First Field',
            onClick: () => setAddModalOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                <TableHead className="font-bold">Field Name / GPS</TableHead>
                <TableHead className="font-bold">Owner / Farmer</TableHead>
                <TableHead className="font-bold">Village / District</TableHead>
                <TableHead className="font-bold text-right">Acreage</TableHead>
                <TableHead className="font-bold">Crop & Season</TableHead>
                <TableHead className="font-bold">Map Status</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFields.map((field) => {
                const owner = farmers.find((fa) => fa.id === field.farmer_id);
                return (
                  <TableRow key={field.id} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <div className="font-bold text-foreground">{field.field_name}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <MapPin className="h-3 w-3 text-primary" />
                        {field.latitude?.toFixed(4) || '30.9010'}, {field.longitude?.toFixed(4) || '75.8573'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-semibold text-foreground">{owner ? owner.name : 'Unknown Farmer'}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">ID: {field.farmer_id.slice(0, 8)}...</div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-foreground">{field.village || 'N/A'}</div>
                      <div className="text-[11px] text-muted-foreground">{field.district || 'Ludhiana'}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className="font-bold text-foreground text-sm">{field.area || 0} Ac</span>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-foreground">{field.crop || 'Wheat'}</div>
                      <div className="text-[11px] text-muted-foreground">{field.season || 'Rabi'}</div>
                    </TableCell>

                    <TableCell>
                      {field.polygon ? (
                        <Badge
                          variant="outline"
                          className={
                            field.polygon_color === 'GREEN'
                              ? 'border-emerald-500/40 text-emerald-700 bg-emerald-500/10'
                              : field.polygon_color === 'YELLOW'
                              ? 'border-amber-500/40 text-amber-700 bg-amber-500/10'
                              : field.polygon_color === 'RED'
                              ? 'border-destructive/40 text-destructive bg-destructive/10'
                              : 'border-blue-500/40 text-blue-700 bg-blue-500/10'
                          }
                        >
                          ● Polygon Mapped ({field.polygon_color})
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Pin Only</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={field.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      {field.polygon && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeletePolygon(field.id)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Remove Polygon Boundary"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Register Parcel Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Register Agricultural Field Plot</DialogTitle>
            <DialogDescription className="text-xs">
              Link field plot to a registered farmer with GPS coordinates, boundary polygon, and crop plan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Farmer / Landowner *</Label>
              <Select
                value={selectedFarmerId}
                onValueChange={(v) => {
                  if (v) {
                    setValue('farmer_id', v);
                    const selFarmer = farmers.find((f) => f.id === v);
                    if (selFarmer) {
                      setValue('village', selFarmer.village);
                      setValue('district', selFarmer.district);
                    }
                  }
                }}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select Farmer" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} &bull; {f.village} ({f.district})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.farmer_id && <p className="text-[10px] text-destructive">{errors.farmer_id.message}</p>}
            </div>

            {/* Interactive GPS Satellite Map Picker */}
            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold flex items-center gap-1.5 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  Interactive Satellite GPS Map
                </Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDetectLocation}
                  className="h-7 text-[11px] font-semibold gap-1 text-primary border-primary/30 hover:bg-primary/10"
                >
                  <LocateFixed className="h-3 w-3" />
                  Detect Live GPS
                </Button>
              </div>

              {/* Embedded Live Leaflet Satellite Map */}
              <DynamicLocationPickerMap
                lat={lat}
                lng={lng}
                acreage={currentArea}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
                className="w-full h-[200px]"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    required
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    placeholder="30.9010"
                    className="text-xs h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    required
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    placeholder="75.8573"
                    className="text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Field Name *</Label>
                <Input
                  placeholder="e.g., North Field A"
                  {...register('field_name')}
                  className="text-xs h-8.5"
                />
                {errors.field_name && <p className="text-[10px] text-destructive">{errors.field_name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Acreage (Acres) *</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="5.0"
                  {...register('area', { valueAsNumber: true })}
                  className="text-xs h-8.5"
                />
                {errors.area && <p className="text-[10px] text-destructive">{errors.area.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Crop Type *</Label>
                <Input
                  placeholder="e.g., Wheat"
                  {...register('crop')}
                  className="text-xs h-8.5"
                />
                {errors.crop && <p className="text-[10px] text-destructive">{errors.crop.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Season</Label>
                <Input
                  placeholder="e.g., Rabi 2026-27"
                  {...register('season')}
                  className="text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Polygon Color</Label>
                <Select
                  value={selectedColor}
                  onValueChange={(v) => {
                    if (v) setValue('polygon_color', v as any);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-8.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GREEN">GREEN (Healthy)</SelectItem>
                    <SelectItem value="YELLOW">YELLOW (Attention)</SelectItem>
                    <SelectItem value="RED">RED (High Alert)</SelectItem>
                    <SelectItem value="BLUE">BLUE (Harvested)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Village</Label>
                <Input
                  placeholder="e.g., Rampur"
                  {...register('village')}
                  className="text-xs h-8.5"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">District</Label>
                <Input
                  placeholder="e.g., Ludhiana"
                  {...register('district')}
                  className="text-xs h-8.5"
                />
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
                    Registering...
                  </>
                ) : (
                  'Register Field Plot'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
