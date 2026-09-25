'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  addActivity,
  completeActivity,
  deleteActivity,
  setActivitySearchQuery,
  setActivityTypeFilter,
  setActivityStatusFilter,
} from '@/store/slices/activitiesSlice';
import { FieldActivity, ActivityType } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
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
  CalendarCheck,
  Plus,
  Droplets,
  Sprout,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  ClipboardList,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ActivitiesPage() {
  const dispatch = useAppDispatch();
  const { activities, searchQuery, typeFilter, statusFilter } = useAppSelector(
    (state) => state.activities
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);

  // Pagination & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<FieldActivity | null>(null);

  // Form State
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [actType, setActType] = useState<ActivityType>('IRRIGATION');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState('3 Acre-Inches Tube-well Water');
  const [instructions, setInstructions] = useState('Ensure uniform standing water before CRI stage.');

  // Complete Form State
  const [execDate, setExecDate] = useState(new Date().toISOString().split('T')[0]);
  const [execNotes, setExecNotes] = useState('Completed satisfactorily under field officer supervision.');

  // Filter Logic
  const filteredActivities = activities.filter((act) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (act.activityCode || '').toLowerCase().includes(q) ||
      (act.farmerName || '').toLowerCase().includes(q) ||
      (act.fieldParcelCode || '').toLowerCase().includes(q) ||
      (act.prescribedInstructions || act.notes || '').toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || act.activityType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination Slicing
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCompleted = activities.filter((a) => a.status === 'COMPLETED').length;
  const totalScheduled = activities.filter((a) => a.status === 'SCHEDULED').length;
  const totalOverdue = activities.filter((a) => a.status === 'OVERDUE').length;

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId) {
      toast.error('Mandatory field required: Please select a farmer');
      return;
    }
    const selFarmer = farmers.find((f) => f.id === farmerId);

    const newAct: FieldActivity = {
      id: `act-${Date.now()}`,
      activityCode: `ACT-2026-${Math.floor(100 + Math.random() * 900)}`,
      cropCycleId: 'cycle-101',
      farmerId,
      farmerName: selFarmer ? selFarmer.fullName : 'Ramesh Patel',
      fieldParcelId: 'prcl-01',
      fieldParcelCode: 'PRCL-001',
      activityType: actType,
      targetStage: 'TILLERING',
      scheduledDate,
      executedDate: null,
      status: 'SCHEDULED',
      dosageOrQuantity: dosage,
      prescribedInstructions: instructions,
      loggedByRole: 'SUPER_ADMIN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addActivity(newAct));
    toast.success(`Agronomic task ${newAct.activityCode} prescribed!`);
    setAddModalOpen(false);
  };

  const handleOpenCompleteModal = (act: FieldActivity) => {
    setSelectedActivity(act);
    setExecDate(new Date().toISOString().split('T')[0]);
    setCompleteModalOpen(true);
  };

  const handleSaveComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    dispatch(
      completeActivity({
        id: selectedActivity.id,
        executedDate: execDate,
        notes: execNotes,
      })
    );
    toast.success(`Activity ${selectedActivity.activityCode} marked as COMPLETED`);
    setCompleteModalOpen(false);
  };

  const farmerOptions = farmers.map((f) => ({
    value: f.id,
    label: f.fullName,
    subLabel: `${f.village} (${f.wheatAcreage || 5} Acres)`,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Agronomic Operations & Field Logging"
        description="Prescribe and track irrigation scheduling, fertilizer split top-dressing, and fungicide spray tasks."
        actionButton={{
          label: 'Schedule Field Operation',
          icon: Plus,
          onClick: () => {
            if (farmers.length > 0 && !farmerId) setFarmerId(farmers[0].id);
            setAddModalOpen(true);
          },
        }}
      />

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Scheduled Tasks"
          value={activities.length}
          subtitle="Seasonal Wheat Prescriptions"
          icon={ClipboardList}
          variant="primary"
        />
        <MetricCard
          title="Completed Operations"
          value={totalCompleted}
          subtitle="Verified by Field Officers"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Pending Action"
          value={totalScheduled}
          subtitle="Awaiting Field Execution"
          icon={Clock}
        />
        <MetricCard
          title="Overdue Tasks"
          value={totalOverdue}
          subtitle="Requires Urgent Follow-up"
          icon={ShieldAlert}
        />
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          dispatch(setActivitySearchQuery(q));
          setCurrentPage(1);
        }}
        searchPlaceholder="Search task code, farmer, instructions..."
        filters={[
          {
            id: 'type',
            placeholder: 'All Operation Types',
            value: typeFilter,
            onChange: (v) => {
              dispatch(setActivityTypeFilter(v));
              setCurrentPage(1);
            },
            options: [
              { label: 'All Operation Types', value: 'ALL' },
              { label: 'Irrigation', value: 'IRRIGATION' },
              { label: 'Urea Fertilizer', value: 'FERTILIZER_UREA' },
              { label: 'DAP Fertilizer', value: 'FERTILIZER_DAP' },
              { label: 'Pesticide Spray', value: 'PESTICIDE_SPRAY' },
              { label: 'Weedicide Spray', value: 'WEEDICIDE_SPRAY' },
              { label: 'Field Visit', value: 'FIELD_VISIT_INSPECTION' },
            ],
          },
          {
            id: 'status',
            placeholder: 'All Statuses',
            value: statusFilter,
            onChange: (v) => {
              dispatch(setActivityStatusFilter(v));
              setCurrentPage(1);
            },
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Overdue', value: 'OVERDUE' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setActivitySearchQuery(''));
          dispatch(setActivityTypeFilter('ALL'));
          dispatch(setActivityStatusFilter('ALL'));
          setCurrentPage(1);
        }}
      />

      {/* Activities Table */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          title="No Field Activities Found"
          description="No agronomic operations match your current search criteria."
          action={{
            label: 'Schedule First Operation',
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
                  <TableHead className="font-bold">Task Code & Farmer</TableHead>
                  <TableHead className="font-bold">Operation Type</TableHead>
                  <TableHead className="font-bold">Prescribed Dosage / Inputs</TableHead>
                  <TableHead className="font-bold">Scheduled Date</TableHead>
                  <TableHead className="font-bold">Executed Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right">Execution Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActivities.map((act) => (
                  <TableRow key={act.id} className="hover:bg-muted/30 text-xs">
                    <TableCell>
                      <div className="font-mono font-bold text-foreground">{act.activityCode}</div>
                      <div className="text-[11px] text-muted-foreground font-semibold">
                        {act.farmerName} ({act.fieldParcelCode})
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-semibold bg-muted/60">
                        {act.activityType.replace(/_/g, ' ')}
                      </Badge>
                      <div className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] truncate">
                        {act.prescribedInstructions}
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-foreground text-xs">{act.dosageOrQuantity}</span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-[11px] text-muted-foreground">{act.scheduledDate}</span>
                    </TableCell>

                    <TableCell>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {act.executedDate || '—'}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={act.status} />
                    </TableCell>

                    <TableCell className="text-right">
                      {act.status !== 'COMPLETED' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCompleteModal(act)}
                          className="h-7 text-xs font-semibold gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark Complete
                        </Button>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10"
                        >
                          Verified Complete
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            /* Card Grid View */
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {paginatedActivities.map((act) => (
                <Card key={act.id} className="border hover:border-primary/40 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs text-primary block">
                          {act.activityCode}
                        </span>
                        <h4 className="font-bold text-sm text-foreground mt-0.5">{act.farmerName}</h4>
                        <p className="text-[11px] text-muted-foreground">{act.fieldParcelCode}</p>
                      </div>
                      <StatusBadge status={act.status} />
                    </div>

                    <div className="space-y-1.5 pt-1 border-t text-xs">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Operation & Dosage:</span>
                        <span className="font-bold text-foreground">
                          {act.activityType.replace(/_/g, ' ')} &bull; {act.dosageOrQuantity}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {act.prescribedInstructions}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted-foreground">{act.scheduledDate}</span>
                      {act.status !== 'COMPLETED' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCompleteModal(act)}
                          className="h-7 text-xs font-semibold gap-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </Button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-600">Done</span>
                      )}
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

      {/* Schedule Operation Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Schedule Agronomic Field Operation</DialogTitle>
            <DialogDescription className="text-xs">
              Prescribe field spray, irrigation, or nutrient top-dressing for enrolled grower.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateActivity} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Farmer & Field *</Label>
              <SearchableSelect
                options={farmerOptions}
                value={farmerId}
                onChange={(val) => setFarmerId(val)}
                placeholder="Select Farmer..."
                searchPlaceholder="Search farmer name, village..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Operation Type</Label>
                <Select
                  value={actType}
                  onValueChange={(v) => {
                    if (v !== null) setActType(v as ActivityType);
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IRRIGATION">Canal/Tubewell Irrigation</SelectItem>
                    <SelectItem value="FERTILIZER_UREA">Urea Split Top-Dressing</SelectItem>
                    <SelectItem value="FERTILIZER_DAP">DAP Basal Fertilizer</SelectItem>
                    <SelectItem value="FERTILIZER_POTASH">Soluble Potash (SOP) Spray</SelectItem>
                    <SelectItem value="PESTICIDE_SPRAY">Fungicide Rust Spray</SelectItem>
                    <SelectItem value="WEEDICIDE_SPRAY">Weedicide Herbicide Spray</SelectItem>
                    <SelectItem value="FIELD_VISIT_INSPECTION">Field Walkthrough Inspection</SelectItem>
                    <SelectItem value="SOIL_TEST">Soil Chemistry Sampling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 min-w-0">
                <Label className="text-xs font-semibold">Scheduled Target Date *</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Prescribed Dosage / Inputs *</Label>
              <Input
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 Bag Urea per Acre (45kg)"
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Technical Instructions for Farmer / Field Officer</Label>
              <Textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instructions on soil moisture condition, spray nozzle pressure..."
                className="text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold gap-1.5">
                <CalendarCheck className="h-4 w-4" />
                Schedule Operation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete Operation Modal */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Mark Operation as Completed</DialogTitle>
            <DialogDescription className="text-xs">
              Confirm field execution for <strong className="font-mono">{selectedActivity?.activityCode}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <form onSubmit={handleSaveComplete} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-xs font-medium">
                <p>
                  Farmer: <span className="font-bold text-foreground">{selectedActivity.farmerName}</span>
                </p>
                <p>
                  Operation: <span className="font-bold text-foreground">{selectedActivity.activityType.replace(/_/g, ' ')}</span>
                </p>
                <p>
                  Prescription: <span className="text-muted-foreground">{selectedActivity.dosageOrQuantity}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Actual Execution Date</Label>
                <Input
                  type="date"
                  value={execDate}
                  onChange={(e) => setExecDate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Field Verification Notes</Label>
                <Textarea
                  rows={3}
                  value={execNotes}
                  onChange={(e) => setExecNotes(e.target.value)}
                  placeholder="Notes on application uniformity, weather condition, crop response..."
                  className="text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setCompleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Completion
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
