'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { HarvestRecord } from '@/types';
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
  Wheat,
  Plus,
  Scale,
  Sparkles,
  Truck,
  Droplets,
  CheckCircle2,
  Warehouse,
  Trophy,
  BarChart3,
  TrendingUp,
  Download,
  Users,
  Award,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetHarvestsQuery, useCreateHarvestMutation } from '@/store/api/harvestApi';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
import { useGetCropCyclesQuery } from '@/store/api/cropCycleApi';

export default function HarvestPage() {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'COMPARISON'>('LOGS');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'YIELD_DESC' | 'EFFICIENCY_DESC' | 'NAME_ASC'>('YIELD_DESC');

  const { data: apiHarvests = [], isLoading, refetch } = useGetHarvestsQuery();
  const { data: apiFarmers = [] } = useGetFarmersQuery();
  const { data: apiFields = [] } = useGetFieldsQuery();
  const { data: apiCycles = [] } = useGetCropCyclesQuery();

  const [createHarvestApi, { isLoading: isCreating }] = useCreateHarvestMutation();

  // Map to frontend interface
  const harvests: HarvestRecord[] = apiHarvests.map((h) => {
    const owner = apiFarmers.find((f) => f.id === h.farmer_id);
    return {
      id: h.id,
      harvestCode: h.harvest_code,
      cropCycleId: h.crop_cycle_id || 'cycle-101',
      farmerId: h.farmer_id,
      farmerName: owner ? owner.name : 'Registered Farmer',
      fieldParcelId: h.field_id || '',
      harvestDate: h.harvest_date,
      harvestMethod: h.harvest_method as any,
      acreageHarvested: h.acreage_harvested,
      totalWeightKg: h.total_weight_kg,
      totalWeightMaunds: h.total_weight_maunds,
      averageYieldMaundsPerAcre: h.yield_per_acre_maunds,
      grainMoisturePct: h.grain_moisture_pct,
      grainQualityGrade: h.grain_quality_grade as any,
      procurementCenterAssigned: h.procurement_center,
      storageSiloId: 'SILO-04',
      status: h.status as any,
      createdAt: h.created_at,
      updatedAt: h.created_at,
    };
  });

  const farmers = apiFarmers.map((f) => ({
    id: f.id,
    fullName: f.name,
    village: f.village,
  }));

  // Pagination & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'MECHANICAL_HARVESTER' | 'MANUAL_COMBINE' | 'REAPER'>('MECHANICAL_HARVESTER');
  const [acres, setAcres] = useState<number>(10);
  const [maundsYield, setMaundsYield] = useState<number>(520);
  const [moisture, setMoisture] = useState<number>(10.2);
  const [grade, setGrade] = useState<'GRADE_A_PREMIUM' | 'GRADE_B_STANDARD' | 'GRADE_C_FEED'>('GRADE_A_PREMIUM');
  const [silo, setSilo] = useState('Salarwala Strategic Grain Silo #4');

  // Filter Logic
  const filteredHarvests = harvests.filter((h) => {
    const matchesSearch =
      searchQuery === '' ||
      h.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.harvestCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.procurementCenterAssigned.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = gradeFilter === 'ALL' || h.grainQualityGrade === gradeFilter;
    const matchesStatus = statusFilter === 'ALL' || h.status === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  // Pagination Slicing
  const totalItems = filteredHarvests.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedHarvests = filteredHarvests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalMaunds = harvests.reduce((sum, h) => sum + h.totalWeightMaunds, 0);
  const totalTons = (harvests.reduce((sum, h) => sum + h.totalWeightKg, 0) / 1000).toFixed(1);
  const avgMoisture = harvests.length > 0
    ? (harvests.reduce((sum, h) => sum + h.grainMoisturePct, 0) / harvests.length).toFixed(1)
    : '0.0';

  // Aggregated farmer comparison logic
  const farmerComparisonList = React.useMemo(() => {
    const farmerMap: Record<string, {
      farmerId: string;
      farmerName: string;
      village: string;
      totalMaunds: number;
      totalKg: number;
      totalAcres: number;
      avgMoisture: number;
      harvestCount: number;
      grades: string[];
      latestDate: string;
      silos: string[];
    }> = {};

    harvests.forEach((h) => {
      const f = apiFarmers.find((farm) => farm.id === h.farmerId);
      const village = f?.village || 'Karnal';
      const name = h.farmerName;
      const key = h.farmerId || name;

      if (!farmerMap[key]) {
        farmerMap[key] = {
          farmerId: key,
          farmerName: name,
          village,
          totalMaunds: 0,
          totalKg: 0,
          totalAcres: 0,
          avgMoisture: 0,
          harvestCount: 0,
          grades: [],
          latestDate: h.harvestDate,
          silos: [],
        };
      }

      farmerMap[key].totalMaunds += h.totalWeightMaunds;
      farmerMap[key].totalKg += h.totalWeightKg;
      farmerMap[key].totalAcres += h.acreageHarvested;
      farmerMap[key].avgMoisture += h.grainMoisturePct;
      farmerMap[key].harvestCount += 1;
      if (!farmerMap[key].grades.includes(h.grainQualityGrade)) {
        farmerMap[key].grades.push(h.grainQualityGrade);
      }
      if (!farmerMap[key].silos.includes(h.procurementCenterAssigned)) {
        farmerMap[key].silos.push(h.procurementCenterAssigned);
      }
    });

    let list = Object.values(farmerMap).map((item) => {
      const efficiency = item.totalAcres > 0 ? item.totalMaunds / item.totalAcres : 0;
      const finalMoisture = item.harvestCount > 0 ? item.avgMoisture / item.harvestCount : 0;
      const totalQuintals = Math.round(item.totalKg / 100);
      const estPayout = totalQuintals * 2275;
      return {
        ...item,
        efficiencyMaundsPerAcre: Number(efficiency.toFixed(1)),
        avgMoisturePct: Number(finalMoisture.toFixed(1)),
        totalQuintals,
        estPayout,
      };
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.farmerName.toLowerCase().includes(q) ||
          f.village.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'YIELD_DESC') {
      list.sort((a, b) => b.totalMaunds - a.totalMaunds);
    } else if (sortBy === 'EFFICIENCY_DESC') {
      list.sort((a, b) => b.efficiencyMaundsPerAcre - a.efficiencyMaundsPerAcre);
    } else if (sortBy === 'NAME_ASC') {
      list.sort((a, b) => a.farmerName.localeCompare(b.farmerName));
    }

    return list;
  }, [harvests, apiFarmers, searchQuery, sortBy]);

  const maxFarmerMaunds = Math.max(...farmerComparisonList.map((f) => f.totalMaunds), 1);
  const topProducer = farmerComparisonList[0];
  const mostEfficient = [...farmerComparisonList].sort((a, b) => b.efficiencyMaundsPerAcre - a.efficiencyMaundsPerAcre)[0];

  const handleExportComparisonCSV = () => {
    if (farmerComparisonList.length === 0) {
      toast.error('No farmer harvest data to export');
      return;
    }
    const headers = ['Rank', 'Farmer Name', 'Village', 'Total Yield (Maunds)', 'Total Yield (Metric Tons)', 'Harvested Acres', 'Efficiency (Maunds/Acre)', 'Avg Moisture (%)', 'Quality Grades', 'Est MSP Payout (INR)'];
    const rows = farmerComparisonList.map((f, idx) => [
      idx + 1,
      f.farmerName,
      f.village,
      f.totalMaunds,
      (f.totalKg / 1000).toFixed(2),
      f.totalAcres,
      f.efficiencyMaundsPerAcre,
      f.avgMoisturePct,
      f.grades.join(' / '),
      f.estPayout,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Farmer_Harvest_Yield_Comparison_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Farmer harvest comparison exported to CSV');
  };

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId) {
      toast.error('Mandatory field required: Please select a registered farmer');
      return;
    }
    if (!acres || Number(acres) <= 0) {
      toast.error('Mandatory field required: Harvested acreage must be greater than 0');
      return;
    }
    if (!maundsYield || Number(maundsYield) <= 0) {
      toast.error('Mandatory field required: Yield must be greater than 0');
      return;
    }

    const selFarmer = farmers.find((f) => f.id === farmerId);
    const farmerParcel = apiFields.find((p) => p.farmer_id === farmerId);
    const farmerCycle = apiCycles.find((c) => c.farmer_id === farmerId);

    try {
      const result = await createHarvestApi({
        farmer_id: farmerId,
        field_id: farmerParcel?.id || null,
        crop_cycle_id: farmerCycle?.id || null,
        harvest_date: harvestDate,
        harvest_method: method,
        acreage_harvested: Number(acres),
        bags_collected: Math.round(Number(maundsYield) * 0.8),
        total_weight_maunds: Number(maundsYield),
        grain_moisture_pct: Number(moisture),
        grain_quality_grade: grade,
        dockage_percentage: 1.2,
        procurement_center: silo,
        officer_verified: true,
        status: 'STORED_IN_SILO',
        remarks: 'Direct silo intake record created from admin portal',
      }).unwrap();

      toast.success(`Harvest intake ${result.harvest_code} logged and stored in ${silo}!`);
      setAddModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to record harvest intake');
    }
  };

  const farmerOptions = farmers.map((f) => ({
    value: f.id,
    label: f.fullName,
    subLabel: f.village,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Harvest Records & Farmer Yield Comparison"
        description="Monitor grain weights, compare farmer-by-farmer procurement yields, laboratory moisture percentages, and silo intake."
        actionButton={{
          label: 'Record Harvest Intake',
          icon: Scale,
          onClick: () => {
            if (farmers.length > 0 && !farmerId) setFarmerId(farmers[0].id);
            setAddModalOpen(true);
          },
        }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportComparisonCSV}
          className="gap-1.5 text-xs font-semibold"
        >
          <Download className="h-3.5 w-3.5" />
          Export Comparison (.CSV)
        </Button>
      </PageHeader>

      {/* Main View Tabs (All Receipts vs Farmer Comparison) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-muted/30 p-1.5 rounded-xl border border-border/80">
        <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border w-full sm:w-auto">
          <Button
            type="button"
            variant={activeTab === 'LOGS' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('LOGS')}
            className={`h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer ${
              activeTab === 'LOGS' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <Wheat className="h-3.5 w-3.5" />
            All Harvest Receipts ({harvests.length})
          </Button>
          <Button
            type="button"
            variant={activeTab === 'COMPARISON' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('COMPARISON')}
            className={`h-8 px-3 text-xs font-semibold gap-1.5 cursor-pointer ${
              activeTab === 'COMPARISON' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            Farmer Yield Comparison & Rankings ({farmerComparisonList.length} Farmers)
          </Button>
        </div>

        {activeTab === 'COMPARISON' && (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground self-end sm:self-center">
            <span>Sort by:</span>
            <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border text-xs">
              <Button
                type="button"
                variant={sortBy === 'YIELD_DESC' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('YIELD_DESC')}
                className="h-7 px-2.5 text-[11px]"
              >
                Total Yield
              </Button>
              <Button
                type="button"
                variant={sortBy === 'EFFICIENCY_DESC' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('EFFICIENCY_DESC')}
                className="h-7 px-2.5 text-[11px]"
              >
                Efficiency (M/Ac)
              </Button>
              <Button
                type="button"
                variant={sortBy === 'NAME_ASC' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('NAME_ASC')}
                className="h-7 px-2.5 text-[11px]"
              >
                Name
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Procured Grain"
          value={`${totalMaunds.toLocaleString()} Maunds`}
          subtitle={`${totalTons} Metric Tons (${farmerComparisonList.length} Farmers)`}
          icon={Wheat}
          variant="primary"
        />
        <MetricCard
          title="Top Contributing Farmer"
          value={topProducer ? topProducer.farmerName : '—'}
          subtitle={topProducer ? `${topProducer.totalMaunds.toLocaleString()} Maunds (${topProducer.village})` : 'No data'}
          icon={Trophy}
        />
        <MetricCard
          title="Highest Yield Efficiency"
          value={mostEfficient ? `${mostEfficient.efficiencyMaundsPerAcre} M/Ac` : '—'}
          subtitle={mostEfficient ? `${mostEfficient.farmerName} (${mostEfficient.totalAcres} Acres)` : 'No data'}
          icon={Sparkles}
        />
        <MetricCard
          title="Avg Lab Moisture"
          value={`${avgMoisture}%`}
          subtitle="Safe storage tolerance (&lt;12%)"
          icon={Droplets}
        />
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search harvest code, farmer, silo location..."
        filters={[
          {
            id: 'grade',
            placeholder: 'All Quality Grades',
            value: gradeFilter,
            onChange: (v) => {
              setGradeFilter(v);
              setCurrentPage(1);
            },
            options: [
              { label: 'All Quality Grades', value: 'ALL' },
              { label: 'Grade A Premium', value: 'GRADE_A_PREMIUM' },
              { label: 'Grade B Standard', value: 'GRADE_B_STANDARD' },
              { label: 'Grade C Feed Wheat', value: 'GRADE_C_FEED' },
            ],
          },
          {
            id: 'status',
            placeholder: 'All Storage Statuses',
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            },
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Stored in Silo', value: 'STORED_IN_SILO' },
              { label: 'Inspected', value: 'INSPECTED' },
              { label: 'Delivered to Mill', value: 'DELIVERED_TO_MILL' },
              { label: 'Pending Delivery', value: 'PENDING_DELIVERY' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setGradeFilter('ALL');
          setStatusFilter('ALL');
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content Area */}
      {activeTab === 'COMPARISON' ? (
        /* FARMER HARVEST YIELD COMPARISON & RANKINGS VIEW */
        farmerComparisonList.length === 0 ? (
          <EmptyState
            title="No Farmer Yield Data Found"
            description="No farmer harvest records match your search query."
          />
        ) : (
          <div className="border rounded-lg bg-card overflow-hidden shadow-xs space-y-0">
            <div className="p-4 bg-muted/20 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Farmer Procurement Yield Leaderboard & Comparison
                </h3>
                <p className="text-xs text-muted-foreground">
                  Compare total grain supplied, yield efficiency per acre, and estimated MSP procurement value.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-mono bg-background">
                {farmerComparisonList.length} Contributing Farmers
              </Badge>
            </div>

            {viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                    <TableHead className="w-16 text-center font-bold">Rank</TableHead>
                    <TableHead className="font-bold">Farmer Name & Village</TableHead>
                    <TableHead className="font-bold">Total Yield Contribution (Maunds)</TableHead>
                    <TableHead className="font-bold text-right">Metric Tons</TableHead>
                    <TableHead className="font-bold text-right">Acreage</TableHead>
                    <TableHead className="font-bold text-right">Efficiency (M/Ac)</TableHead>
                    <TableHead className="font-bold text-center">Avg Moisture</TableHead>
                    <TableHead className="font-bold">Quality Grades</TableHead>
                    <TableHead className="font-bold text-right">Est. MSP Value (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmerComparisonList.map((f, index) => {
                    const percentageOfMax = Math.round((f.totalMaunds / maxFarmerMaunds) * 100);
                    return (
                      <TableRow key={f.farmerId} className="hover:bg-muted/30 text-xs">
                        <TableCell className="text-center font-bold">
                          {index === 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/15 text-amber-600 font-extrabold text-xs">
                              🥇 1
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/40 text-slate-700 dark:text-slate-300 font-extrabold text-xs">
                              🥈 2
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/15 text-amber-700 dark:text-amber-500 font-extrabold text-xs">
                              🥉 3
                            </span>
                          ) : (
                            <span className="font-mono text-muted-foreground">#{index + 1}</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-foreground text-sm">{f.farmerName}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <span>{f.village}</span>
                            <span>&bull;</span>
                            <span>{f.harvestCount} Delivery Receipt{f.harvestCount > 1 ? 's' : ''}</span>
                          </div>
                        </TableCell>

                        <TableCell className="min-w-[200px]">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-foreground mb-1">
                            <span>{f.totalMaunds.toLocaleString()} Maunds</span>
                            <span className="text-[10px] text-muted-foreground font-normal">{percentageOfMax}% of top</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percentageOfMax}%` }}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {(f.totalKg / 1000).toFixed(1)} MT
                        </TableCell>

                        <TableCell className="text-right font-mono text-muted-foreground">
                          {f.totalAcres} Ac
                        </TableCell>

                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`font-mono text-xs font-bold ${
                              f.efficiencyMaundsPerAcre >= 50
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {f.efficiencyMaundsPerAcre} M/Ac
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center font-mono">
                          <span className={f.avgMoisturePct <= 11.5 ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                            {f.avgMoisturePct}%
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {f.grades.map((g) => (
                              <Badge key={g} variant="outline" className="text-[10px]">
                                {g.replace(/GRADE_|_PREMIUM|_STANDARD|_FEED/g, '')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹ {f.estPayout.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              /* Comparison Cards View */
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {farmerComparisonList.map((f, index) => {
                  const percentageOfMax = Math.round((f.totalMaunds / maxFarmerMaunds) * 100);
                  return (
                    <Card key={f.farmerId} className="border hover:border-primary/40 transition-all shadow-xs">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                              #{index + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{f.farmerName}</h4>
                              <p className="text-[11px] text-muted-foreground">{f.village}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-mono text-xs text-emerald-600 bg-emerald-500/10">
                            {f.efficiencyMaundsPerAcre} M/Ac
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground text-[11px]">Total Yield:</span>
                            <span className="font-mono font-bold text-foreground">
                              {f.totalMaunds.toLocaleString()} Maunds ({(f.totalKg / 1000).toFixed(1)} MT)
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${percentageOfMax}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t text-muted-foreground">
                          <div>
                            <span className="text-[10px] block uppercase">Harvested Land</span>
                            <span className="font-mono font-semibold text-foreground">{f.totalAcres} Acres</span>
                          </div>
                          <div>
                            <span className="text-[10px] block uppercase">Avg Moisture</span>
                            <span className="font-mono font-semibold text-foreground">{f.avgMoisturePct}%</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t flex items-center justify-between text-xs">
                          <span className="text-muted-foreground text-[11px]">Est. MSP Payout</span>
                          <span className="font-mono font-bold text-emerald-600">₹ {f.estPayout.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )
      ) : (
        /* ALL HARVEST INDIVIDUAL LOGS VIEW */
        filteredHarvests.length === 0 ? (
          <EmptyState
            title="No Harvest Records Found"
            description="No wheat harvest batch entries match your search criteria."
            action={{
              label: 'Record Harvest Intake',
              onClick: () => {
                if (farmers.length > 0 && !farmerId) setFarmerId(farmers[0].id);
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
                  <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                    <TableHead className="font-bold">Harvest Code & Farmer</TableHead>
                    <TableHead className="font-bold">Harvest Date</TableHead>
                    <TableHead className="font-bold text-right">Harvested Acres</TableHead>
                    <TableHead className="font-bold text-right">Yield (Maunds)</TableHead>
                    <TableHead className="font-bold text-right">Total Metric Tons</TableHead>
                    <TableHead className="font-bold text-center">Moisture %</TableHead>
                    <TableHead className="font-bold">Quality Grade</TableHead>
                    <TableHead className="font-bold">Assigned Silo</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHarvests.map((h) => (
                    <TableRow key={h.id} className="hover:bg-muted/30 text-xs">
                      <TableCell>
                        <div className="font-mono font-bold text-foreground">{h.harvestCode}</div>
                        <div className="text-[11px] text-muted-foreground">{h.farmerName}</div>
                      </TableCell>

                      <TableCell className="font-mono text-[11px] text-muted-foreground">{h.harvestDate}</TableCell>

                      <TableCell className="text-right font-mono">{h.acreageHarvested} Ac</TableCell>

                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {h.totalWeightMaunds.toLocaleString()} M
                      </TableCell>

                      <TableCell className="text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {(h.totalWeightKg / 1000).toFixed(1)} MT
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold">
                        <span className={h.grainMoisturePct <= 11.5 ? 'text-emerald-600' : 'text-amber-600'}>
                          {h.grainMoisturePct}%
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            h.grainQualityGrade === 'GRADE_A_PREMIUM'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-muted'
                          }
                        >
                          {h.grainQualityGrade.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-[11px] font-medium text-foreground max-w-[150px] truncate">
                          {h.procurementCenterAssigned}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={h.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              /* Card Grid View */
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {paginatedHarvests.map((h) => (
                  <Card key={h.id} className="border hover:border-primary/40 transition-all shadow-xs">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-xs text-primary block">{h.harvestCode}</span>
                          <h4 className="font-bold text-sm text-foreground mt-0.5">{h.farmerName}</h4>
                          <p className="text-[11px] text-muted-foreground">{h.procurementCenterAssigned}</p>
                        </div>
                        <StatusBadge status={h.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t">
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Total Yield:</span>
                          <span className="font-bold font-mono text-foreground">
                            {h.totalWeightMaunds} Maunds ({(h.totalWeightKg / 1000).toFixed(1)} MT)
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-muted-foreground block">Lab Moisture:</span>
                          <span className="font-bold font-mono text-emerald-600">{h.grainMoisturePct}%</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {h.grainQualityGrade.replace(/_/g, ' ')}
                        </Badge>
                        <span className="font-mono text-[11px] text-muted-foreground">{h.harvestDate}</span>
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
        )
      )}

      {/* Record Harvest Intake Dialog */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Record Wheat Harvest Intake</DialogTitle>
            <DialogDescription className="text-xs">
              Record final grain yield, lab moisture percentage, and assign storage silo batch.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHarvest} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Select Farmer *</Label>
                <SearchableSelect
                  options={farmerOptions}
                  value={farmerId}
                  onChange={(val) => setFarmerId(val)}
                  placeholder="Select Farmer..."
                  searchPlaceholder="Search farmer name, village..."
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvest Date *</Label>
                <Input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvested Acres *</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={acres}
                  onChange={(e) => setAcres(parseFloat(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Yield (Maunds) *</Label>
                <Input
                  type="number"
                  value={maundsYield}
                  onChange={(e) => setMaundsYield(parseFloat(e.target.value) || 1)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Moisture (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={moisture}
                  onChange={(e) => setMoisture(parseFloat(e.target.value) || 10)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Harvesting Method</Label>
                <Select
                  value={method}
                  onValueChange={(v) => {
                    if (v !== null) setMethod(v as any);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MECHANICAL_HARVESTER">Combine Mechanical Harvester</SelectItem>
                    <SelectItem value="MANUAL_COMBINE">Manual Cutting & Thresher</SelectItem>
                    <SelectItem value="REAPER">Tractor Mounted Reaper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Quality Grade</Label>
                <Select
                  value={grade}
                  onValueChange={(v) => {
                    if (v !== null) setGrade(v as any);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GRADE_A_PREMIUM">Grade A Premium (Clean, &gt;92% Gluten)</SelectItem>
                    <SelectItem value="GRADE_B_STANDARD">Grade B Standard</SelectItem>
                    <SelectItem value="GRADE_C_FEED">Grade C Feed Wheat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assigned Procurement Silo</Label>
              <Input
                value={silo}
                onChange={(e) => setSilo(e.target.value)}
                placeholder="e.g. Salarwala Strategic Grain Silo #4"
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Record Harvest Intake
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
