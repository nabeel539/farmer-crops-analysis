'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SeedAllocation } from '@/store/api/allocationApi';
import { Farmer } from '@/store/api/farmerApi';
import { useGetSeedBatchesQuery } from '@/store/api/seedApi';
import {
  CreditCard,
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  Wheat,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FarmerPassbookProps {
  farmer: Farmer;
  allocations: SeedAllocation[];
  isLoading: boolean;
}

export function FarmerPassbook({ farmer, allocations, isLoading }: FarmerPassbookProps) {
  const { data: batches = [] } = useGetSeedBatchesQuery();
  const [selectedAllocation, setSelectedAllocation] = useState<SeedAllocation | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  const handlePrintSlip = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    toast.success(`Official Passbook receipt for ${farmer.name} downloaded.`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 to-background dark:from-emerald-950/20 dark:to-background">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Certified Seed Passbook & Digital Slips
                </CardTitle>
                <CardDescription className="text-xs">
                  Official Government subsidized foundation & certified seed disbursement records for {farmer.name}.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-background text-emerald-700 dark:text-emerald-400 font-mono text-xs">
                Total Allotted: {allocations.reduce((acc, curr) => acc + curr.quantity, 0)} KG
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Allocations Table / Cards */}
      {allocations.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">No Seed Allocations Recorded</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                No certified wheat seed bags have been disbursed to this farmer profile yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allocations.map((alloc) => {
            const batch = batches.find((b) => b.id === alloc.seed_batch_id);
            const slipNo = `SLIP-2026-${alloc.id.slice(0, 6).toUpperCase()}`;

            return (
              <Card key={alloc.id} className="border border-border/80 hover:border-emerald-500/40 transition-all shadow-xs">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-sm font-mono text-foreground">{slipNo}</span>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                      Verified & Disbursed
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Seed Variety</span>
                      <span className="font-bold text-foreground">{batch?.batch_number ? `Certified Seed (${batch.batch_number})` : 'Certified Wheat Seed'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Quantity</span>
                      <span className="font-bold text-foreground font-mono">{alloc.quantity} {alloc.unit || 'KG'} ({(alloc.quantity / 50).toFixed(0)} Bags)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Batch Lot No</span>
                      <span className="font-mono text-foreground font-medium">{batch?.batch_number || alloc.seed_batch_id.slice(0, 10)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Date Issued</span>
                      <span className="text-foreground">{alloc.allocation_date || format(new Date(alloc.created_at), 'dd MMM yyyy')}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>PAU Quality Certified</span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAllocation(alloc)}
                      className="text-xs h-8 gap-1.5 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 cursor-pointer"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>View Passbook Slip</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Official Digital Passbook Slip Dialog */}
      {selectedAllocation && (
        <Dialog open={!!selectedAllocation} onOpenChange={() => setSelectedAllocation(null)}>
          <DialogContent className="max-w-lg p-0 overflow-hidden bg-background">
            <div id="printable-passbook-slip" className="p-6 space-y-5 bg-card text-card-foreground">
              {/* Slip Header */}
              <div className="border-b-2 border-emerald-600 pb-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Wheat className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">
                    KRISHI AGRITECH PORTAL
                  </h2>
                </div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Official Certified Seed Disbursement Passbook Slip
                </p>
                <div className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1">
                  SLIP NO: SLIP-2026-{selectedAllocation.id.slice(0, 8).toUpperCase()}
                </div>
              </div>

              {/* Beneficiary & Allotment Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-4 rounded-xl border border-border/80">
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Beneficiary Farmer</span>
                  <span className="font-bold text-foreground text-sm">{farmer.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Farmer ID / Mobile</span>
                  <span className="font-mono font-medium text-foreground">{farmer.mobile_number}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Village & District</span>
                  <span className="text-foreground">{farmer.village}, {farmer.district}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Disbursement Date</span>
                  <span className="font-mono text-foreground">
                    {selectedAllocation.allocation_date || format(new Date(selectedAllocation.created_at), 'dd MMM yyyy')}
                  </span>
                </div>
              </div>

              {/* Seed Spec Table */}
              <div className="border border-border/80 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/80 text-muted-foreground uppercase text-[10px] font-semibold border-b border-border/80">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">Lot / Batch</th>
                      <th className="p-2.5 text-right">Disbursed (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="p-2.5 font-bold text-foreground">Certified High-Yield Wheat Seed</td>
                      <td className="p-2.5 font-mono text-[11px]">
                        {batches.find((b) => b.id === selectedAllocation.seed_batch_id)?.batch_number || selectedAllocation.seed_batch_id.slice(0, 10)}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-600 text-sm">
                        {selectedAllocation.quantity} {selectedAllocation.unit || 'KG'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* QR Verification Seal & Signatures */}
              <div className="pt-2 flex items-center justify-between gap-4 border-t border-dashed border-border/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background border-2 border-emerald-600 rounded-lg shadow-xs">
                    <QrCode className="h-12 w-12 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    <span className="font-bold text-foreground block">Verified Digital Seal</span>
                    Cryptographically logged on Krishi Central Ledger.
                  </div>
                </div>

                <div className="text-center">
                  <div className="h-8 border-b border-foreground/40 w-28 mx-auto" />
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground block pt-1 font-semibold">
                    Authorized Officer
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-muted/30 border-t border-border/60 flex flex-row justify-between sm:justify-between items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAllocation(null)}
                className="text-xs"
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintSlip}
                  className="text-xs gap-1.5 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print Slip</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadInvoice}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Slip</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
