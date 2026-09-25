'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateGISSettings, resetGISSettings, GISPolygonSettings } from '@/store/slices/uiSlice';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Settings,
  Shield,
  Clock,
  Save,
  Users,
  CheckCircle2,
  Database,
  Lock,
  MapPin,
  Layers,
  RotateCcw,
  Sparkles,
  Palette
} from 'lucide-react';
import { MOCK_USERS, MOCK_AUDIT_LOGS } from '@/data/mockData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const gisSettings = useAppSelector((state) => state.ui.gisSettings);

  // General parameters
  const [mspPrice, setMspPrice] = useState(2275);
  const [subsidyPerBag, setSubsidyPerBag] = useState(600);
  const [extractionStandard, setExtractionStandard] = useState(77);
  const [activeSeason, setActiveSeason] = useState('Rabi 2025-2026');

  // GIS Polygon Settings State
  const [pointsCount, setPointsCount] = useState<4 | 6 | 8>(gisSettings?.defaultPointsCount || 4);
  const [healthyColor, setHealthyColor] = useState(gisSettings?.polygonColorHealthy || '#10b981');
  const [warningColor, setWarningColor] = useState(gisSettings?.polygonColorWarning || '#f59e0b');
  const [criticalColor, setCriticalColor] = useState(gisSettings?.polygonColorCritical || '#ef4444');
  const [harvestedColor, setHarvestedColor] = useState(gisSettings?.polygonColorHarvested || '#3b82f6');
  const [strokeWeight, setStrokeWeight] = useState(gisSettings?.strokeWeight || 3);
  const [opacity, setOpacity] = useState(gisSettings?.polygonOpacity || 0.35);

  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      id: `AUD-00${auditLogs.length + 1}`,
      timestamp: new Date().toLocaleString(),
      userName: 'Er. Vikramaditya Sharma',
      userRole: 'SUPER_ADMIN' as const,
      action: 'UPDATE_SYSTEM_PARAMETERS',
      entity: 'SystemConfig',
      entityId: 'CONFIG-2026',
      details: `Updated MSP to ₹ ${mspPrice} and Subsidy to ₹ ${subsidyPerBag}`
    };
    setAuditLogs([newLog, ...auditLogs]);
    toast.success('System parameters updated and audit entry recorded!');
  };

  const handleSaveGISSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateGISSettings({
      defaultPointsCount: pointsCount,
      polygonColorHealthy: healthyColor,
      polygonColorWarning: warningColor,
      polygonColorCritical: criticalColor,
      polygonColorHarvested: harvestedColor,
      strokeWeight: strokeWeight,
      polygonOpacity: opacity
    }));

    const newLog = {
      id: `AUD-00${auditLogs.length + 1}`,
      timestamp: new Date().toLocaleString(),
      userName: 'Er. Vikramaditya Sharma',
      userRole: 'SUPER_ADMIN' as const,
      action: 'UPDATE_GIS_SETTINGS',
      entity: 'GISPolygonConfig',
      entityId: 'GIS-CONFIG',
      details: `Configured default polygon vertices to ${pointsCount} points and updated health theme colors`
    };
    setAuditLogs([newLog, ...auditLogs]);
    toast.success(`GIS Polygon settings saved! (${pointsCount} Vertices & Custom Theme Colors)`);
  };

  const handleResetGIS = () => {
    dispatch(resetGISSettings());
    setPointsCount(4);
    setHealthyColor('#10b981');
    setWarningColor('#f59e0b');
    setCriticalColor('#ef4444');
    setHarvestedColor('#3b82f6');
    setStrokeWeight(3);
    setOpacity(0.35);
    toast.info('Reset GIS polygon settings to default (4 points).');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="System Parameters & Audit Trail"
        description="Configure government support prices, GIS boundary polygon vertices (4/6/8 points), custom plot theme colors, and inspect audit logs."
      />

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. GIS & Polygon Boundary Configuration (Prominent) */}
        <Card className="lg:col-span-6 border border-emerald-500/30 shadow-xs">
          <CardHeader className="pb-3 border-b bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-base font-bold">GIS & Land Polygon Configuration</CardTitle>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono text-[11px]">
                {pointsCount} Vertex Handles
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Configure default polygon corner points (4, 6, 8 vertices) and custom boundary theme colors for map editors.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSaveGISSettings} className="space-y-5 text-xs">
              
              {/* Vertex Points Count Selector (4, 6, 8) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-foreground">
                  Default Polygon Boundary Points (Vertices)
                </Label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPointsCount(4)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      pointsCount === 4
                        ? 'border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span className="block text-sm font-extrabold">4 Points</span>
                    <span className="text-[10px] opacity-80">Rectangle / Quad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPointsCount(6)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      pointsCount === 6
                        ? 'border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span className="block text-sm font-extrabold">6 Points</span>
                    <span className="text-[10px] opacity-80">Hexagon Shape</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPointsCount(8)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      pointsCount === 8
                        ? 'border-emerald-600 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                        : 'border-border bg-card hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span className="block text-sm font-extrabold">8 Points</span>
                    <span className="text-[10px] opacity-80">Octagon / Complex</span>
                  </button>
                </div>
              </div>

              {/* Polygon Theme Colors */}
              <div className="space-y-2.5 pt-1">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                  Polygon Boundary Theme Colors
                </Label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Healthy Green */}
                  <div className="p-2.5 rounded-lg border bg-card space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold">GREEN (Optimal)</span>
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: healthyColor }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={healthyColor}
                        onChange={(e) => setHealthyColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={healthyColor}
                        onChange={(e) => setHealthyColor(e.target.value)}
                        className="h-7 text-[11px] font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Warning Yellow */}
                  <div className="p-2.5 rounded-lg border bg-card space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold">YELLOW (Attention)</span>
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: warningColor }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={warningColor}
                        onChange={(e) => setWarningColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={warningColor}
                        onChange={(e) => setWarningColor(e.target.value)}
                        className="h-7 text-[11px] font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Critical Red */}
                  <div className="p-2.5 rounded-lg border bg-card space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold">RED (High Alert)</span>
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: criticalColor }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={criticalColor}
                        onChange={(e) => setCriticalColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={criticalColor}
                        onChange={(e) => setCriticalColor(e.target.value)}
                        className="h-7 text-[11px] font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Harvested Blue */}
                  <div className="p-2.5 rounded-lg border bg-card space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold">BLUE (Harvested)</span>
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: harvestedColor }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={harvestedColor}
                        onChange={(e) => setHarvestedColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer bg-transparent"
                      />
                      <Input
                        value={harvestedColor}
                        onChange={(e) => setHarvestedColor(e.target.value)}
                        className="h-7 text-[11px] font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stroke & Opacity */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Boundary Line Width (px)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="6"
                    value={strokeWeight}
                    onChange={(e) => setStrokeWeight(parseInt(e.target.value) || 3)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">Fill Transparency (0.1 - 0.9)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.9"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value) || 0.35)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={handleResetGIS} className="gap-1 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Defaults
                </Button>
                <Button type="submit" size="sm" className="flex-1 font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Save className="h-3.5 w-3.5" />
                  Save GIS Polygon Settings
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 2. Agronomic & Pricing Parameters */}
        <Card className="lg:col-span-6 border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">Agronomic & Pricing Parameters</CardTitle>
            </div>
            <CardDescription className="text-xs">
              National wheat support rates, minimum support price, and milling standards
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSaveParams} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Active Agriculture Season</Label>
                <Input
                  value={activeSeason}
                  onChange={(e) => setActiveSeason(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Wheat Minimum Support Price (₹ / Quintal)</Label>
                <Input
                  type="number"
                  value={mspPrice}
                  onChange={(e) => setMspPrice(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Seed Subsidy Rate (₹ / 50kg Bag)</Label>
                <Input
                  type="number"
                  value={subsidyPerBag}
                  onChange={(e) => setSubsidyPerBag(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Flour Mill Target Extraction Rate (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={extractionStandard}
                  onChange={(e) => setExtractionStandard(parseFloat(e.target.value) || 77)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <Button type="submit" className="w-full font-semibold gap-1.5 h-9 mt-2">
                <Save className="h-4 w-4" />
                Update Agricultural Parameters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 3. User Role Management Table */}
        <Card className="lg:col-span-12 border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">Authorized System Personas & Role Matrix</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configured access accounts across Super Admin, Agronomy, Field Officer, and Farmer roles
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="font-bold">Full Name</TableHead>
                  <TableHead className="font-bold">Contact / Email</TableHead>
                  <TableHead className="font-bold">Assigned Jurisdiction</TableHead>
                  <TableHead className="font-bold">Access Role</TableHead>
                  <TableHead className="font-bold text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {MOCK_USERS.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">{user.name}</TableCell>
                    <TableCell>
                      <span>{user.email}</span>
                      <span className="text-[11px] text-muted-foreground block font-mono">{user.phone}</span>
                    </TableCell>
                    <TableCell>{user.assignedRegion || 'Central Directorate'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 4. Tamper-Evident System Audit Trail */}
        <Card className="lg:col-span-12 border shadow-xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">Immutable Audit Log & Action History</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Traceability records of parameter adjustments, GIS polygon updates, and system transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="font-bold">Timestamp</TableHead>
                  <TableHead className="font-bold">User / Role</TableHead>
                  <TableHead className="font-bold">Action Type</TableHead>
                  <TableHead className="font-bold">Target Entity</TableHead>
                  <TableHead className="font-bold">Transaction Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-mono">
                {auditLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30">
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                    <TableCell className="font-bold text-foreground">
                      {log.userName}
                      <span className="block text-[10px] text-muted-foreground font-normal">{log.userRole}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.entity} &bull; {log.entityId}</TableCell>
                    <TableCell className="text-foreground max-w-xs truncate font-sans text-xs">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
