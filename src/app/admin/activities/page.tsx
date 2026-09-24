'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
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
import {
  CalendarCheck,
  Plus,
  Droplets,
  Sprout,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { toast } from 'sonner';

export default function ActivitiesPage() {
  const dispatch = useAppDispatch();
  const { activities, searchQuery, typeFilter, statusFilter } = useAppSelector(
    (state) => state.activities
  );
  const farmers = useAppSelector((state) => state.farmers.farmers);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<FieldActivity | null>(null);

  // Form State for Log Activity
  const [farmerId, setFarmerId] = useState(farmers[0]?.id || '');
  const [actType, setActType] = useState<ActivityType>('IRRIGATION');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState('');
  const [cost, setCost] = useState(4500);
  const [notes, setNotes] = useState('');

  // Completion Form State
  const [execDate, setExecDate] = useState(new Date().toISOString().split('T')[0]);
  const [execNotes, setExecNotes] = useState('');

  // Filter Logic
  const filteredActivities = activities.filter((a) => {
    const matchesSearch =
      searchQuery === '' ||
      a.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.dosageOrVolume && a.dosageOrVolume.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.notes && a.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || a.activityType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;
  const overdueCount = activities.filter((a) => a.status === 'OVERDUE').length;
  const adherencePct = Math.round(
    (activities.filter((a) => a.recommendationAdherence).length / (activities.length || 1)) * 100
  );

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const selFarmer = farmers.find(f => f.id === farmerId) || farmers[0];
    const newAct: FieldActivity = {
      id: `ACT-${String(activities.length + 1).padStart(3, '0')}`,
      cropCycleId: 'CYCLE-001',
      farmerId: selFarmer.id,
      farmerName: selFarmer.fullName,
      fieldParcelId: 'PRCL-001',
      activityType: actType,
      scheduledDate: scheduledDate,
      status: 'PENDING',
      dosageOrVolume: dosage || 'Standard recommended dosage',
      cost: Number(cost) || 0,
      loggedByRole: 'AGRI_MANAGER',
      loggedByName: 'Dr. Ayesha Siddiqa',
      notes: notes,
      recommendationAdherence: true
    };

    dispatch(addActivity(newAct));
    toast.success(`Scheduled ${actType.replace(/_/g, ' ')} for ${selFarmer.fullName}!`);
    setAddModalOpen(false);
  };

  const handleCompleteActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedActivity) {
      dispatch(completeActivity({
        id: selectedActivity.id,
        executedDate: execDate,
        notes: execNotes || selectedActivity.notes
      }));
      toast.success(`Activity marked as COMPLETED!`);
      setCompleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Field Agronomic Activities Log"
        description="Schedule and verify critical wheat field operations: irrigation scheduling, split nitrogen top-dressing, and disease sprays."
        actionButton={{
          label: 'Log Field Operation',
          icon: Plus,
          onClick: () => setAddModalOpen(true),
        }}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Logged Activities"
          value={activities.length}
          subtitle={`${completedCount} Executed & Verified`}
          icon={ClipboardList}
          variant="primary"
        />
        <MetricCard
          title="Agronomic Adherence"
          value={`${adherencePct}%`}
          subtitle="Compliance with SOP guidance"
          icon={Sparkles}
          trend={{ value: '6%', isPositive: true, label: 'improved adherence' }}
        />
        <MetricCard
          title="Irrigation Events"
          value={activities.filter(a => a.activityType.includes('IRRIGATION')).length}
          subtitle="Rauni, CRI, Heading irrigations"
          icon={Droplets}
        />
        <MetricCard
          title="Overdue Interventions"
          value={overdueCount}
          subtitle="Requires field officer dispatch"
          icon={ShieldAlert}
          variant={overdueCount > 0 ? 'accent' : 'default'}
        />
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => dispatch(setActivitySearchQuery(q))}
        searchPlaceholder="Search farmer, activity type, dosage..."
        filters={[
          {
            id: 'type',
            placeholder: 'All Activity Types',
            value: typeFilter,
            onChange: (v) => dispatch(setActivityTypeFilter(v)),
            options: [
              { label: 'All Types', value: 'ALL' },
              { label: 'Irrigation', value: 'IRRIGATION' },
              { label: 'Fertilizer Urea', value: 'FERTILIZER_UREA' },
              { label: 'Fertilizer DAP', value: 'FERTILIZER_DAP' },
              { label: 'Fertilizer Potash', value: 'FERTILIZER_POTASH' },
              { label: 'Fungicide Spray', value: 'PESTICIDE_SPRAY' },
              { label: 'Weedicide Spray', value: 'WEEDICIDE_SPRAY' },
              { label: 'Field Inspection', value: 'FIELD_VISIT_INSPECTION' },
              { label: 'Soil Test', value: 'SOIL_TEST' },
            ],
          },
          {
            id: 'status',
            placeholder: 'All Statuses',
            value: statusFilter,
            onChange: (v) => dispatch(setActivityStatusFilter(v)),
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Overdue', value: 'OVERDUE' },
            ],
          },
        ]}
        onReset={() => {
          dispatch(setActivitySearchQuery(''));
          dispatch(setActivityTypeFilter('ALL'));
          dispatch(setActivityStatusFilter('ALL'));
        }}
      />

      {/* Activities Table */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          title="No Field Activities Found"
          description="No agronomic operations match your search criteria."
          action={{
            label: 'Schedule New Activity',
            onClick: () => setAddModalOpen(true),
            icon: Plus,
          }}
        />
      ) : (
        <div className="border rounded-2xl bg-card overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-transparent text-xs">
                <TableHead className="font-bold">Operation / Farmer</TableHead>
                <TableHead className="font-bold">Dosage & Inputs</TableHead>
                <TableHead className="font-bold">Scheduled / Executed Date</TableHead>
                <TableHead className="font-bold">Logged By</TableHead>
                <TableHead className="font-bold">SOP Compliance</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((act) => (
                <TableRow key={act.id} className="hover:bg-muted/30 text-xs">
                  <TableCell>
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      {act.activityType.includes('IRRIGATION') ? (
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                      ) : act.activityType.includes('FERTILIZER') ? (
                        <Sprout className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <CalendarCheck className="h-3.5 w-3.5 text-purple-500" />
                      )}
                      {act.activityType.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {act.farmerName} &bull; {act.cropCycleId}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-medium text-foreground max-w-xs truncate">
                      {act.dosageOrVolume || 'Standard application'}
                    </div>
                    {act.notes && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                        "{act.notes}"
                      </p>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="font-mono text-xs">
                      {act.executedDate ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          Done: {act.executedDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Due: {act.scheduledDate}</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-foreground font-medium">{act.loggedByName}</div>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-3.5 font-mono">
                      {act.loggedByRole}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {act.recommendationAdherence ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Compliant
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[10px] gap-1">
                        <ShieldAlert className="h-3 w-3" />
                        Deviation
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={act.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    {act.status !== 'COMPLETED' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-semibold text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => {
                          setSelectedActivity(act);
                          setExecNotes(act.notes || '');
                          setCompleteModalOpen(true);
                        }}
                      >
                        Mark Executed
                      </Button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground font-mono">Verified</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Schedule Activity Modal */}
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
              <Label className="text-xs font-semibold">Select Farmer & Field</Label>
              <Select value={farmerId} onValueChange={(v) => { if (v !== null) setFarmerId(v); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.fullName} &bull; {f.village} ({f.wheatAcreage} Ac)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operation Type</Label>
                <Select value={actType} onValueChange={(v) => { if (v !== null) setActType(v as ActivityType); }}>
                  <SelectTrigger>
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Scheduled Target Date</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Dosage / Chemical / Volume</Label>
                <Input
                  placeholder="e.g. 1 Bag Urea per acre"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Cost (₹)</Label>
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Agronomic Instructions & SOP Notes</Label>
              <Textarea
                placeholder="Specific guidance for field officer or farmer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold">
                Schedule Operation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete Execution Dialog */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedActivity && (
            <form onSubmit={handleCompleteActivity} className="space-y-4 pt-2">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Verify Operation Execution</DialogTitle>
                <DialogDescription className="text-xs">
                  Confirm physical execution of {selectedActivity.activityType.replace(/_/g, ' ')} for {selectedActivity.farmerName}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Actual Execution Date</Label>
                <Input
                  type="date"
                  value={execDate}
                  onChange={(e) => setExecDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Field Observation Notes</Label>
                <Textarea
                  placeholder="Canopy condition, moisture level, nozzle pressure, etc."
                  value={execNotes}
                  onChange={(e) => setExecNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setCompleteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="font-semibold gap-1.5">
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
