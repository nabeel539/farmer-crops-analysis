'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ActivityRecord, useCreateActivityMutation } from '@/store/api/activityApi';
import { CropCycleRecord } from '@/store/api/cropCycleApi';
import { Farmer } from '@/store/api/farmerApi';
import {
  BookOpen,
  Plus,
  Droplets,
  Sprout,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  IndianRupee,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FarmerActivityLoggerProps {
  farmer: Farmer;
  cropCycles: CropCycleRecord[];
  activities: ActivityRecord[];
  isLoading: boolean;
}

const activitySchema = z.object({
  activity_type: z.enum([
    'IRRIGATION',
    'FERTILIZER_UREA',
    'FERTILIZER_DAP',
    'FERTILIZER_POTASH',
    'PESTICIDE_SPRAY',
    'WEEDICIDE_SPRAY',
    'SOIL_TEST',
    'FIELD_VISIT_INSPECTION',
  ]),
  dosage_or_volume: z.string().min(2, 'Dosage / volume details are required'),
  cost: z.number().min(0, 'Cost cannot be negative'),
  executed_date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

const OPERATION_TEMPLATES = [
  {
    type: 'IRRIGATION' as const,
    label: 'Canal / Tubewell Irrigation (पहला/दूसरा पानी)',
    defaultDosage: '3 Acre-Inches Rauni Irrigation',
    defaultCost: 1500,
  },
  {
    type: 'FERTILIZER_UREA' as const,
    label: 'Urea Top-Dressing (यूरिया खाद)',
    defaultDosage: '1 Bag Urea (45 KG) per Acre',
    defaultCost: 270,
  },
  {
    type: 'FERTILIZER_DAP' as const,
    label: 'DAP Basal Fertilizer (डीएपी)',
    defaultDosage: '1 Bag DAP (50 KG) per Acre',
    defaultCost: 1350,
  },
  {
    type: 'PESTICIDE_SPRAY' as const,
    label: 'Fungicide / Rust Spray (पीला रतुआ स्प्रे)',
    defaultDosage: 'Propiconazole 25 EC @ 200ml / Acre',
    defaultCost: 650,
  },
];

export function FarmerActivityLogger({
  farmer,
  cropCycles,
  activities,
  isLoading,
}: FarmerActivityLoggerProps) {
  const [createActivity, { isLoading: isSubmitting }] = useCreateActivityMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  const activeCycle = cropCycles[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: 'IRRIGATION',
      dosage_or_volume: '3 Acre-Inches Canal Water',
      cost: 1200,
      executed_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      await createActivity({
        farmer_id: farmer.id,
        crop_cycle_id: activeCycle?.id || null,
        field_id: activeCycle?.field_id || null,
        activity_type: data.activity_type,
        scheduled_date: data.executed_date,
        dosage_or_volume: data.dosage_or_volume,
        cost: data.cost,
        logged_by_role: 'FARMER',
        logged_by_name: farmer.name,
        notes: data.notes || null,
        recommendation_adherence: true,
      }).unwrap();

      toast.success('Activity logged in your Kisan Diary successfully!');
      reset();
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.detail || 'Failed to log field activity. Please try again.');
    }
  };

  const applyTemplate = (template: typeof OPERATION_TEMPLATES[0]) => {
    setValue('activity_type', template.type);
    setValue('dosage_or_volume', template.defaultDosage);
    setValue('cost', template.defaultCost);
  };

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'ALL') return true;
    return act.activity_type === filterType;
  });

  const totalSpent = activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card with Quick Stats & Action */}
      <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20 dark:to-background shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Kisan Field Diary (किसान डायरी)
                </CardTitle>
                <CardDescription className="text-xs">
                  Self-log irrigation, fertilizers, sprays, and expenditures with digital verification.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger render={
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>+ Log Field Operation</span>
                  </Button>
                } />

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                      Log Operation in Kisan Diary
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Record field activity for {farmer.name} ({activeCycle?.cycle_code || 'General Plot'}).
                    </DialogDescription>
                  </DialogHeader>

                  {/* Quick Preset Chips */}
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Quick Presets</Label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {OPERATION_TEMPLATES.map((tmpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => applyTemplate(tmpl)}
                          className="p-2 rounded-lg border border-border/80 bg-muted/40 hover:bg-emerald-50 hover:border-emerald-500/40 dark:hover:bg-emerald-950/30 text-left text-[11px] transition-colors"
                        >
                          <div className="font-semibold text-foreground truncate">{tmpl.label}</div>
                          <div className="text-[10px] text-muted-foreground">{tmpl.defaultDosage}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                    {/* Operation Type */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Operation Type *</Label>
                      <Controller
                        name="activity_type"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Select Operation" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IRRIGATION">Canal / Tubewell Irrigation</SelectItem>
                              <SelectItem value="FERTILIZER_UREA">Urea Nitrogen Top-Dressing</SelectItem>
                              <SelectItem value="FERTILIZER_DAP">DAP Basal Fertilizer</SelectItem>
                              <SelectItem value="FERTILIZER_POTASH">MOP Potash Application</SelectItem>
                              <SelectItem value="PESTICIDE_SPRAY">Fungicide / Rust Spray</SelectItem>
                              <SelectItem value="WEEDICIDE_SPRAY">Weedicide Herbicide Spray</SelectItem>
                              <SelectItem value="SOIL_TEST">Soil Sampling & Testing</SelectItem>
                              <SelectItem value="FIELD_VISIT_INSPECTION">Field Scouting & Verification</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.activity_type && (
                        <p className="text-[11px] text-red-500">{errors.activity_type.message}</p>
                      )}
                    </div>

                    {/* Dosage / Quantity */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Dosage / Material Used *</Label>
                      <Input
                        {...register('dosage_or_volume')}
                        placeholder="e.g. 1 Bag Urea (45 KG) or 3 Acre Inches"
                        className="text-xs"
                      />
                      {errors.dosage_or_volume && (
                        <p className="text-[11px] text-red-500">{errors.dosage_or_volume.message}</p>
                      )}
                    </div>

                    {/* Date & Cost Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Execution Date *</Label>
                        <Input
                          type="date"
                          {...register('executed_date')}
                          className="text-xs"
                        />
                        {errors.executed_date && (
                          <p className="text-[11px] text-red-500">{errors.executed_date.message}</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Cost (₹) *</Label>
                        <Input
                          type="number"
                          step="50"
                          {...register('cost', { valueAsNumber: true })}
                          className="text-xs"
                        />
                        {errors.cost && (
                          <p className="text-[11px] text-red-500">{errors.cost.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Observations / Remarks</Label>
                      <Textarea
                        {...register('notes')}
                        placeholder="e.g. Soil moisture level, weather condition, crop response..."
                        className="text-xs resize-none h-16"
                      />
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDialogOpen(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        {isSubmitting ? 'Logging...' : 'Save to Diary'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        {/* Expenditure & Logged Operation KPIs */}
        <CardContent className="pt-2 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-background border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Operations</div>
                <div className="text-lg font-bold font-mono">{activities.length} Logged</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border/80 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <IndianRupee className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Cumulative Inputs Cost</div>
                <div className="text-lg font-bold font-mono">₹{totalSpent.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-background border border-border/80 col-span-2 sm:col-span-1 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Package Compliance</div>
                <div className="text-lg font-bold font-mono text-emerald-600">100% Adherent</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'IRRIGATION', 'FERTILIZER_APPLICATION', 'PESTICIDE_SPRAY'].map((type) => (
          <Button
            key={type}
            size="sm"
            variant={filterType === type ? 'default' : 'outline'}
            onClick={() => setFilterType(type)}
            className={`text-xs h-8 ${
              filterType === type
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'text-muted-foreground'
            }`}
          >
            {type.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      {/* Activity Timeline List */}
      {filteredActivities.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">No Operations in this Category</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Click "+ Log Field Operation" above to record your latest irrigation, fertilizer, or spray activity.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((act) => (
            <Card key={act.id} className="border border-border/80 hover:border-emerald-500/40 transition-all shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0 mt-0.5">
                    {act.activity_type.includes('IRRIGATION') ? (
                      <Droplets className="h-5 w-5" />
                    ) : act.activity_type.includes('FERTILIZER') ? (
                      <Sprout className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {act.activity_type.replace(/_/g, ' ')}
                      </span>
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        {act.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground font-medium">
                      Dosage: <span className="font-bold text-emerald-700 dark:text-emerald-400">{act.dosage_or_volume}</span>
                    </p>
                    {act.notes && (
                      <p className="text-[11px] text-muted-foreground italic">
                        &ldquo;{act.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50 text-xs">
                  <span className="font-mono font-bold text-foreground text-sm">₹{act.cost || 0}</span>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Calendar className="h-3 w-3" />
                    {act.executed_date || act.scheduled_date || format(new Date(act.created_at), 'dd MMM yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
