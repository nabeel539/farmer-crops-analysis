'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
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
  Lock
} from 'lucide-react';
import { MOCK_USERS, MOCK_AUDIT_LOGS } from '@/data/mockData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [mspPrice, setMspPrice] = useState(2275);
  const [subsidyPerBag, setSubsidyPerBag] = useState(600);
  const [extractionStandard, setExtractionStandard] = useState(77);
  const [activeSeason, setActiveSeason] = useState('Rabi 2025-2026');

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="System Parameters & Audit Trail"
        description="Configure government support prices, subsidy rates, system user roles, and inspect tamper-evident audit logs."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Configuration Box */}
        <Card className="border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">Agronomic & Pricing Parameters</CardTitle>
            </div>
            <CardDescription className="text-xs">
              National wheat support rates for Rabi 2025-26
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveParams} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Active Agriculture Season</Label>
                <Input
                  value={activeSeason}
                  onChange={(e) => setActiveSeason(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Wheat Minimum Support Price (₹ / Quintal)</Label>
                <Input
                  type="number"
                  value={mspPrice}
                  onChange={(e) => setMspPrice(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Seed Subsidy Rate (₹ / 50kg Bag)</Label>
                <Input
                  type="number"
                  value={subsidyPerBag}
                  onChange={(e) => setSubsidyPerBag(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Flour Mill Target Extraction Rate (%)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={extractionStandard}
                  onChange={(e) => setExtractionStandard(parseFloat(e.target.value) || 77)}
                />
              </div>

              <Button type="submit" className="w-full font-semibold gap-1.5 pt-2">
                <Save className="h-4 w-4" />
                Update Parameters
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Role Management */}
        <Card className="lg:col-span-2 border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">Authorized System Personas & Roles</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configured access accounts across Super Admin, Agronomy, Field, and Grower roles
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
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {MOCK_USERS.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">{user.name}</TableCell>
                    <TableCell>
                      <span>{user.email}</span>
                      <span className="text-[11px] text-muted-foreground block">{user.phone}</span>
                    </TableCell>
                    <TableCell>
                      <span>{user.assignedRegion || user.assignedVillage || 'All Punjab'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {user.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Trail */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold">System Governance & Audit Trail</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Immutable chronological log of all field activity recordings, seed allocations, and parameter changes
            </CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {auditLogs.length} Events Logged
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold">Timestamp</TableHead>
                <TableHead className="font-bold">User / Role</TableHead>
                <TableHead className="font-bold">Action Performed</TableHead>
                <TableHead className="font-bold">Entity</TableHead>
                <TableHead className="font-bold">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {auditLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-muted-foreground text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground block">{log.userName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{log.userRole}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-medium">{log.entity}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
