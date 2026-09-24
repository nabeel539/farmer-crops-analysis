import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CropCycleStage, 
  CropHealthStatus, 
  ActivityType, 
  SeedCategory 
} from '@/types';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variantClass = 'bg-secondary text-secondary-foreground border-border';
  let label = status.replace(/_/g, ' ');

  // Farmer & General Status
  if (status === 'ACTIVE' || status === 'VERIFIED' || status === 'COMPLETED' || status === 'PAID' || status === 'GRADE_A_PREMIUM' || status === 'OPTIMAL') {
    variantClass = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
  } else if (status === 'INACTIVE' || status === 'REJECTED' || status === 'OVERDUE' || status === 'CRITICAL' || status === 'DISEASED' || status === 'HIGH' || status === 'GRADE_C_FEED') {
    variantClass = 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
  } else if (status === 'PENDING' || status === 'PENDING_VERIFICATION' || status === 'PENDING_DELIVERY' || status === 'PARTIAL' || status === 'STRESSED' || status === 'MEDIUM' || status === 'WARNING') {
    variantClass = 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
  } else if (status === 'FLAGGED' || status === 'QUALITY_HOLD' || status === 'CREDIT') {
    variantClass = 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30';
  } else if (status === 'GOOD' || status === 'IN_STOCK' || status === 'DELIVERED_TO_MILL' || status === 'STORED_IN_SILO' || status === 'GRADE_B_STANDARD' || status === 'SUBSIDIZED') {
    variantClass = 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
  } else if (status === 'IN_PROCESSING' || status === 'PLANTED' || status === 'DISPATCHED' || status === 'DISTRIBUTED') {
    variantClass = 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30';
  }

  // Crop Cycle Stages
  const stageLabels: Record<string, string> = {
    LAND_PREPARATION: 'Land Prep',
    SOWING: 'Sowing',
    CROWN_ROOT_INITIATION: 'Crown Root (CRI)',
    TILLERING: 'Tillering',
    JOINTING: 'Jointing',
    BOOTING: 'Booting',
    HEADING_FLOWERING: 'Heading & Flowering',
    MILK_STAGE: 'Milk Stage',
    DOUGH_STAGE: 'Dough Stage',
    MATURITY_RIPENING: 'Maturity / Ripening',
    HARVESTED: 'Harvested'
  };

  if (stageLabels[status]) {
    label = stageLabels[status];
    variantClass = 'bg-primary/15 text-primary border-primary/30';
  }

  return (
    <Badge 
      variant="outline" 
      className={cn('capitalize font-medium text-xs tracking-tight px-2.5 py-0.5 border shadow-none whitespace-nowrap', variantClass, className)}
    >
      {label}
    </Badge>
  );
}
