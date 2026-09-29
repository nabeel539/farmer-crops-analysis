'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchFilterBar } from '@/components/shared/SearchFilterBar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { MetricCard } from '@/components/shared/MetricCard';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import DataTablePagination, { ViewMode } from '@/components/shared/DataTablePagination';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useCompleteActivityMutation,
  useDeleteActivityMutation,
  ActivityRecord,
} from '@/store/api/activityApi';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
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
  MapPin,
  RotateCcw,
  Loader2,
  Eye,
  Camera,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';
import { format } from 'date-fns';

export default function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Pagination & View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<ActivityRecord | null>(null);

  // Form State
  const [farmerId, setFarmerId] = useState('');
  const [fieldId, setFieldId] = useState('');
  const [actType, setActType] = useState('IRRIGATION');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState('3 Acre-Inches Tube-well Water');
  const [cost, setCost] = useState(1500);
  const [instructions, setInstructions] = useState('Ensure uniform standing water before CRI stage.');

  // Complete Form State
  const [execDate, setExecDate] = useState(new Date().toISOString().split('T')[0]);
  const [execNotes, setExecNotes] = useState('Completed satisfactorily under field officer supervision.');

  // Live Backend Data
  const { data: activities = [], isLoading, isError, refetch } = useGetActivitiesQuery();
  const { data: farmers = [] } = useGetFarmersQuery();
  const { data: fields = [] } = useGetFieldsQuery();

  const [createActivity, { isLoading: isCreating }] = useCreateActivityMutation();
  const [completeActivity, { isLoading: isCompleting }] = useCompleteActivityMutation();
  const [deleteActivity, { isLoading: isDeleting }] = useDeleteActivityMutation();

  // Filter Logic
  const filteredActivities = activities.filter((act) => {
    const q = searchQuery.toLowerCase();
    const farmer = farmers.find((f) => f.id === act.farmer_id);
    const field = fields.find((f) => f.id === act.field_id);

    const matchesSearch =
      (act.id || '').toLowerCase().includes(q) ||
      (act.logged_by_name || '').toLowerCase().includes(q) ||
      (farmer?.name || '').toLowerCase().includes(q) ||
      (field?.field_name || '').toLowerCase().includes(q) ||
      (act.dosage_or_volume || '').toLowerCase().includes(q) ||
      (act.notes || '').toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || act.activity_type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination Slicing
  const totalItems = filteredActivities.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCompleted = activities.filter((a) => a.status === 'COMPLETED').length;
  const totalScheduled = activities.filter((a) => a.status === 'PENDING' || a.status === 'SCHEDULED').length;
  const totalCost = activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId) {
      toast.error('Mandatory field required: Please select a registered farmer');
      return;
    }
    const selFarmer = farmers.find((f) => f.id === farmerId);

    try {
      await createActivity({
        farmer_id: farmerId,
        field_id: fieldId || null,
        activity_type: actType,
        scheduled_date: scheduledDate,
        dosage_or_volume: dosage,
        cost: cost || 0,
        logged_by_role: 'ADMIN',
        logged_by_name: 'Administrator',
        notes: instructions,
        recommendation_adherence: true,
      }).unwrap();

      toast.success(`Agronomic task for ${selFarmer?.name || 'Farmer'} scheduled successfully!`);
      setAddModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to schedule agronomic operation'));
    }
  };

  const handleOpenCompleteModal = (act: ActivityRecord) => {
    setSelectedActivity(act);
    setExecDate(new Date().toISOString().split('T')[0]);
    setCompleteModalOpen(true);
  };

  const handleSaveComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivity) return;

    try {
      await completeActivity({
        id: selectedActivity.id,
        data: {
          executed_date: execDate,
          notes: execNotes,
          recommendation_adherence: true,
        },
      }).unwrap();

      toast.success(`Activity marked as COMPLETED!`);
      setCompleteModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to mark activity as completed'));
    }
  };

  const handleOpenDeleteModal = (act: ActivityRecord) => {
    setActivityToDelete(act);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;

    try {
      await deleteActivity(activityToDelete.id).unwrap();
      toast.success('Field activity operation record deleted successfully.');
      refetch();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to delete field activity operation'));
    } finally {
      setActivityToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const farmerOptions = farmers.map((f) => ({
    value: f.id,
    label: f.name,
    subLabel: `${f.village} (${f.mobile_number})`,
  }));

  const farmerFields = fields.filter((f) => f.farmer_id === farmerId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Agronomic Operations & Field Logging"
        description="Prescribe, monitor and review live field operations (irrigation, fertilizers, sprays) logged by farmers and field officers."
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
          title="Total Operations Logged"
          value={activities.length}
          subtitle="Real-time Farm Operations"
          icon={ClipboardList}
          variant="primary"
        />
        <MetricCard
          title="Completed Operations"
          value={totalCompleted}
          subtitle="Executed & Verified"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Pending / Scheduled"
          value={totalScheduled}
          subtitle="Awaiting Field Completion"
          icon={Clock}
        />
        <MetricCard
          title="Cumulative Cost"
          value={`₹${totalCost.toLocaleString('en-IN')}`}
          subtitle="Agronomic Expenditure"
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
        searchPlaceholder="Search farmer name, plot, notes..."
        filters={[
          {
            id: 'type',
            placeholder: 'All Operation Types',
            value: typeFilter,
            onChange: (v) => {
              setTypeFilter(v);
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
              setStatusFilter(v);
              setCurrentPage(1);
            },
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Pending / Scheduled', value: 'PENDING' },
              { label: 'Completed', value: 'COMPLETED' },
            ],
          },
        ]}
        onReset={() => {
          setSearchQuery('');
          setTypeFilter('ALL');
          setStatusFilter('ALL');
          setCurrentPage(1);
        }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Activities Table */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-3 bg-card border rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm font-semibold text-muted-foreground">Loading live agronomic operations...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          title="No Field Activities Found"
          description="No agronomic operations match your current search criteria or no activities logged yet."
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
                  <TableHead className="font-bold">Farmer & Field Plot</TableHead>
                  <TableHead className="font-bold">Operation Type</TableHead>
                  <TableHead className="font-bold">Dosage / Material</TableHead>
                  <TableHead className="font-bold">Photo</TableHead>
                  <TableHead className="font-bold">Cost (₹)</TableHead>
                  <TableHead className="font-bold">Logged By</TableHead>
                  <TableHead className="font-bold">Scheduled / Executed Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedActivities.map((act) => {
                  const farmer = farmers.find((f) => f.id === act.farmer_id);
                  const field = fields.find((f) => f.id === act.field_id);

                  return (
                    <TableRow key={act.id} className="hover:bg-muted/30 text-xs">
                      <TableCell>
                        <div className="font-bold text-foreground">
                          {farmer ? farmer.name : act.logged_by_name || 'Enrolled Farmer'}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          <span>
                            {field ? `${field.field_name} (${field.area} Ac)` : farmer?.village || 'General Plot'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-semibold bg-muted/60">
                          {act.activity_type.replace(/_/g, ' ')}
                        </Badge>
                        {act.notes && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px] truncate italic">
                            &ldquo;{act.notes}&rdquo;
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="font-medium text-foreground text-xs">{act.dosage_or_volume || '—'}</span>
                      </TableCell>

                      <TableCell>
                        {act.photo_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPhotoPreview(act.photo_url || null)}
                            className="group relative block w-8 h-8 rounded-lg overflow-hidden border border-border/80 hover:border-emerald-500 cursor-pointer shadow-xs transition-all"
                          >
                            <img
                              src={act.photo_url}
                              alt="Proof"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-3 w-3 text-white" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="font-mono font-bold text-foreground text-xs">₹{act.cost || 0}</span>
                      </TableCell>

                      <TableCell>
                        <span className="text-[11px] text-muted-foreground">
                          {act.logged_by_name} <span className="text-[10px] uppercase font-mono">({act.logged_by_role})</span>
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {act.executed_date || act.scheduled_date || format(new Date(act.created_at), 'yyyy-MM-dd')}
                        </span>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={act.status} />
                      </TableCell>

                      <TableCell className="text-right pr-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {act.status !== 'COMPLETED' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCompleteModal(act)}
                              className="h-7 text-xs font-semibold gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Mark Complete
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border-emerald-500/30">
                              Verified
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(act)}
                            title="Delete Operation Record"
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
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
              {paginatedActivities.map((act) => {
                const farmer = farmers.find((f) => f.id === act.farmer_id);
                const field = fields.find((f) => f.id === act.field_id);

                return (
                  <Card key={act.id} className="border hover:border-primary/40 transition-all shadow-xs">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2.5">
                          {act.photo_url && (
                            <button
                              type="button"
                              onClick={() => setSelectedPhotoPreview(act.photo_url || null)}
                              className="w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 hover:opacity-90 cursor-pointer"
                            >
                              <img
                                src={act.photo_url}
                                alt="Proof"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{farmer?.name || act.logged_by_name}</h4>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3 text-emerald-600" />
                              <span>{field ? `${field.field_name} (${field.area} Ac)` : farmer?.village || 'General Plot'}</span>
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={act.status} />
                      </div>

                      <div className="pt-2 border-t space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Operation:</span>
                          <span className="font-semibold">{act.activity_type.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Dosage:</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">{act.dosage_or_volume || '—'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-mono font-bold text-foreground">₹{act.cost || 0}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {act.executed_date || act.scheduled_date}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {act.status !== 'COMPLETED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenCompleteModal(act)}
                              className="h-7 text-xs font-semibold gap-1 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Complete
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(act)}
                            title="Delete Operation Record"
                            className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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

      {/* SCHEDULE FIELD OPERATION MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Schedule Agronomic Operation</DialogTitle>
            <DialogDescription className="text-xs">
              Prescribe irrigation timing, fertilizer application, or spray task for a farmer plot.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateActivity} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Target Farmer *</Label>
                <SearchableSelect
                  options={farmerOptions}
                  value={farmerId}
                  onChange={(val) => {
                    setFarmerId(val);
                    const matchedPlot = fields.find((f) => f.farmer_id === val);
                    setFieldId(matchedPlot ? matchedPlot.id : '');
                  }}
                  placeholder="Select Farmer..."
                  searchPlaceholder="Search farmer name, village..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Field Plot</Label>
                <SearchableSelect
                  options={farmerFields.map((f) => ({
                    value: f.id,
                    label: f.field_name,
                    subLabel: `${f.area} Acres (${f.crop || 'Wheat'})`,
                  }))}
                  value={fieldId}
                  onChange={(val) => setFieldId(val)}
                  placeholder={farmerFields.length === 0 ? 'No registered plots' : 'Select Field Plot (Optional)...'}
                  searchPlaceholder="Search field plot name..."
                  className="w-full text-xs font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Operation Type</Label>
                <Select value={actType} onValueChange={(val) => { if (val) setActType(val); }}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue placeholder="Select Operation Type">
                      {actType === 'IRRIGATION' ? 'Canal / Tubewell Irrigation'
                        : actType === 'FERTILIZER_UREA' ? 'Urea Split Top-Dressing'
                        : actType === 'FERTILIZER_DAP' ? 'DAP Basal Fertilizer'
                        : actType === 'FERTILIZER_POTASH' ? 'Soluble Potash (SOP) Spray'
                        : actType === 'PESTICIDE_SPRAY' ? 'Fungicide Rust Spray'
                        : actType === 'WEEDICIDE_SPRAY' ? 'Weedicide Herbicide Spray'
                        : actType === 'FIELD_VISIT_INSPECTION' ? 'Field Walkthrough Inspection'
                        : actType === 'SOIL_TEST' ? 'Soil Chemistry Sampling'
                        : actType}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IRRIGATION">Canal / Tubewell Irrigation</SelectItem>
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
                <Label className="text-xs font-semibold">Scheduled Date *</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Prescribed Dosage / Inputs *</Label>
                <Input
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 1 Bag Urea (45kg)"
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Estimated Cost (₹)</Label>
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Technical Instructions / Notes</Label>
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
              <Button type="submit" size="sm" disabled={isCreating} className="font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <CalendarCheck className="h-4 w-4" />
                {isCreating ? 'Scheduling...' : 'Schedule Operation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* COMPLETE OPERATION MODAL */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Mark Operation as Completed</DialogTitle>
            <DialogDescription className="text-xs">
              Confirm field execution and verification
            </DialogDescription>
          </DialogHeader>

          {selectedActivity && (
            <form onSubmit={handleSaveComplete} className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-muted/50 space-y-1 text-xs font-medium">
                <p>
                  Operation: <span className="font-bold text-foreground">{selectedActivity.activity_type.replace(/_/g, ' ')}</span>
                </p>
                <p>
                  Prescription: <span className="text-muted-foreground">{selectedActivity.dosage_or_volume}</span>
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
                <Button type="submit" size="sm" disabled={isCompleting} className="font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="h-4 w-4" />
                  {isCompleting ? 'Confirming...' : 'Confirm Completion'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox / Full Photo Preview Dialog */}
      <Dialog open={!!selectedPhotoPreview} onOpenChange={(open) => !open && setSelectedPhotoPreview(null)}>
        <DialogContent className="max-w-xl p-3">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              Field Activity Photo Proof
            </DialogTitle>
          </DialogHeader>
          {selectedPhotoPreview && (
            <div className="rounded-lg overflow-hidden border border-border bg-black/5 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedPhotoPreview}
                alt="Full Activity proof"
                className="w-full h-auto max-h-[65vh] object-contain rounded-md"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Agronomic Operation"
        description={`Are you sure you want to delete this ${activityToDelete?.activity_type.replace(/_/g, ' ') || 'operation'} record? This action will permanently remove it from field logs and agronomic cost totals.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Operation'}
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

