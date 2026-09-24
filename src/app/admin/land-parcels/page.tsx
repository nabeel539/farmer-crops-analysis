'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import {
  addParcel,
  updateParcel,
  deleteParcel,
  setParcelSearchQuery,
  setSoilTypeFilter,
  setIrrigationFilter,
} from '@/store/slices/landParcelsSlice';
import { LandParcel } from '@/types';
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
import {
  MapPin,
  Plus,
  LandPlot,
  Droplets,
  FlaskConical,
  CheckCircle2,
  ExternalLink,
  Layers,
  Map as MapIcon,
  LocateFixed,
  Navigation
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DynamicLocationPickerMap } from '@/components/map/DynamicLocationPickerMap';


export default function LandParcelsPage() {
  const dispatch = useAppDispatch();
  const { parcels, searchQuery, soilTypeFilter, irrigationFilter } = useAppSelector(
    (state) => state.landParcels
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);

  // Form State with GPS Coordinates
  const [formData, setFormData] = useState({
    farmerId: farmers[0]?.id || '',
    titleDeedOrKhasraNo: '',
    totalAcreage: 10,
    soilType: 'CLAY_LOAM' as LandParcel['soilType'],
    irrigationSource: 'CANAL_PLUS_TUBEWELL' as LandParcel['irrigationSource'],
    phLevel: 7.6,
    organicMatterPct: 1.15,
    village: farmers[0]?.village || 'Village Gill, Ludhiana',
    lat: 30.9010,
    lng: 75.8573
  });

  const handleFarmerChange = (farmerId: string) => {
    const f = farmers.find(item => item.id === farmerId);
    setFormData(prev => ({
      ...prev,
      farmerId,
      village: f ? `${f.village}, ${f.district}` : prev.village
    }));
  };

  const handleDetectLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      toast.info('Detecting current GPS position...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          setFormData(prev => ({ ...prev, lat, lng }));
          toast.success(`GPS Detected: ${lat}, ${lng}`);
        },
        (err) => {
          toast.error(`Location access denied or unavailable (${err.message}). Enter coordinates manually.`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
    }
  };

  // Filter Logic
  const filteredParcels = parcels.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.parcelCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.titleDeedOrKhasraNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSoil = soilTypeFilter === 'ALL' || p.soilType === soilTypeFilter;
    const matchesIrrigation = irrigationFilter === 'ALL' || p.irrigationSource === irrigationFilter;

    return matchesSearch && matchesSoil && matchesIrrigation;
  });

  const totalAcreage = parcels.reduce((sum, p) => sum + p.totalAcreage, 0);
  const verifiedCount = parcels.filter((p) => p.verificationStatus === 'VERIFIED').length;
  const avgPh = (parcels.reduce((sum, p) => sum + p.phLevel, 0) / (parcels.length || 1)).toFixed(1);

  const handleCreateParcel = (e: React.FormEvent) => {
    e.preventDefault();
    const selFarmer = farmers.find(f => f.id === formData.farmerId) || farmers[0];
    const centerLat = Number(formData.lat) || 30.9010;
    const centerLng = Number(formData.lng) || 75.8573;
    const offset = 0.0025 * Math.sqrt((Number(formData.totalAcreage) || 10) / 15);

    const newParcel: LandParcel = {
      id: `PRCL-${String(parcels.length + 1).padStart(3, '0')}`,
      parcelCode: `PRCL-${selFarmer.district.substring(0, 3).toUpperCase()}-00${parcels.length + 1}A`,
      farmerId: selFarmer.id,
      farmerName: selFarmer.fullName,
      titleDeedOrKhasraNo: formData.titleDeedOrKhasraNo || `Khasra # ${Math.floor(50 + Math.random() * 200)}/1-10`,
      totalAcreage: Number(formData.totalAcreage) || 10,
      soilType: formData.soilType || 'CLAY_LOAM',
      irrigationSource: formData.irrigationSource || 'CANAL_PLUS_TUBEWELL',
      phLevel: Number(formData.phLevel) || 7.5,
      organicMatterPct: Number(formData.organicMatterPct) || 1.1,
      village: formData.village || selFarmer.village,
      centerCoordinates: {
        lat: centerLat,
        lng: centerLng
      },
      polygonBoundary: [
        { lat: parseFloat((centerLat + offset).toFixed(5)), lng: parseFloat((centerLng - offset).toFixed(5)) },
        { lat: parseFloat((centerLat + offset).toFixed(5)), lng: parseFloat((centerLng + offset).toFixed(5)) },
        { lat: parseFloat((centerLat - offset).toFixed(5)), lng: parseFloat((centerLng + offset).toFixed(5)) },
        { lat: parseFloat((centerLat - offset).toFixed(5)), lng: parseFloat((centerLng - offset).toFixed(5)) }
      ],
      verificationStatus: 'VERIFIED',
      verifiedDate: new Date().toISOString().split('T')[0],
      verifiedBy: 'Field Officer (Registered with GPS)'
    };

    dispatch(addParcel(newParcel));
    toast.success(`Land parcel ${newParcel.parcelCode} registered with GPS location!`);
    setAddModalOpen(false);
  };

  const handleVerifyParcel = () => {
    if (selectedParcel) {
      dispatch(updateParcel({
        ...selectedParcel,
        verificationStatus: 'VERIFIED',
        verifiedDate: new Date().toISOString().split('T')[0],
        verifiedBy: 'Muhammad Asif (Field Officer)'
      }));
      toast.success(`Parcel ${selectedParcel.parcelCode} GPS coordinates verified!`);
      setVerifyModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Land Parcels & Soil Health"
        description="GIS boundary registry, Khasra title deeds, irrigation sources, and soil chemistry indices."
        actionButton={{
          label: 'Register Parcel',
          icon: Plus,
          onClick: () => setAddModalOpen(true),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Registered Parcels"
          value={parcels.length}
          subtitle={`${totalAcreage} Total Cultivated Acres`}
          icon={LandPlot}
          variant="primary"
        />
        <MetricCard
          title="GPS Boundary Verified"
          value={`${verifiedCount} / ${parcels.length}`}
          subtitle={`${Math.round((verifiedCount / parcels.length) * 100)}% Verified on Site`}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Average Soil pH"
          value={avgPh}
          subtitle="Optimal Wheat Range: 7.2 - 8.2"
          icon={FlaskConical}
        />
        <MetricCard
          title="Canal + Tubewell Connected"
          value={`${parcels.filter(p => p.irrigationSource.includes('CANAL')).length} Parcels`}
          subtitle="Dual-source security"
          icon={Droplets}
        />
      </div>

      {/* Search & Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => dispatch(setParcelSearchQuery(q))}
        searchPlaceholder="Search parcel code, farmer name, Khasra #..."
        filters={[
          {
            id: 'soil',
            placeholder: 'All Soil Types',
            value: soilTypeFilter,
            onChange: (v) => dispatch(setSoilTypeFilter(v)),
            options: [
              { label: 'All Soil Types', value: 'ALL' },
              { label: 'Clay Loam', value: 'CLAY_LOAM' },
              { label: 'Silt Loam', value: 'SILT_LOAM' },
              { label: 'Sandy Loam', value: 'SANDY_LOAM' },
              { label: 'Alluvial Soil', value: 'ALLUVIAL' },
              { label: 'Saline Soil', value: 'SALINE' },
            ],
          },
          {
            id: 'irrigation',
            placeholder: 'All Irrigation Sources',
            value: irrigationFilter,
            onChange: (v) => dispatch(setIrrigationFilter(v)),
            options: [
              { label: 'All Irrigation Sources', value: 'ALL' },
              { label: 'Canal + Tubewell', value: 'CANAL_PLUS_TUBEWELL' },
              { label: 'Canal Water', value: 'CANAL' },
              { label: 'Tubewell', value: 'TUBEWELL' },
              { label: 'Solar Pump', value: 'SOLAR_PUMP' },
              { label: 'Rain Fed', value: 'RAIN_FED' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setParcelSearchQuery(''));
          dispatch(setSoilTypeFilter('ALL'));
          dispatch(setIrrigationFilter('ALL'));
        }}
      />

      {/* Parcels Table */}
      {filteredParcels.length === 0 ? (
        <EmptyState
          title="No Land Parcels Found"
          description="No land parcel records match your filters."
          action={{
            label: 'Register New Parcel',
            onClick: () => setAddModalOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                <TableHead className="font-bold">Parcel Code</TableHead>
                <TableHead className="font-bold">Owner / Farmer</TableHead>
                <TableHead className="font-bold">Khasra / Title Deed</TableHead>
                <TableHead className="font-bold text-right">Acreage</TableHead>
                <TableHead className="font-bold">Soil Type & pH</TableHead>
                <TableHead className="font-bold">Irrigation Source</TableHead>
                <TableHead className="font-bold">GPS Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParcels.map((parcel) => (
                <TableRow key={parcel.id} className="hover:bg-muted/30 text-xs">
                  <TableCell>
                    <div className="font-mono font-bold text-foreground">{parcel.parcelCode}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {parcel.centerCoordinates.lat.toFixed(4)}, {parcel.centerCoordinates.lng.toFixed(4)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-semibold text-foreground">{parcel.farmerName}</div>
                    <div className="text-[11px] text-muted-foreground">{parcel.village}</div>
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-medium">{parcel.titleDeedOrKhasraNo}</span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-bold text-foreground text-sm">{parcel.totalAcreage} Ac</span>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground">{parcel.soilType.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-muted-foreground">
                      pH: <span className="font-semibold text-foreground">{parcel.phLevel}</span> &bull; OM: {parcel.organicMatterPct}%
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="font-medium text-[11px]">
                      {parcel.irrigationSource.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={parcel.verificationStatus} />
                  </TableCell>

                  <TableCell className="text-right">
                    {parcel.verificationStatus === 'PENDING' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-semibold text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => {
                          setSelectedParcel(parcel);
                          setVerifyModalOpen(true);
                        }}
                      >
                        Verify GPS
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {parcel.verifiedDate || 'Verified'}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Register Parcel Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Register Agricultural Land Parcel</DialogTitle>
            <DialogDescription className="text-xs">
              Link field parcel to registered farmer with interactive GPS satellite pin, Khasra title deed and soil parameters.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateParcel} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Farmer / Landowner *</Label>
              <Select
                value={formData.farmerId || farmers[0]?.id || ''}
                onValueChange={(v) => {
                  if (v !== null) handleFarmerChange(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.fullName} &bull; {f.village} ({f.district})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                lat={formData.lat}
                lng={formData.lng}
                acreage={formData.totalAcreage}
                onChange={(lat, lng) => setFormData(prev => ({ ...prev, lat, lng }))}
                className="w-full h-[220px]"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Latitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                    placeholder="30.9010"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Longitude</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
                    placeholder="75.8573"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground">Village / Field Location Address</Label>
                <Input
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="e.g. Village Gill, Tehsil Ludhiana West"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Khasra / Title Deed Number *</Label>
                <Input
                  required
                  placeholder="e.g. Khasra # 142/18-22"
                  value={formData.titleDeedOrKhasraNo || ''}
                  onChange={(e) => setFormData({ ...formData, titleDeedOrKhasraNo: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Total Acreage (Acres) *</Label>
                <Input
                  type="number"
                  step="0.5"
                  required
                  value={formData.totalAcreage}
                  onChange={(e) => setFormData({ ...formData, totalAcreage: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Soil Type</Label>
                <Select
                  value={formData.soilType || 'CLAY_LOAM'}
                  onValueChange={(v) => {
                    if (v !== null) setFormData({ ...formData, soilType: v as any });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLAY_LOAM">Clay Loam (Heavy)</SelectItem>
                    <SelectItem value="SILT_LOAM">Silt Loam (Standard)</SelectItem>
                    <SelectItem value="SANDY_LOAM">Sandy Loam (Light)</SelectItem>
                    <SelectItem value="ALLUVIAL">Alluvial (Riverbed)</SelectItem>
                    <SelectItem value="SALINE">Saline Soil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Irrigation Source</Label>
                <Select
                  value={formData.irrigationSource || 'CANAL_PLUS_TUBEWELL'}
                  onValueChange={(v) => {
                    if (v !== null) setFormData({ ...formData, irrigationSource: v as any });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CANAL_PLUS_TUBEWELL">Canal + Tubewell</SelectItem>
                    <SelectItem value="CANAL">Canal Water Only</SelectItem>
                    <SelectItem value="TUBEWELL">Tubewell Electric/Diesel</SelectItem>
                    <SelectItem value="SOLAR_PUMP">Solar Tubewell Pump</SelectItem>
                    <SelectItem value="RAIN_FED">Rain Fed (Barani)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 bg-muted/40 rounded-lg">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Soil pH Level</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.phLevel}
                  onChange={(e) => setFormData({ ...formData, phLevel: parseFloat(e.target.value) || 7.5 })}
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Organic Matter (%)</Label>
                <Input
                  type="number"
                  step="0.05"
                  value={formData.organicMatterPct}
                  onChange={(e) => setFormData({ ...formData, organicMatterPct: parseFloat(e.target.value) || 1.0 })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold">
                Register Parcel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* GPS Verification Dialog */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedParcel && (
            <div className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Verify Field GPS Coordinates</DialogTitle>
                <DialogDescription className="text-xs">
                  Confirm physical boundary walkthrough for parcel {selectedParcel.parcelCode}.
                </DialogDescription>
              </DialogHeader>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="font-bold">{selectedParcel.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title Deed:</span>
                  <span className="font-mono">{selectedParcel.titleDeedOrKhasraNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Acreage:</span>
                  <span className="font-bold">{selectedParcel.totalAcreage} Acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GPS Center Point:</span>
                  <span className="font-mono">{selectedParcel.centerCoordinates.lat}, {selectedParcel.centerCoordinates.lng}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-400">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Satellite Boundary Confirmed
                </p>
                <p className="text-[11px] mt-0.5">4 Corner polygon coordinates validated against cadastral map.</p>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setVerifyModalOpen(false)}>Cancel</Button>
                <Button onClick={handleVerifyParcel} className="font-semibold gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve Verification
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
