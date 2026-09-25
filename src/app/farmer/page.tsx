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
import { useGetCropCyclesQuery } from '@/store/api/cropCycleApi';
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

  // 1. Fetch All Farmers to allow persona detection and demo switching
  const {
    data: allFarmers = [],
    isLoading: isFarmersLoading,
    refetch: refetchFarmers,
  } = useGetFarmersQuery({ limit: 50 });

  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('CROP_STATUS');

  // Auto-detect farmer by mobile or select first available
  useEffect(() => {
    if (allFarmers.length > 0 && !selectedFarmerId) {
      if (authUser?.role === 'FARMER' && authUser?.mobile) {
        const matchingFarmer = allFarmers.find(
          (f) => f.mobile_number === authUser.mobile || f.name.toLowerCase() === authUser.name.toLowerCase()
        );
        if (matchingFarmer) {
          setSelectedFarmerId(matchingFarmer.id);
          return;
        }
      }
      setSelectedFarmerId(allFarmers[0].id);
    }
  }, [allFarmers, authUser, selectedFarmerId]);

  const activeFarmer: Farmer | undefined =
    allFarmers.find((f) => f.id === selectedFarmerId) || allFarmers[0];

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
      {/* Top Interactive Farmer Switcher Bar & Sync Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span>Active Persona:</span>
          </div>

          <Select value={activeFarmer.id} onValueChange={(val) => { if (val) setSelectedFarmerId(val); }}>
            <SelectTrigger className="h-8 text-xs font-bold min-w-[200px] sm:min-w-[240px] bg-background">
              <SelectValue placeholder="Select Farmer Profile" />
            </SelectTrigger>
            <SelectContent>
              {allFarmers.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-xs">
                  <span className="font-bold">{f.name}</span> &bull; {f.village} ({f.mobile_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
            {activeFarmer.district}, {activeFarmer.state}
          </Badge>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAll}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sync Data</span>
          </Button>
        </div>
      </div>

      {/* Main Tab Content Routing */}
      {activeTab === 'CROP_STATUS' && (
        <FarmerCropStatus
          farmer={activeFarmer}
          cropCycles={cropCycles}
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
          cropCycles={cropCycles}
          activities={activities}
          isLoading={isActivitiesLoading}
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
          isLoading={isVisitsLoading}
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
          village={activeFarmer.village}
          district={activeFarmer.district}
        />
      )}
    </FarmerShell>
  );
}
