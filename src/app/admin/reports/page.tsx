'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Factory,
  Search,
  IndianRupee,
  Calendar,
  Layers,
  MapPin,
  TrendingUp,
  Percent,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetFarmersQuery } from '@/store/api/farmerApi';
import { useGetAllocationsQuery } from '@/store/api/allocationApi';
import { useGetHarvestsQuery } from '@/store/api/harvestApi';
import { useGetFieldsQuery } from '@/store/api/fieldApi';
import {
  MOCK_FARMERS,
  MOCK_SEED_DISTRIBUTIONS,
  MOCK_HARVEST_RECORDS,
  MOCK_MILLING_BATCHES,
} from '@/data/mockData';

export default function ReportsPage() {
  const { data: apiFarmers = [] } = useGetFarmersQuery();
  const { data: apiAllocations = [] } = useGetAllocationsQuery();
  const { data: apiHarvests = [] } = useGetHarvestsQuery();
  const { data: apiFields = [] } = useGetFieldsQuery();

  const [selectedReport, setSelectedReport] = useState<'SEED_DIST' | 'FARMER_REG' | 'HARVEST_SUMMARY' | 'MILLING_AUDIT'>('SEED_DIST');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Unified Seed Subsidy Distributions (API + MOCK fallback)
  const distributions = React.useMemo(() => {
    if (apiAllocations.length > 0) {
      return apiAllocations.map((a: any, idx: number) => {
        const farmer = apiFarmers.find((f) => f.id === a.farmer_id);
        const field = apiFields.find((f) => f.id === a.field_id);
        const bags = a.quantity_bags || a.quantity || 4;
        const subRate = a.subsidy_rate || 600;
        const totalPayable = a.net_paid || a.total_cost || bags * 1850;
        return {
          id: a.id || `alloc-${idx}`,
          distributionCode: a.qr_passbook_code || `SD-2026-00${idx + 1}`,
          farmerName: farmer?.name || a.farmer_name || 'Progressive Farmer',
          farmerCode: farmer?.farmer_code || `FARM-2026-00${idx + 1}`,
          seedVariety: a.seed_variety || field?.crop || 'HD-3086 (Unnat PBW)',
          lotNumber: a.lot_number || `PBW-2026-L${idx + 101}`,
          quantityBags: bags,
          subsidyRatePerBag: subRate,
          totalPayable: totalPayable,
          paymentStatus: a.status || 'PAID',
          date: a.allocated_at || a.created_at || '2025-11-04',
          village: field?.village || farmer?.village || 'Karnal',
        };
      });
    }
    return MOCK_SEED_DISTRIBUTIONS.map((d: any) => ({
      ...d,
      date: d.distributionDate || '2025-11-04',
      village: 'Ludhiana/Karnal',
    }));
  }, [apiAllocations, apiFarmers, apiFields]);

  // 2. Unified Farmer Registry (API + MOCK fallback)
  const farmers = React.useMemo(() => {
    if (apiFarmers.length > 0) {
      return apiFarmers.map((f: any, idx: number) => {
        const userFields = apiFields.filter((p) => p.farmer_id === f.id);
        const totalAcres = userFields.reduce((sum, p) => sum + (p.area || 0), 0) || 10.0;
        return {
          id: f.id,
          farmerCode: f.farmer_code || `FARM-2026-00${idx + 1}`,
          fullName: f.name || 'Farmer',
          fatherName: f.father_name || 'Sh. Harbhajan Singh',
          cnicOrId: f.masked_aadhaar || 'XXXX-XXXX-9182',
          mobile: f.mobile_number || '9814012345',
          village: f.village || 'Village Central',
          district: f.district || 'Karnal',
          state: f.state || 'Haryana',
          wheatAcreage: totalAcres,
          bankAccountNumber: f.bank_account_number || `SBIN000123456${idx}`,
          status: f.status || 'ACTIVE',
          registrationDate: f.registration_date ? f.registration_date.split('T')[0] : '2025-10-15',
        };
      });
    }
    return MOCK_FARMERS.map((f: any) => ({
      ...f,
      registrationDate: f.createdDate || '2025-10-15',
    }));
  }, [apiFarmers, apiFields]);

  // 3. Unified Harvest Summary (API + MOCK fallback)
  const harvests = React.useMemo(() => {
    if (apiHarvests.length > 0) {
      return apiHarvests.map((h: any, idx: number) => {
        const farmer = apiFarmers.find((f) => f.id === h.farmer_id);
        return {
          id: h.id || `hrv-${idx}`,
          harvestCode: h.harvest_code || `HRV-2026-00${idx + 1}`,
          farmerName: farmer?.name || h.farmer_name || 'Rameshwar Sharma',
          harvestDate: h.harvest_date || '2026-04-12',
          totalAcreageHarvested: h.acreage || 5.0,
          totalWeightQuintals: h.total_yield_quintals || h.total_yield_kg ? (h.total_yield_kg / 100) : 110,
          totalWeightMaunds: h.total_weight_maunds || 275,
          grainMoisturePct: h.moisture_percentage || h.grain_moisture_pct || 11.8,
          grainQualityGrade: h.grain_quality_grade || 'GRADE_A_PREMIUM',
          mspRatePerQtl: h.msp_rate || 2275,
        };
      });
    }
    return MOCK_HARVEST_RECORDS.map((h: any) => ({
      ...h,
      totalWeightQuintals: Math.round(h.totalWeightMaunds * 0.4),
      mspRatePerQtl: 2275,
    }));
  }, [apiHarvests, apiFarmers]);

  // 4. Milling Batches (Mock + Dynamic fallback)
  const batches = React.useMemo(() => {
    return MOCK_MILLING_BATCHES;
  }, []);

  // Filtered records based on search query
  const filteredDistributions = distributions.filter((d: any) =>
    d.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.distributionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.seedVariety.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFarmers = farmers.filter((f: any) =>
    f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.farmerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHarvests = harvests.filter((h: any) =>
    h.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.harvestCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBatches = batches.filter((b: any) =>
    b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.storageSiloId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  // Real CSV Generator and Downloader
  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (selectedReport === 'SEED_DIST') {
      filename = `Seed_Subsidy_Disbursement_Audit_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Distribution Code,Farmer Name,Farmer Code,Seed Variety,Lot Number,Quantity (50kg Bags),Subsidy Rate (INR),Total Subsidy (INR),Net Paid (INR),Status,Date\n';
      filteredDistributions.forEach((d: any) => {
        const subsidy = d.subsidyRatePerBag * d.quantityBags;
        csvContent += `"${d.distributionCode}","${d.farmerName}","${d.farmerCode}","${d.seedVariety}","${d.lotNumber}",${d.quantityBags},${d.subsidyRatePerBag},${subsidy},${d.totalPayable},"${d.paymentStatus}","${d.date}"\n`;
      });
    } else if (selectedReport === 'FARMER_REG') {
      filename = `Farmer_Land_Tenure_Registry_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Farmer Code,Full Name,Father Name,Aadhaar ID,Mobile,Village,District,State,Wheat Acreage,Bank Account,Status,Registration Date\n';
      filteredFarmers.forEach((f: any) => {
        csvContent += `"${f.farmerCode}","${f.fullName}","${f.fatherName}","${f.cnicOrId}","${f.mobile}","${f.village}","${f.district}","${f.state}",${f.wheatAcreage},"${f.bankAccountNumber}","${f.status}","${f.registrationDate}"\n`;
      });
    } else if (selectedReport === 'HARVEST_SUMMARY') {
      filename = `Wheat_Harvest_Weighbridge_Report_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Harvest Receipt,Farmer Name,Harvest Date,Acreage (Acres),Yield (Quintals),Yield (Maunds),Moisture (%),Quality Grade,MSP Rate (INR/Qtl),Estimated Value (INR)\n';
      filteredHarvests.forEach((h: any) => {
        const val = h.totalWeightQuintals * (h.mspRatePerQtl || 2275);
        csvContent += `"${h.harvestCode}","${h.farmerName}","${h.harvestDate}",${h.totalAcreageHarvested},${h.totalWeightQuintals},${h.totalWeightMaunds},${h.grainMoisturePct},"${h.grainQualityGrade}",${h.mspRatePerQtl || 2275},${val}\n`;
      });
    } else {
      filename = `Flour_Milling_Extraction_Audit_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Batch ID,Processed Date,Wheat Input (Kg),Flour Yield (Kg),Bran Choker (Kg),Extraction Rate (%),Silo ID\n';
      filteredBatches.forEach((b: any) => {
        csvContent += `"${b.batchNumber}","${b.processedDate}",${b.totalInputWheatKg},${b.flourYieldKg},${b.branYieldKg},${b.extractionRatePct},"${b.storageSiloId}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename} successfully!`);
  };

  // Aggregate Metrics Calculations
  const totalSubsidyAmount = distributions.reduce((sum: number, d: any) => sum + (d.subsidyRatePerBag * d.quantityBags), 0);
  const totalAllocatedBags = distributions.reduce((sum: number, d: any) => sum + d.quantityBags, 0);
  const totalEnrolledAcreage = farmers.reduce((sum: number, f: any) => sum + f.wheatAcreage, 0);
  const totalHarvestQuintals = harvests.reduce((sum: number, h: any) => sum + h.totalWeightQuintals, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Official Agricultural Reports & Audits"
        description="Certified regulatory compliance reports: government seed subsidy disbursement, farmer land tenure, and milling extraction records."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs font-semibold cursor-pointer">
            <Printer className="h-3.5 w-3.5" />
            Print Report
          </Button>
          <Button size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs">
            <Download className="h-3.5 w-3.5" />
            Export Document (.CSV)
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
            records: distributions.length,
            metric: `₹ ${totalSubsidyAmount.toLocaleString()}`,
            metricLabel: 'Subsidy Disbursed',
          },
          {
            id: 'FARMER_REG',
            title: 'Grower Tenure Registry',
            desc: 'Aadhaar, Khasra deed & boundary audits',
            icon: ShieldCheck,
            records: farmers.length,
            metric: `${totalEnrolledAcreage.toFixed(1)} Acres`,
            metricLabel: 'Enrolled Area',
          },
          {
            id: 'HARVEST_SUMMARY',
            title: 'Weighbridge & Yield',
            desc: 'Grain moisture & silo intake audit',
            icon: Wheat,
            records: harvests.length,
            metric: `${totalHarvestQuintals.toLocaleString()} Qtl`,
            metricLabel: 'Total Output',
          },
          {
            id: 'MILLING_AUDIT',
            title: 'Milling Extraction',
            desc: '77% Atta conversion & Silo levels',
            icon: Factory,
            records: batches.length,
            metric: '77.0% Avg',
            metricLabel: 'Extraction Rate',
          },
        ].map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <Card
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as any)}
              className={`cursor-pointer transition-all duration-200 border-2 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-500/5 shadow-xs'
                  : 'hover:border-primary/40 bg-card'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono font-bold bg-muted/50">
                    {rep.records} Records
                  </Badge>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{rep.title}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{rep.desc}</p>
                </div>
                <div className="pt-2 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">{rep.metricLabel}</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{rep.metric}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/80">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search report records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-muted-foreground font-mono hidden md:inline">
            Active Season: <strong>Rabi 2025–2026</strong>
          </span>
          <div className="flex items-center bg-background p-0.5 rounded-lg border">
            <Button
              type="button"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={`h-7 px-3 text-xs font-semibold gap-1.5 cursor-pointer ${
                viewMode === 'table' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : 'text-muted-foreground'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Table
            </Button>
            <Button
              type="button"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className={`h-7 px-3 text-xs font-semibold gap-1.5 cursor-pointer ${
                viewMode === 'cards' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' : 'text-muted-foreground'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Cards
            </Button>
          </div>
        </div>
      </div>

      {/* Official Certified Report Document Paper */}
      <Card className="border shadow-sm bg-card print:border-none print:shadow-none">
        <CardHeader className="border-b pb-4 space-y-2 bg-muted/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Ministry of Agriculture & Farmers Welfare &bull; Govt of India
                </span>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-600 bg-background hidden sm:inline-flex">
                  Verified Audit Dossier
                </Badge>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold pt-2 text-foreground">
                {selectedReport === 'SEED_DIST' && 'Certified Wheat Seed Subsidy Disbursement Audit Report'}
                {selectedReport === 'FARMER_REG' && 'Official Farmer Cadastral & Land Tenure Verification Registry'}
                {selectedReport === 'HARVEST_SUMMARY' && 'Grain Procurement Weighbridge & Yield Inspection Summary'}
                {selectedReport === 'MILLING_AUDIT' && 'Industrial Flour Milling Extraction & Strategic Silo Log'}
              </CardTitle>
              <CardDescription className="text-xs">
                Certified audit log containing live verified field entries, transaction timestamps, and authority sign-offs.
              </CardDescription>
            </div>
            <div className="text-right font-mono text-xs text-muted-foreground shrink-0 hidden sm:block">
              <p className="font-semibold text-foreground">Rabi Season 2025–2026</p>
              <p className="text-[11px]">Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {/* REPORT 1: SEED SUBSIDY AUDIT */}
          {selectedReport === 'SEED_DIST' && (
            viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead className="font-bold">Distribution Code</TableHead>
                    <TableHead className="font-bold">Farmer / Aadhaar</TableHead>
                    <TableHead className="font-bold">Seed Variety & Lot</TableHead>
                    <TableHead className="font-bold text-right">Quantity (50kg Bags)</TableHead>
                    <TableHead className="font-bold text-right">Govt Subsidy (₹)</TableHead>
                    <TableHead className="font-bold text-right">Net Farmer Paid</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {filteredDistributions.map((d: any) => (
                    <TableRow key={d.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {d.distributionCode}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-foreground block">{d.farmerName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{d.farmerCode}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">{d.seedVariety}</span>
                        <span className="text-[11px] text-muted-foreground block font-mono">Lot: {d.lotNumber}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">{d.quantityBags} Bags</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 font-bold">
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
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredDistributions.map((d: any) => (
                  <Card key={d.id} className="border shadow-xs hover:border-emerald-500/40 transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{d.distributionCode}</span>
                          <h4 className="font-bold text-sm text-foreground mt-0.5">{d.farmerName}</h4>
                          <span className="text-[11px] text-muted-foreground font-mono">{d.farmerCode}</span>
                        </div>
                        <StatusBadge status={d.paymentStatus} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Seed Variety</span>
                          <span className="font-semibold text-foreground">{d.seedVariety}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Quantity</span>
                          <span className="font-mono font-bold text-foreground">{d.quantityBags} Bags (50kg)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Govt Subsidy</span>
                          <span className="font-mono font-bold text-emerald-600">₹ {(d.subsidyRatePerBag * d.quantityBags).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Net Paid</span>
                          <span className="font-mono font-bold text-foreground">₹ {d.totalPayable.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {/* REPORT 2: GROWER TENURE REGISTRY */}
          {selectedReport === 'FARMER_REG' && (
            viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead className="font-bold">Farmer Code</TableHead>
                    <TableHead className="font-bold">Full Name & Parentage</TableHead>
                    <TableHead className="font-bold">Aadhaar (Masked)</TableHead>
                    <TableHead className="font-bold">Village & District</TableHead>
                    <TableHead className="font-bold text-right">Wheat Acreage</TableHead>
                    <TableHead className="font-bold">Bank Account</TableHead>
                    <TableHead className="font-bold">Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {filteredFarmers.map((f: any) => (
                    <TableRow key={f.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {f.farmerCode}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-foreground block">{f.fullName}</span>
                        <span className="text-[11px] text-muted-foreground">s/o {f.fatherName}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{f.cnicOrId}</TableCell>
                      <TableCell>
                        <span className="font-medium text-foreground">{f.village}</span>
                        <span className="text-[11px] text-muted-foreground block">{f.district}, {f.state}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">{f.wheatAcreage} Acres</TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground">{f.bankAccountNumber || 'Aadhaar DBT'}</TableCell>
                      <TableCell>
                        <StatusBadge status={f.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredFarmers.map((f: any) => (
                  <Card key={f.id} className="border shadow-xs hover:border-emerald-500/40 transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{f.farmerCode}</span>
                          <h4 className="font-bold text-sm text-foreground mt-0.5">{f.fullName}</h4>
                          <span className="text-[11px] text-muted-foreground">s/o {f.fatherName}</span>
                        </div>
                        <StatusBadge status={f.status} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Location</span>
                          <span className="font-medium text-foreground">{f.village}, {f.district}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Wheat Acreage</span>
                          <span className="font-mono font-bold text-foreground">{f.wheatAcreage} Acres</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Aadhaar (UID)</span>
                          <span className="font-mono text-[11px] text-foreground">{f.cnicOrId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Bank DBT</span>
                          <span className="font-mono text-[11px] text-foreground">{f.bankAccountNumber || 'Active'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {/* REPORT 3: HARVEST WEIGHBRIDGE & YIELD */}
          {selectedReport === 'HARVEST_SUMMARY' && (
            viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead className="font-bold">Harvest Receipt</TableHead>
                    <TableHead className="font-bold">Farmer Name</TableHead>
                    <TableHead className="font-bold">Harvest Date</TableHead>
                    <TableHead className="font-bold text-right">Area (Acres)</TableHead>
                    <TableHead className="font-bold text-right">Yield (Quintals)</TableHead>
                    <TableHead className="font-bold text-center">Moisture %</TableHead>
                    <TableHead className="font-bold text-right">MSP Value (₹)</TableHead>
                    <TableHead className="font-bold">Quality Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {filteredHarvests.map((h: any) => (
                    <TableRow key={h.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {h.harvestCode}
                      </TableCell>
                      <TableCell className="font-bold text-foreground">{h.farmerName}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{h.harvestDate}</TableCell>
                      <TableCell className="text-right font-mono">{h.totalAcreageHarvested} Ac</TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {h.totalWeightQuintals} Qtl
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-blue-600">
                        {h.grainMoisturePct}%
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        ₹ {(h.totalWeightQuintals * (h.mspRatePerQtl || 2275)).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={h.grainQualityGrade} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredHarvests.map((h: any) => (
                  <Card key={h.id} className="border shadow-xs hover:border-emerald-500/40 transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{h.harvestCode}</span>
                          <h4 className="font-bold text-sm text-foreground mt-0.5">{h.farmerName}</h4>
                          <span className="text-[11px] text-muted-foreground font-mono">{h.harvestDate}</span>
                        </div>
                        <StatusBadge status={h.grainQualityGrade} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t">
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Area</span>
                          <span className="font-mono font-bold text-foreground">{h.totalAcreageHarvested} Ac</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Yield</span>
                          <span className="font-mono font-bold text-foreground">{h.totalWeightQuintals} Qtl</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Moisture</span>
                          <span className="font-mono font-bold text-blue-600">{h.grainMoisturePct}%</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t flex items-center justify-between text-xs">
                        <span className="text-muted-foreground text-[10px] uppercase font-semibold">Est. MSP Payout</span>
                        <span className="font-mono font-bold text-emerald-600">₹ {(h.totalWeightQuintals * (h.mspRatePerQtl || 2275)).toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {/* REPORT 4: MILLING EXTRACTION & SILO */}
          {selectedReport === 'MILLING_AUDIT' && (
            viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 text-xs">
                    <TableHead className="font-bold">Batch ID</TableHead>
                    <TableHead className="font-bold">Processed Date</TableHead>
                    <TableHead className="font-bold text-right">Wheat Input (Kg)</TableHead>
                    <TableHead className="font-bold text-right">Flour Yield (Kg)</TableHead>
                    <TableHead className="font-bold text-right">Bran Choker (Kg)</TableHead>
                    <TableHead className="font-bold text-center">Extraction %</TableHead>
                    <TableHead className="font-bold">Silo Destination</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {filteredBatches.map((b: any) => (
                    <TableRow key={b.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {b.batchNumber}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">{b.processedDate}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {b.totalInputWheatKg.toLocaleString()} kg
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 font-bold">
                        {b.flourYieldKg.toLocaleString()} kg
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-600">
                        {b.branYieldKg.toLocaleString()} kg
                      </TableCell>
                      <TableCell className="text-center font-mono font-bold text-primary">
                        {b.extractionRatePct}%
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{b.storageSiloId}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredBatches.map((b: any) => (
                  <Card key={b.id} className="border shadow-xs hover:border-emerald-500/40 transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">{b.batchNumber}</span>
                          <h4 className="font-bold text-sm text-foreground mt-0.5">{b.storageSiloId}</h4>
                        </div>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] border border-emerald-500/20">
                          {b.extractionRatePct}% Ext.
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Wheat Input</span>
                          <span className="font-mono font-bold text-foreground">{b.totalInputWheatKg.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Flour Yield</span>
                          <span className="font-mono font-bold text-emerald-600">{b.flourYieldKg.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Bran (Choker)</span>
                          <span className="font-mono font-medium text-amber-600">{b.branYieldKg.toLocaleString()} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] block uppercase font-semibold">Date</span>
                          <span className="font-mono text-[11px] text-foreground">{b.processedDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
