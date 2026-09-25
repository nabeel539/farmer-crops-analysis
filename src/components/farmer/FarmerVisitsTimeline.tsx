'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OfficerVisitRecord } from '@/store/api/visitApi';
import { Farmer } from '@/store/api/farmerApi';
import {
  ShieldCheck,
  Calendar,
  UserCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { format } from 'date-fns';

interface FarmerVisitsTimelineProps {
  farmer: Farmer;
  visits: OfficerVisitRecord[];
  isLoading: boolean;
}

export function FarmerVisitsTimeline({ farmer, visits, isLoading }: FarmerVisitsTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-50/60 to-background dark:from-blue-950/20 dark:to-background shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">
                  Field Officer Scouting & Ground Truth Inspections
                </CardTitle>
                <CardDescription className="text-xs">
                  Official on-site visits and recommendations by Department of Agriculture Agronomists.
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="bg-background text-blue-700 dark:text-blue-400 font-mono text-xs">
              Total Inspections: {visits.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Visits List */}
      {visits.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">No Officer Visits Logged Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your assigned Agriculture Field Officer will conduct routine crop scouting and log recommendations here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visits.map((v) => (
            <Card key={v.id} className="border border-border/80 hover:border-blue-500/40 transition-all shadow-xs">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-bold text-sm text-foreground">
                      {v.visit_type.replace(/_/g, ' ')} Inspection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 text-[10px]">
                      {v.verification_status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {v.visit_date}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Observed Stage</span>
                    <span className="font-semibold text-foreground">{v.observed_stage || 'Tillering'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Crop Condition</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{v.crop_condition || 'Good Stand'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Pest / Disease Status</span>
                    <span className="font-semibold text-foreground">{v.pest_observed || 'No Significant Pest'}</span>
                  </div>
                </div>

                {v.action_recommended && (
                  <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      Officer Recommendation:
                    </div>
                    <p className="text-xs text-blue-950 dark:text-blue-200 leading-relaxed">
                      {v.action_recommended}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
