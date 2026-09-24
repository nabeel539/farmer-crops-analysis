'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MetricCard } from '@/components/shared/MetricCard';
import {
  addAlert,
  resolveAlert,
  setAlertSeverityFilter,
} from '@/store/slices/alertsSlice';
import { AgriAlert, AdvisoryBulletin } from '@/types';
import { MOCK_ADVISORIES } from '@/data/mockData';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Plus,
  ShieldAlert,
  Droplets,
  CloudRain,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Send,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

export default function AlertsPage() {
  const dispatch = useAppDispatch();
  const { alerts, severityFilter } = useAppSelector((state) => state.alerts);
  const [advisories, setAdvisories] = useState<AdvisoryBulletin[]>(MOCK_ADVISORIES);

  const [activeTab, setActiveTab] = useState<'ALERTS' | 'ADVISORIES'>('ALERTS');
  const [addAlertModalOpen, setAddAlertModalOpen] = useState(false);
  const [addAdvModalOpen, setAddAdvModalOpen] = useState(false);

  // Form State for Broadcast Alert
  const [alertTitle, setAlertTitle] = useState('');
  const [alertType, setAlertType] = useState<AgriAlert['type']>('RUST_DISEASE_WARNING');
  const [alertSeverity, setAlertSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('CRITICAL');
  const [alertRegion, setAlertRegion] = useState('Punjab & Haryana Wheat Belt (Ludhiana, Karnal, Patiala)');
  const [alertDesc, setAlertDesc] = useState('');
  const [alertAction, setAlertAction] = useState('');

  // Form State for Advisory
  const [advTitle, setAdvTitle] = useState('');
  const [advUrduTitle, setAdvUrduTitle] = useState('');
  const [advCategory, setAdvCategory] = useState<AdvisoryBulletin['category']>('CROP_PROTECTION');
  const [advDesc, setAdvDesc] = useState('');
  const [advUrduDesc, setAdvUrduDesc] = useState('');
  const [advAction, setAdvAction] = useState('');

  const filteredAlerts = alerts.filter(
    (a) => severityFilter === 'ALL' || a.severity === severityFilter
  );

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const affectedFarmersTotal = alerts
    .filter((a) => !a.resolved)
    .reduce((sum, a) => sum + a.affectedFarmersCount, 0);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: AgriAlert = {
      id: `ALT-00${alerts.length + 1}`,
      type: alertType,
      severity: alertSeverity,
      title: alertTitle,
      description: alertDesc,
      region: alertRegion,
      affectedFarmersCount: 150,
      createdDate: new Date().toISOString().split('T')[0],
      resolved: false,
      actionRequired: alertAction
    };

    dispatch(addAlert(newAlert));
    toast.success(`Broadcasted alert "${alertTitle}" to farmers and field officers!`);
    setAddAlertModalOpen(false);
    setAlertTitle('');
    setAlertDesc('');
    setAlertAction('');
  };

  const handleCreateAdvisory = (e: React.FormEvent) => {
    e.preventDefault();
    const newAdv: AdvisoryBulletin = {
      id: `ADV-00${advisories.length + 1}`,
      title: advTitle,
      urduTitle: advUrduTitle,
      category: advCategory,
      description: advDesc,
      urduDescription: advUrduDesc,
      recommendedAction: advAction,
      publishedDate: new Date().toISOString().split('T')[0],
      author: 'Dr. Ayesha Siddiqa (Head of Agronomy)',
      iconName: 'Sparkles'
    };

    setAdvisories([newAdv, ...advisories]);
    toast.success(`Advisory "${advTitle}" published to Farmer App!`);
    setAddAdvModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Agri Alerts & Advisory Directorate"
        description="Early warning weather alerts, yellow rust outbreak tracking, and bilingual agronomic advisories broadcast directly to growers."
        actionButton={{
          label: 'Broadcast Alert',
          icon: Send,
          onClick: () => setAddAlertModalOpen(true),
        }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAddAdvModalOpen(true)}
          className="gap-1.5 text-xs font-semibold"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Publish Advisory
        </Button>
      </PageHeader>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Agri Alerts"
          value={activeAlertsCount}
          subtitle={`${alerts.filter(a => a.severity === 'CRITICAL' && !a.resolved).length} Critical Warnings`}
          icon={ShieldAlert}
          variant={activeAlertsCount > 0 ? 'accent' : 'default'}
        />
        <MetricCard
          title="Affected Farmers"
          value={affectedFarmersTotal}
          subtitle="Direct SMS & App Push notified"
          icon={Users}
        />
        <MetricCard
          title="Disease Watch Status"
          value="Stripe Rust Alert"
          subtitle="Humid conditions in Central Zone"
          icon={Bell}
        />
        <MetricCard
          title="Bilingual Bulletins"
          value={advisories.length}
          subtitle="ICAR & PAU Guidance verified"
          icon={Sparkles}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="ALERTS" className="text-xs font-semibold">
            Emergency Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="ADVISORIES" className="text-xs font-semibold">
            Agronomic Advisories ({advisories.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Agri Alerts */}
        <TabsContent value="ALERTS" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Filter by Severity:</span>
            <div className="flex gap-1.5">
              {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                <Button
                  key={sev}
                  variant={severityFilter === sev ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs font-medium px-2.5"
                  onClick={() => dispatch(setAlertSeverityFilter(sev))}
                >
                  {sev}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border transition-all duration-200 ${
                  alert.resolved
                    ? 'opacity-60 bg-muted/30'
                    : alert.severity === 'CRITICAL'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : 'bg-card'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            alert.severity === 'CRITICAL'
                              ? 'destructive'
                              : alert.severity === 'WARNING'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="text-[10px] font-mono"
                        >
                          {alert.severity}
                        </Badge>
                        <CardTitle className="text-base font-bold">{alert.title}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        Region: <span className="font-semibold text-foreground">{alert.region}</span> &bull; {alert.affectedFarmersCount} Enrolled Farmers Impacted
                      </CardDescription>
                    </div>

                    {!alert.resolved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold shrink-0 gap-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30"
                        onClick={() => {
                          dispatch(resolveAlert(alert.id));
                          toast.success(`Alert marked as resolved!`);
                        }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve Alert
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                        Resolved
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-muted-foreground">{alert.description}</p>
                  <div className="p-3 bg-muted/60 rounded-xl space-y-1">
                    <span className="font-bold text-foreground block">Required Field Action:</span>
                    <p className="text-primary font-medium">{alert.actionRequired}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Agronomic Advisories */}
        <TabsContent value="ADVISORIES" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advisories.map((adv) => (
              <Card key={adv.id} className="border shadow-xs flex flex-col justify-between">
                <CardHeader className="pb-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {adv.category.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">{adv.publishedDate}</span>
                  </div>
                  <CardTitle className="text-base font-bold pt-1">{adv.title}</CardTitle>
                  <p className="text-xs font-medium text-emerald-600 font-serif leading-relaxed" dir="rtl">
                    {adv.urduTitle}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-muted-foreground">{adv.description}</p>
                  <p className="text-foreground/80 font-serif leading-relaxed text-[11px]" dir="rtl">
                    {adv.urduDescription}
                  </p>
                  <div className="p-3 bg-muted/60 rounded-xl space-y-1">
                    <span className="font-bold text-foreground block">Actionable Protocol:</span>
                    <p className="text-primary font-medium">{adv.recommendedAction}</p>
                  </div>
                  <div className="text-[10px] text-muted-foreground pt-1">
                    Author: {adv.author}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Broadcast Alert Dialog */}
      <Dialog open={addAlertModalOpen} onOpenChange={setAddAlertModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Broadcast Agricultural Emergency Alert</DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch high-priority push notifications and SMS warnings to farmers and field officers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAlert} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Alert Headline / Title *</Label>
              <Input
                required
                placeholder="e.g. Yellow Rust Outbreak Warning"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alert Type</Label>
                <Select value={alertType} onValueChange={(v) => setAlertType(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUST_DISEASE_WARNING">Yellow / Stripe Rust Warning</SelectItem>
                    <SelectItem value="WEATHER_HAIL_RAIN">Rain & Hailstorm Warning</SelectItem>
                    <SelectItem value="IRRIGATION_DELAY">Canal Closure / Water Delay</SelectItem>
                    <SelectItem value="FERTILIZER_OVERDUE">Overdue Fertilizer Spray</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Severity Level</Label>
                <Select value={alertSeverity} onValueChange={(v) => setAlertSeverity(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">CRITICAL (Emergency Action)</SelectItem>
                    <SelectItem value="WARNING">WARNING (High Risk)</SelectItem>
                    <SelectItem value="INFO">INFO (Advisory Guidance)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Region / Districts</Label>
              <Input
                value={alertRegion}
                onChange={(e) => setAlertRegion(e.target.value)}
                placeholder="e.g. Central Punjab"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Detailed Description</Label>
              <Textarea
                required
                rows={3}
                placeholder="Details of weather or disease outbreak..."
                value={alertDesc}
                onChange={(e) => setAlertDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Recommended Agronomic Action</Label>
              <Input
                required
                placeholder="e.g. Spray Propiconazole @ 200ml/acre immediately"
                value={alertAction}
                onChange={(e) => setAlertAction(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddAlertModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold gap-1.5">
                <Send className="h-4 w-4" />
                Broadcast Alert Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Publish Advisory Dialog */}
      <Dialog open={addAdvModalOpen} onOpenChange={setAddAdvModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Publish Agronomic Bulletin</DialogTitle>
            <DialogDescription className="text-xs">
              Publish bilingual guidance for mobile farmer passbook.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAdvisory} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">English Title</Label>
                <Input
                  required
                  placeholder="e.g. Heading Stage Water Management"
                  value={advTitle}
                  onChange={(e) => setAdvTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Urdu Title (اردو عنوان)</Label>
                <Input
                  required
                  dir="rtl"
                  placeholder="گندم کی آبپاشی کا اہم وقت"
                  value={advUrduTitle}
                  onChange={(e) => setAdvUrduTitle(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Advisory Category</Label>
              <Select value={advCategory} onValueChange={(v) => setAdvCategory(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CROP_PROTECTION">Crop Protection / Disease</SelectItem>
                  <SelectItem value="IRRIGATION">Irrigation & Water Scheduling</SelectItem>
                  <SelectItem value="FERTILIZER">Fertilizer & Nutrition</SelectItem>
                  <SelectItem value="MARKET_PRICE">Market Prices & MSP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">English Description</Label>
              <Textarea
                required
                rows={2}
                value={advDesc}
                onChange={(e) => setAdvDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Urdu Guidance (اردو تفصیل)</Label>
              <Textarea
                required
                rows={2}
                dir="rtl"
                value={advUrduDesc}
                onChange={(e) => setAdvUrduDesc(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Action Protocol</Label>
              <Input
                required
                placeholder="e.g. Apply 3rd irrigation when soil moisture drops below 30%"
                value={advAction}
                onChange={(e) => setAdvAction(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setAddAdvModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="font-semibold">
                Publish Advisory
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
