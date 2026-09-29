'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  useCreateActivityMutation,
  useDeleteActivityMutation,
  ActivityRecord,
} from '@/store/api/activityApi';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CropCycleRecord } from '@/store/api/cropCycleApi';
import { Farmer } from '@/store/api/farmerApi';
import { Field as ApiField } from '@/store/api/fieldApi';
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
  AlertTriangle,
  MapPin,
  Table as TableIcon,
  LayoutGrid,
  User,
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/utils';

interface FarmerActivityLoggerProps {
  farmer: Farmer;
  cropCycles: CropCycleRecord[];
  fields?: ApiField[];
  activities: ActivityRecord[];
  isLoading: boolean;
  onNavigateToParcels?: () => void;
}

const OPERATION_LABELS: Record<string, string> = {
  IRRIGATION: 'Canal / Tubewell Irrigation (पहला/दूसरा पानी)',
  FERTILIZER_UREA: 'Urea Nitrogen Top-Dressing (यूरिया खाद)',
  FERTILIZER_DAP: 'DAP Basal Fertilizer (डीएपी)',
  FERTILIZER_POTASH: 'MOP Potash Application (पोटाश)',
  PESTICIDE_SPRAY: 'Fungicide / Rust Spray (पीला रतुआ स्प्रे)',
  WEEDICIDE_SPRAY: 'Weedicide Herbicide Spray (खरपतवार नाशक)',
  SOIL_TEST: 'Soil Sampling & Testing (मिट्टी परीक्षण)',
  FIELD_VISIT_INSPECTION: 'Field Scouting & Verification (निरीक्षण)',
};

const activitySchema = z.object({
  field_id: z.string().min(1, 'Please select a registered field plot'),
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
  photo_url: z.string().optional(),
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
  fields = [],
  activities,
  isLoading,
  onNavigateToParcels,
}: FarmerActivityLoggerProps) {
  const [createActivity, { isLoading: isSubmitting }] = useCreateActivityMutation();
  const [deleteActivity, { isLoading: isDeleting }] = useDeleteActivityMutation();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<ActivityRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  // Photo upload states
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCycle = cropCycles[0];
  const hasNoFields = fields.length === 0;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      field_id: fields[0]?.id || '',
      activity_type: 'IRRIGATION',
      dosage_or_volume: '3 Acre-Inches Canal Water',
      cost: 1200,
      executed_date: new Date().toISOString().split('T')[0],
      notes: '',
      photo_url: '',
    },
  });

  const selectedFieldId = watch('field_id');
  const selectedActivityType = watch('activity_type');
  const selectedField = fields.find((f) => f.id === selectedFieldId);

  // Sync default field if fields load
  React.useEffect(() => {
    if (fields.length > 0 && !selectedFieldId) {
      setValue('field_id', fields[0].id);
    }
  }, [fields, selectedFieldId, setValue]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB.');
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadedPhotoUrl(result.url);
      setValue('photo_url', result.url);
      toast.success('Photo uploaded successfully!');
    } catch (err: any) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const removeUploadedPhoto = () => {
    setUploadedPhotoUrl(null);
    setValue('photo_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ActivityFormData) => {
    if (hasNoFields) {
      toast.error('No registered land parcel found. You must register a field plot first.');
      return;
    }

    try {
      const matchingCycle = cropCycles.find((c) => c.field_id === data.field_id) || activeCycle;

      await createActivity({
        farmer_id: farmer.id,
        crop_cycle_id: matchingCycle?.id || null,
        field_id: data.field_id,
        activity_type: data.activity_type,
        scheduled_date: data.executed_date,
        dosage_or_volume: data.dosage_or_volume,
        cost: data.cost,
        logged_by_role: 'FARMER',
        logged_by_name: farmer.name,
        notes: data.notes || null,
        photo_url: data.photo_url || null,
        recommendation_adherence: true,
      }).unwrap();

      toast.success('Activity logged in your Kisan Diary successfully!');
      reset();
      setUploadedPhotoUrl(null);
      setIsDialogOpen(false);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to log field activity. Please try again.'));
    }
  };

  const handleOpenDeleteModal = (act: ActivityRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivityToDelete(act);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;
    try {
      await deleteActivity(activityToDelete.id).unwrap();
      toast.success('Activity log removed from diary successfully.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to delete activity log'));
    } finally {
      setActivityToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const applyTemplate = (template: typeof OPERATION_TEMPLATES[0]) => {
    setValue('activity_type', template.type);
    setValue('dosage_or_volume', template.defaultDosage);
    setValue('cost', template.defaultCost);
  };

  const filteredActivities = activities.filter((act) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'IRRIGATION') return act.activity_type.includes('IRRIGATION');
    if (filterType === 'FERTILIZER_APPLICATION') return act.activity_type.includes('FERTILIZER');
    if (filterType === 'PESTICIDE_SPRAY') {
      return (
        act.activity_type.includes('SPRAY') ||
        act.activity_type.includes('PESTICIDE') ||
        act.activity_type.includes('WEEDICIDE')
      );
    }
    return act.activity_type === filterType;
  });

  const totalSpent = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const filteredSpent = filteredActivities.reduce((sum, a) => sum + (a.cost || 0), 0);

  const getActivityIcon = (type: string) => {
    if (type.includes('IRRIGATION')) return <Droplets className="h-4 w-4 text-sky-500" />;
    if (type.includes('FERTILIZER')) return <Sprout className="h-4 w-4 text-emerald-500" />;
    return <Sparkles className="h-4 w-4 text-amber-500" />;
  };

  const formatActivityName = (type: string) => {
    return type.replace(/_/g, ' ');
  };

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
      {/* Warning when no field is registered */}
      {hasNoFields && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-foreground">
                No Land Parcel Registered for {farmer.name}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Field operations (irrigation, fertilizer application, sprays) cannot be recorded without an active registered land parcel.
              </p>
            </div>
          </div>
          {onNavigateToParcels && (
            <Button
              size="sm"
              onClick={onNavigateToParcels}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              Register Land Parcel
            </Button>
          )}
        </div>
      )}

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
                  Self-log irrigation, fertilizers, sprays, and expenditures with digital verification & photos.
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger render={
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ Log Field Operation</span>
                  </Button>
                } />

                <DialogContent className="sm:max-w-3xl md:max-w-4xl max-w-[96vw] max-h-[94vh] p-5 sm:p-6 overflow-y-auto">
                  <DialogHeader className="pb-1">
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-emerald-600" />
                      Log Operation in Kisan Diary (किसान डायरी)
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Record field activity, input dosages, costs, and proof photos for {farmer.name}.
                    </DialogDescription>
                  </DialogHeader>

                  {hasNoFields ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-center my-2">
                      <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground">Cannot Log Operation</h4>
                        <p className="text-xs text-muted-foreground">
                          {farmer.name} does not have any registered land parcels / field plots. You must register a field plot first.
                        </p>
                      </div>
                      {onNavigateToParcels && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsDialogOpen(false);
                            onNavigateToParcels();
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                          Go to Land Parcels & Register Field
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Quick Preset Chips Bar */}
                      <div className="space-y-1.5 pt-1">
                        <Label className="text-[11px] text-muted-foreground uppercase font-semibold">Quick Presets (त्वरित चयन)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {OPERATION_TEMPLATES.map((tmpl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => applyTemplate(tmpl)}
                              className="p-2 rounded-lg border border-border/80 bg-muted/30 hover:bg-emerald-50 hover:border-emerald-500/40 dark:hover:bg-emerald-950/30 text-left text-[11px] transition-colors cursor-pointer"
                            >
                              <div className="font-semibold text-foreground truncate">{tmpl.label}</div>
                              <div className="text-[10px] text-muted-foreground truncate">{tmpl.defaultDosage}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          {/* Left Column: Field, Operation, Dosage, Date & Cost */}
                          <div className="space-y-3">
                            {/* Target Field Plot Selection */}
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Select Field / Plot (खेत चुनें) *</Label>
                              <Controller
                                name="field_id"
                                control={control}
                                render={({ field: formField }) => (
                                  <Select onValueChange={formField.onChange} value={formField.value}>
                                    <SelectTrigger className="text-xs h-9">
                                      <SelectValue placeholder="Choose Field Plot">
                                        {selectedField ? (
                                          <span className="truncate">
                                            <span className="font-bold">{selectedField.field_name}</span> &bull; {selectedField.area} Acres ({selectedField.crop || 'Wheat'})
                                          </span>
                                        ) : undefined}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {fields.map((fld) => (
                                        <SelectItem
                                          key={fld.id}
                                          value={fld.id}
                                          
                                          className="text-xs"
                                        >
                                          <span className="font-bold">{fld.field_name}</span> &bull; {fld.area} Acres ({fld.crop || 'Wheat'})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {errors.field_id && (
                                <p className="text-[11px] text-red-500">{errors.field_id.message}</p>
                              )}
                            </div>

                            {/* Operation Type */}
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Operation Type (कार्य का प्रकार) *</Label>
                              <Controller
                                name="activity_type"
                                control={control}
                                render={({ field: formField }) => (
                                  <Select onValueChange={formField.onChange} value={formField.value}>
                                    <SelectTrigger className="text-xs h-9">
                                      <SelectValue placeholder="Select Operation">
                                        {formField.value ? OPERATION_LABELS[formField.value] || formField.value : undefined}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="IRRIGATION">Canal / Tubewell Irrigation (पहला/दूसरा पानी)</SelectItem>
                                      <SelectItem value="FERTILIZER_UREA">Urea Nitrogen Top-Dressing (यूरिया खाद)</SelectItem>
                                      <SelectItem value="FERTILIZER_DAP">DAP Basal Fertilizer (डीएपी)</SelectItem>
                                      <SelectItem value="FERTILIZER_POTASH">MOP Potash Application (पोटाश)</SelectItem>
                                      <SelectItem value="PESTICIDE_SPRAY">Fungicide / Rust Spray (पीला रतुआ)</SelectItem>
                                      <SelectItem value="WEEDICIDE_SPRAY">Weedicide Spray (खरपतवार नाशक)</SelectItem>
                                      <SelectItem value="SOIL_TEST">Soil Sampling & Testing (मिट्टी जांच)</SelectItem>
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
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Dosage / Material Used (मात्रा / सामग्री) *</Label>
                              <Input
                                {...register('dosage_or_volume')}
                                placeholder="e.g. 1 Bag Urea (45 KG) or 3 Acre Inches"
                                className="text-xs h-9"
                              />
                              {errors.dosage_or_volume && (
                                <p className="text-[11px] text-red-500">{errors.dosage_or_volume.message}</p>
                              )}
                            </div>

                            {/* Date & Cost Grid */}
                            <div className="grid grid-cols-2 gap-2.5">
                              <div className="space-y-1">
                                <Label className="text-xs font-semibold">Execution Date *</Label>
                                <Input
                                  type="date"
                                  {...register('executed_date')}
                                  className="text-xs h-9"
                                />
                                {errors.executed_date && (
                                  <p className="text-[11px] text-red-500">{errors.executed_date.message}</p>
                                )}
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs font-semibold">Cost (₹) *</Label>
                                <Input
                                  type="number"
                                  step="50"
                                  {...register('cost', { valueAsNumber: true })}
                                  className="text-xs h-9"
                                />
                                {errors.cost && (
                                  <p className="text-[11px] text-red-500">{errors.cost.message}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Observations & Photo Upload */}
                          <div className="space-y-3">
                            {/* Observations & Remarks */}
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold">Observations / Remarks (टिप्पणी)</Label>
                              <Textarea
                                {...register('notes')}
                                placeholder="e.g. Soil moisture level, weather condition, crop response..."
                                className="text-xs resize-none h-[76px]"
                              />
                            </div>

                            {/* Photo Upload Section */}
                            <div className="space-y-1">
                              <Label className="text-xs font-semibold flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Camera className="h-3.5 w-3.5 text-emerald-600" />
                                  Field / Receipt Photo (फ़ोटो अपलोड करें)
                                </span>
                                <span className="text-[10px] text-muted-foreground">Optional</span>
                              </Label>

                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                              />

                              {uploadedPhotoUrl ? (
                                <div className="relative rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-2.5 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={uploadedPhotoUrl}
                                      alt="Activity preview"
                                      className="w-12 h-12 rounded-lg object-cover border border-border"
                                    />
                                    <div>
                                      <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Photo Attached
                                      </div>
                                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                                        {uploadedPhotoUrl.split('/').pop()}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeUploadedPhoto}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className="border-2 border-dashed border-border/80 hover:border-emerald-500/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1 bg-muted/20 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors"
                                >
                                  {isUploadingPhoto ? (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                                      <span>Uploading photo...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                                        <Upload className="h-3.5 w-3.5" />
                                      </div>
                                      <div className="text-xs font-semibold text-foreground">
                                        Click to capture or upload field photo
                                      </div>
                                      <div className="text-[10px] text-muted-foreground text-center">
                                        PNG, JPG, WebP up to 10MB (खेत या खाद बिल की फ़ोटो)
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <DialogFooter className="pt-2 border-t border-border/60">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDialogOpen(false)}
                            className="text-xs cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting || isUploadingPhoto}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                          >
                            {isSubmitting ? 'Logging...' : 'Save to Diary'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </>
                  )}
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

      {/* Filter Tabs and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { key: 'ALL', label: 'All Operations' },
            { key: 'IRRIGATION', label: 'Irrigation' },
            { key: 'FERTILIZER_APPLICATION', label: 'Fertilizer' },
            { key: 'PESTICIDE_SPRAY', label: 'Sprays & Protection' },
          ].map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={filterType === item.key ? 'default' : 'outline'}
              onClick={() => setFilterType(item.key)}
              className={`text-xs h-8 cursor-pointer ${
                filterType === item.key
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 self-end sm:self-auto shrink-0">
          <Button
            size="sm"
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            onClick={() => setViewMode('table')}
            className={`h-7 px-2.5 text-xs gap-1.5 cursor-pointer ${
              viewMode === 'table'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            onClick={() => setViewMode('cards')}
            className={`h-7 px-2.5 text-xs gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Cards</span>
          </Button>
        </div>
      </div>

      {/* Activity Content: Table or Cards */}
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
      ) : viewMode === 'table' ? (
        <Card className="border border-border/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-foreground py-3 pl-4">Operation / Activity</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground py-3">Field / Land Plot</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground py-3">Dosage / Details</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground py-3">Photo</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground py-3">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground py-3">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground py-3 text-right">Cost (₹)</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground py-3 text-right pr-4 w-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((act) => {
                  const matchingField = fields.find((f) => f.id === act.field_id);
                  const displayDate =
                    act.executed_date ||
                    act.scheduled_date ||
                    (act.created_at ? format(new Date(act.created_at), 'yyyy-MM-dd') : '—');

                  return (
                    <TableRow key={act.id} className="hover:bg-muted/30 transition-colors">
                      {/* Operation Type & Icon */}
                      <TableCell className="py-3.5 pl-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-muted/80 border border-border/60 shrink-0">
                            {getActivityIcon(act.activity_type)}
                          </div>
                          <div>
                            <div className="font-bold text-xs sm:text-sm text-foreground">
                              {formatActivityName(act.activity_type)}
                            </div>
                            {act.notes && (
                              <div className="text-[11px] text-muted-foreground italic truncate max-w-[200px]">
                                &ldquo;{act.notes}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Field / Parcel */}
                      <TableCell className="py-3.5 align-middle">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">
                              {matchingField ? matchingField.field_name : 'General Farm'}
                            </div>
                            {matchingField && (
                              <div className="text-[11px] text-muted-foreground">
                                {matchingField.area} Acres &bull; {matchingField.crop || 'Wheat'}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Dosage */}
                      <TableCell className="py-3.5 align-middle">
                        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          {act.dosage_or_volume || '—'}
                        </div>
                        {act.logged_by_name && (
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="h-2.5 w-2.5" />
                            <span>Logged by {act.logged_by_name}</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Photo Thumbnail */}
                      <TableCell className="py-3.5 align-middle">
                        {act.photo_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPhotoPreview(act.photo_url || null)}
                            className="group relative block w-9 h-9 rounded-lg overflow-hidden border border-border/80 hover:border-emerald-500 cursor-pointer shadow-xs transition-all"
                          >
                            <img
                              src={act.photo_url}
                              alt="Activity proof"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-3.5 w-3.5 text-white" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3.5 align-middle text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{displayDate}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5 align-middle">
                        <Badge
                          variant="outline"
                          className={
                            act.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold'
                          }
                        >
                          {act.status}
                        </Badge>
                      </TableCell>

                      {/* Cost */}
                      <TableCell className="py-3.5 text-right align-middle">
                        <span className="font-mono font-bold text-foreground text-sm">
                          ₹{(act.cost || 0).toLocaleString('en-IN')}
                        </span>
                      </TableCell>

                      {/* Delete Action */}
                      <TableCell className="py-3.5 pr-4 text-right align-middle">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleOpenDeleteModal(act, e)}
                          title="Delete Activity Log"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter className="bg-muted/30 border-t border-border/80">
                <TableRow>
                  <TableCell colSpan={6} className="py-3 pl-4 text-xs font-semibold text-foreground">
                    Total ({filteredActivities.length} {filteredActivities.length === 1 ? 'Operation' : 'Operations'})
                  </TableCell>
                  <TableCell className="py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{filteredSpent.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="pr-4" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </Card>
      ) : (
        /* Cards View — Side-by-Side Responsive Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((act) => {
            const matchingField = fields.find((f) => f.id === act.field_id);
            const displayDate =
              act.executed_date ||
              act.scheduled_date ||
              (act.created_at ? format(new Date(act.created_at), 'yyyy-MM-dd') : '—');

            return (
              <Card
                key={act.id}
                className="border border-border/80 hover:border-emerald-500/50 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Header: Icon/Photo + Title + Status Badge + Delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {act.photo_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedPhotoPreview(act.photo_url || null)}
                            className="w-10 h-10 rounded-xl overflow-hidden border border-border shrink-0 hover:opacity-90 cursor-pointer shadow-2xs relative group"
                          >
                            <img
                              src={act.photo_url}
                              alt="Operation preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="h-3 w-3 text-white" />
                            </div>
                          </button>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                            {act.activity_type.includes('IRRIGATION') ? (
                              <Droplets className="h-4 w-4" />
                            ) : act.activity_type.includes('FERTILIZER') ? (
                              <Sprout className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                            {act.activity_type.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="truncate">
                              {matchingField ? `${matchingField.field_name} (${matchingField.area} Ac)` : 'General Farm'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            act.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-semibold'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold'
                          }
                        >
                          {act.status}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleOpenDeleteModal(act, e)}
                          title="Delete Activity Log"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Dosage / Input & Observation */}
                    <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground shrink-0">Dosage / Input:</span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] truncate text-right">
                          {act.dosage_or_volume || '—'}
                        </span>
                      </div>
                      {act.notes && (
                        <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-border/40 line-clamp-2">
                          &ldquo;{act.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer: Date & Cost */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs mt-2">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Calendar className="h-3 w-3 text-muted-foreground/70" />
                      <span>{displayDate}</span>
                    </div>
                    <span className="font-mono font-bold text-foreground text-sm">
                      ₹{(act.cost || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
        title="Delete Activity Log"
        description={`Are you sure you want to delete this ${activityToDelete?.activity_type.replace(/_/g, ' ') || 'operation'} log from your Kisan Diary? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Log'}
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
