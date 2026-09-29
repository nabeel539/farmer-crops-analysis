'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { FarmerShell } from '@/components/farmer/FarmerShell';
import { FarmerCropStatus } from '@/components/farmer/FarmerCropStatus';
import { FarmerPassbook } from '@/components/farmer/FarmerPassbook';
import { FarmerActivityLogger } from '@/components/farmer/FarmerActivityLogger';
import { FarmerParcelsView } from '@/components/farmer/FarmerParcelsView';
import { FarmerVisitsTimeline } from '@/components/farmer/FarmerVisitsTimeline';
import { FarmerHarvestSummary } from '@/components/farmer/FarmerHarvestSummary';
import { FarmerWeatherAdvisory } from '@/components/farmer/FarmerWeatherAdvisory';
import {
  useGetFarmersQuery,
  useGetFarmerByIdQuery,
  Farmer,
} from '@/store/api/farmerApi';
import { useGetCropCyclesQuery, CropCycleRecord } from '@/store/api/cropCycleApi';
import { useGetAllocationsQuery } from '@/store/api/allocationApi';
import { useGetActivitiesQuery } from '@/store/api/activityApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
import { useGetOfficerVisitsQuery } from '@/store/api/visitApi';
import { useGetHarvestsQuery } from '@/store/api/harvestApi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserCheck,
  Wheat,
  RotateCcw,
  Sparkles,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FarmerPortalPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const isFarmerRole = authUser?.role === 'FARMER';

  // 1. Fetch All Farmers (used for farmer lookup or admin preview)
  const {
    data: allFarmers = [],
    isLoading: isFarmersLoading,
    refetch: refetchFarmers,
  } = useGetFarmersQuery({ limit: 50 });

  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('CROP_STATUS');

  // Match logged-in farmer
  const loggedInFarmer = allFarmers.find(
    (f) =>
      (authUser?.mobile && f.mobile_number === authUser.mobile) ||
      (authUser?.email && f.email === authUser.email) ||
      (authUser?.name && f.name.toLowerCase() === authUser.name.toLowerCase()) ||
      f.id === authUser?.id
  );

  // Auto-detect farmer by mobile or select first available
  useEffect(() => {
    if (allFarmers.length > 0) {
      if (isFarmerRole && loggedInFarmer) {
        setSelectedFarmerId(loggedInFarmer.id);
      } else if (!selectedFarmerId) {
        setSelectedFarmerId(allFarmers[0].id);
      }
    }
  }, [allFarmers, isFarmerRole, loggedInFarmer, selectedFarmerId]);

  // Determine active farmer profile
  const activeFarmer: Farmer | undefined = isFarmerRole
    ? loggedInFarmer ||
      (authUser
        ? {
            id: authUser.id,
            name: authUser.name,
            mobile_number: authUser.mobile || '7735382544',
            email: authUser.email || null,
            address: null,
            village: 'Registered Farm',
            block: null,
            district: 'Registered District',
            state: 'Punjab',
            status: 'ACTIVE',
            registration_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : undefined)
    : (allFarmers.find((f) => f.id === selectedFarmerId) || allFarmers[0]);

  const currentFarmerId = activeFarmer?.id || '';

  // 2. Real-time RTK Query Data Hooks for the Active Farmer
  const {
    data: cropCycles = [],
    isLoading: isCyclesLoading,
    refetch: refetchCycles,
  } = useGetCropCyclesQuery(
    currentFarmerId ? { farmer_id: currentFarmerId } : undefined,
    { skip: !currentFarmerId }
  );

  const reduxCycles = useAppSelector((state) => state.cropCycles.cycles);

  // Combine live API cycles with Redux cycles for this farmer
  const allFarmerCycles: CropCycleRecord[] = [
    ...cropCycles,
    ...reduxCycles
      .filter(
        (rc) =>
          (rc.farmerId === currentFarmerId ||
            (activeFarmer?.name && rc.farmerName.toLowerCase().includes(activeFarmer.name.toLowerCase())) ||
            (activeFarmer?.id && rc.farmerId === activeFarmer.id)) &&
          !cropCycles.some((ac) => ac.id === rc.id || ac.cycle_code === rc.cycleCode)
      )
      .map((rc) => ({
        id: rc.id,
        cycle_code: rc.cycleCode,
        farmer_id: rc.farmerId,
        field_id: rc.fieldParcelId,
        crop_type: 'WHEAT',
        variety: rc.seedVariety,
        season: rc.season,
        sowing_date: rc.sowingDate ? new Date(rc.sowingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        sowing_method: rc.sowingMethod,
        allocated_acres: rc.allocatedAcres,
        stage: rc.currentStage,
        health_status: rc.healthStatus,
        expected_harvest_date: rc.estimatedHarvestDate ? new Date(rc.estimatedHarvestDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        expected_yield_maunds_per_acre: rc.expectedYieldMaundsPerAcre || 50,
        target_total_yield_kg: rc.allocatedAcres * (rc.expectedYieldMaundsPerAcre || 50) * 40,
        ndvi_score: rc.latestNdvi || 0.45,
        soil_moisture_pct: rc.soilMoisturePercent || 32,
        temperature_celsius: 24.5,
        risk_alert_level: rc.riskAlertLevel || (rc.healthStatus === 'OPTIMAL' ? 'LOW' : 'MEDIUM'),
        remarks: rc.notes || null,
        irrigation_strategy: rc.irrigationStrategy || 'STANDARD_6_STAGE',
        nutrition_plan: rc.nutritionPlan || 'STANDARD_IARI',
        seed_treatment: rc.seedTreatment || 'Tebuconazole 2 DS @ 2g/kg',
        officer_advisory: rc.officerAdvisory || rc.notes || 'Follow standard irrigation schedule. First CRI water is critical at Day 21.',
        created_at: rc.createdAt || new Date().toISOString(),
      })),
  ];

  const {
    data: allocations = [],
    isLoading: isAllocationsLoading,
    refetch: refetchAllocations,
  } = useGetAllocationsQuery(
    currentFarmerId ? { farmer_id: currentFarmerId } : undefined,
    { skip: !currentFarmerId }
  );

  const {
    data: activities = [],
    isLoading: isActivitiesLoading,
    refetch: refetchActivities,
  } = useGetActivitiesQuery(
    currentFarmerId ? { farmer_id: currentFarmerId } : undefined,
    { skip: !currentFarmerId }
  );

  const {
    data: fields = [],
    isLoading: isFieldsLoading,
    refetch: refetchFields,
  } = useGetFieldsQuery(
    currentFarmerId ? { farmer_id: currentFarmerId } : undefined,
    { skip: !currentFarmerId }
  );

  const {
    data: visits = [],
    isLoading: isVisitsLoading,
    refetch: refetchVisits,
  } = useGetOfficerVisitsQuery(
    currentFarmerId ? { farmer_id: currentFarmerId } : undefined,
    { skip: !currentFarmerId }
  );

  const {
    data: harvests = [],
    isLoading: isHarvestsLoading,
    refetch: refetchHarvests,
  } = useGetHarvestsQuery(
    currentFarmerId ? { farmer_id: currentFarmerId } : undefined,
    { skip: !currentFarmerId }
  );

  const handleRefreshAll = () => {
    refetchFarmers();
    refetchCycles();
    refetchAllocations();
    refetchActivities();
    refetchFields();
    refetchVisits();
    refetchHarvests();
    toast.success('Live farm telemetry updated from server.');
  };

  if (isFarmersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold text-muted-foreground">
            Connecting to Krishi AgriTech Server...
          </p>
        </div>
      </div>
    );
  }

  if (!activeFarmer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full border-dashed border-2">
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base">No Farmer Profile Found</h3>
              <p className="text-xs text-muted-foreground">
                There are no registered farmers in the database. Please visit the Admin Portal to enroll farmers.
              </p>
            </div>
            <Button
              onClick={() => (window.location.href = '/admin/farmers')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              Go to Farmer Enrollment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FarmerShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      farmerName={activeFarmer.name}
      farmerCode={activeFarmer.mobile_number}
      village={activeFarmer.village}
    >
      {/* Top Banner: For logged-in Farmers, show Verified Profile; for Admin/Officers show Preview Bar */}
      {isFarmerRole ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{activeFarmer.name}</span>
                <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                  {activeFarmer.mobile_number}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-semibold bg-emerald-600 text-white">
                  Verified Grower
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-emerald-600" />
                <span>
                  {activeFarmer.village}
                  {activeFarmer.district ? `, ${activeFarmer.district}` : ''}
                  {activeFarmer.state ? ` (${activeFarmer.state})` : ''}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer bg-background"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sync Data</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-amber-500/30 bg-amber-500/5 shadow-xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] uppercase font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40">
              Admin Preview
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
              <UserCheck className="h-4 w-4 text-amber-600" />
              <span>Viewing Farmer:</span>
            </div>

            <Select
              value={activeFarmer.id}
              onValueChange={(val) => {
                if (val) setSelectedFarmerId(val);
              }}
            >
              <SelectTrigger className="h-8 text-xs font-bold min-w-[220px] sm:min-w-[320px] bg-background">
                <SelectValue>
                  {activeFarmer ? `${activeFarmer.name} • ${activeFarmer.village} (${activeFarmer.mobile_number})` : 'Select Farmer'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {allFarmers.map((f) => (
                  <SelectItem key={f.id} value={f.id} className="text-xs">
                    {f.name} &bull; {f.village} ({f.mobile_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge variant="outline" className="text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
              {activeFarmer.district}, {activeFarmer.state}
            </Badge>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer bg-background"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sync Data</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Tab Content Routing */}
      {activeTab === 'CROP_STATUS' && (
        <FarmerCropStatus
          farmer={activeFarmer}
          cropCycles={allFarmerCycles}
          isLoading={isCyclesLoading}
          onNavigateToDiary={() => setActiveTab('OPERATIONS')}
        />
      )}

      {activeTab === 'PASSBOOK' && (
        <FarmerPassbook
          farmer={activeFarmer}
          allocations={allocations}
          isLoading={isAllocationsLoading}
        />
      )}

      {activeTab === 'OPERATIONS' && (
        <FarmerActivityLogger
          farmer={activeFarmer}
          cropCycles={allFarmerCycles}
          fields={fields}
          activities={activities}
          isLoading={isActivitiesLoading}
          onNavigateToParcels={() => setActiveTab('PARCELS')}
        />
      )}

      {activeTab === 'PARCELS' && (
        <FarmerParcelsView
          farmer={activeFarmer}
          fields={fields}
          isLoading={isFieldsLoading}
        />
      )}

      {activeTab === 'VISITS' && (
        <FarmerVisitsTimeline
          farmer={activeFarmer}
          visits={visits}
          activities={activities}
          isLoading={isVisitsLoading || isActivitiesLoading}
        />
      )}

      {activeTab === 'HARVEST' && (
        <FarmerHarvestSummary
          farmer={activeFarmer}
          harvests={harvests}
          isLoading={isHarvestsLoading}
        />
      )}

      {activeTab === 'WEATHER_ADVISORY' && (
        <FarmerWeatherAdvisory
          village={activeFarmer?.village}
          district={activeFarmer?.district}
          farmerName={activeFarmer?.name}
        />
      )}
    </FarmerShell>
  );
}
