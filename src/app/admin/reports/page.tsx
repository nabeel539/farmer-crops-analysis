'use client';

import React, { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Wheat,
  ShieldCheck,
  Package,
  Factory
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const farmers = useAppSelector((state) => state.farmers.farmers);
  const distributions = useAppSelector((state) => state.seedDistributions.distributions);
  const cropCycles = useAppSelector((state) => state.cropCycles.cycles);
  const harvests = useAppSelector((state) => state.harvests.harvests);
  const batches = useAppSelector((state) => state.milling.batches);

  const [selectedReport, setSelectedReport] = useState<'SEED_DIST' | 'FARMER_REG' | 'HARVEST_SUMMARY' | 'MILLING_AUDIT'>('SEED_DIST');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    toast.success(`Generated official audit export for ${selectedReport}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Official Agricultural Reports & Audits"
        description="Certified regulatory compliance reports: government seed subsidy disbursement, farmer land tenure, and milling extraction records."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs font-semibold">
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </Button>
          <Button size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs font-semibold">
            <Download className="h-3.5 w-3.5" />
            Export Document
          </Button>
        </div>
      </PageHeader>

      {/* Report Types Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'SEED_DIST',
            title: 'Seed Subsidy Audit',
            desc: 'Certified bag allocation & subsidy accounts',
            icon: Package,
            records: distributions.length
          },
          {
            id: 'FARMER_REG',
            title: 'Grower Tenure Registry',
            desc: 'CNIC, Khasra deed & boundary audits',
            icon: ShieldCheck,
            records: farmers.length
          },
          {
            id: 'HARVEST_SUMMARY',
            title: 'Weighbridge & Yield',
            desc: 'Grain moisture & silo intake audit',
            icon: Wheat,
            records: harvests.length
          },
          {
            id: 'MILLING_AUDIT',
            title: 'Milling Extraction',
            desc: '77% Atta conversion & Silo levels',
            icon: Factory,
            records: batches.length
          },
        ].map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <Card
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as any)}
              className={`cursor-pointer transition-all duration-200 border-2 ${
                isSelected ? 'border-primary bg-primary/5 shadow-xs' : 'hover:border-primary/40 bg-card'
              }`}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {rep.records} Records
                  </Badge>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">{rep.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{rep.desc}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Document Paper Card */}
      <Card className="border shadow-sm bg-card print:border-none print:shadow-none">
        <CardHeader className="border-b pb-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-primary font-bold">
                Ministry of Agriculture & Farmers Welfare &bull; Govt of India
              </span>
              <CardTitle className="text-xl font-bold pt-1">
                {selectedReport === 'SEED_DIST' && 'Certified Wheat Seed Subsidy Disbursement Audit Report'}
                {selectedReport === 'FARMER_REG' && 'Official Farmer Cadastral & Land Tenure Verification Registry'}
                {selectedReport === 'HARVEST_SUMMARY' && 'Grain Procurement Weighbridge & Yield Inspection Summary'}
                {selectedReport === 'MILLING_AUDIT' && 'Industrial Flour Milling Extraction & Strategic Silo Log'}
              </CardTitle>
            </div>
            <div className="text-right font-mono text-xs text-muted-foreground shrink-0">
              <p>Rabi Season 2025-2026</p>
              <p>Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {selectedReport === 'SEED_DIST' && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="font-bold">Distribution Code</TableHead>
                  <TableHead className="font-bold">Farmer / Aadhaar</TableHead>
                  <TableHead className="font-bold">Seed Variety & Lot</TableHead>
                  <TableHead className="font-bold text-right">Quantity (50kg Bags)</TableHead>
                  <TableHead className="font-bold text-right">Subsidy Amount</TableHead>
                  <TableHead className="font-bold text-right">Net Payable</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {distributions.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold">{d.distributionCode}</TableCell>
                    <TableCell>
                      <span className="font-semibold block">{d.farmerName}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{d.farmerCode}</span>
                    </TableCell>
                    <TableCell>
                      <span>{d.seedVariety}</span>
                      <span className="text-[11px] text-muted-foreground block font-mono">Lot: {d.lotNumber}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">{d.quantityBags} Bags</TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 font-semibold">
                      ₹ {(d.subsidyRatePerBag * d.quantityBags).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      ₹ {d.totalPayable.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.paymentStatus} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {selectedReport === 'FARMER_REG' && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="font-bold">Farmer Code</TableHead>
                  <TableHead className="font-bold">Full Name & Father Name</TableHead>
                  <TableHead className="font-bold">Aadhaar / ID</TableHead>
                  <TableHead className="font-bold">Village & District</TableHead>
                  <TableHead className="font-bold text-right">Wheat Acreage</TableHead>
                  <TableHead className="font-bold">Bank Account</TableHead>
                  <TableHead className="font-bold">Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {farmers.map((f) => (
                  <TableRow key={f.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold">{f.farmerCode}</TableCell>
                    <TableCell>
                      <span className="font-semibold block">{f.fullName}</span>
                      <span className="text-[11px] text-muted-foreground">s/o {f.fatherName}</span>
                    </TableCell>
                    <TableCell className="font-mono">{f.cnicOrId}</TableCell>
                    <TableCell>{f.village}, {f.district}</TableCell>
                    <TableCell className="text-right font-bold">{f.wheatAcreage} Acres</TableCell>
                    <TableCell className="font-mono text-[11px]">{f.bankAccountNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <StatusBadge status={f.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {selectedReport === 'HARVEST_SUMMARY' && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="font-bold">Harvest Receipt</TableHead>
                  <TableHead className="font-bold">Farmer Name</TableHead>
                  <TableHead className="font-bold">Harvest Date</TableHead>
                  <TableHead className="font-bold text-right">Harvested Acres</TableHead>
                  <TableHead className="font-bold text-right">Yield (Maunds)</TableHead>
                  <TableHead className="font-bold text-center">Moisture %</TableHead>
                  <TableHead className="font-bold">Quality Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {harvests.map((h) => (
                  <TableRow key={h.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold">{h.harvestCode}</TableCell>
                    <TableCell className="font-semibold">{h.farmerName}</TableCell>
                    <TableCell>{h.harvestDate}</TableCell>
                    <TableCell className="text-right">{h.totalAcreageHarvested} Ac</TableCell>
                    <TableCell className="text-right font-bold font-mono">{h.totalWeightMaunds} Mnds</TableCell>
                    <TableCell className="text-center font-mono font-bold text-blue-600">{h.grainMoisturePct}%</TableCell>
                    <TableCell>
                      <StatusBadge status={h.grainQualityGrade} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {selectedReport === 'MILLING_AUDIT' && (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="font-bold">Batch ID</TableHead>
                  <TableHead className="font-bold">Processed Date</TableHead>
                  <TableHead className="font-bold text-right">Wheat Input</TableHead>
                  <TableHead className="font-bold text-right">Flour Yield</TableHead>
                  <TableHead className="font-bold text-right">Bran (Choker)</TableHead>
                  <TableHead className="font-bold text-center">Extraction %</TableHead>
                  <TableHead className="font-bold">Silo Silo ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {batches.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-bold">{b.batchNumber}</TableCell>
                    <TableCell>{b.processedDate}</TableCell>
                    <TableCell className="text-right font-mono font-bold">{b.totalInputWheatKg.toLocaleString()} kg</TableCell>
                    <TableCell className="text-right font-mono text-emerald-600 font-semibold">{b.flourYieldKg.toLocaleString()} kg</TableCell>
                    <TableCell className="text-right font-mono text-amber-600">{b.branYieldKg.toLocaleString()} kg</TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary">{b.extractionRatePct}%</TableCell>
                    <TableCell className="font-medium">{b.storageSiloId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
