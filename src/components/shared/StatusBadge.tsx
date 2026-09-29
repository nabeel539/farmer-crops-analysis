import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  let variantClass = 'bg-secondary text-secondary-foreground border-border/80';
  let dotClass = 'bg-muted-foreground';
  let label = status.replace(/_/g, ' ');

  // Farmer & General Status
  if (
    status === 'ACTIVE' ||
    status === 'VERIFIED' ||
    status === 'COMPLETED' ||
    status === 'PAID' ||
    status === 'GRADE_A_PREMIUM' ||
    status === 'OPTIMAL'
  ) {
    variantClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 shadow-2xs';
    dotClass = 'bg-emerald-500 animate-pulse';
  } else if (
    status === 'INACTIVE' ||
    status === 'REJECTED' ||
    status === 'OVERDUE' ||
    status === 'CRITICAL' ||
    status === 'DISEASED' ||
    status === 'HIGH' ||
    status === 'GRADE_C_FEED'
  ) {
    variantClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 shadow-2xs';
    dotClass = 'bg-rose-500';
  } else if (
    status === 'PENDING' ||
    status === 'PENDING_VERIFICATION' ||
    status === 'CORRECTION_REQUIRED' ||
    status === 'PENDING_DELIVERY' ||
    status === 'PARTIAL' ||
    status === 'STRESSED' ||
    status === 'MEDIUM' ||
    status === 'WARNING'
  ) {
    variantClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 shadow-2xs';
    dotClass = 'bg-amber-500';
  } else if (status === 'FLAGGED' || status === 'QUALITY_HOLD' || status === 'CREDIT') {
    variantClass = 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 shadow-2xs';
    dotClass = 'bg-orange-500';
  } else if (
    status === 'GOOD' ||
    status === 'IN_STOCK' ||
    status === 'DELIVERED_TO_MILL' ||
    status === 'STORED_IN_SILO' ||
    status === 'GRADE_B_STANDARD' ||
    status === 'SUBSIDIZED'
  ) {
    variantClass = 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 shadow-2xs';
    dotClass = 'bg-blue-500';
  } else if (
    status === 'IN_PROCESSING' ||
    status === 'PLANTED' ||
    status === 'DISPATCHED' ||
    status === 'DISTRIBUTED'
  ) {
    variantClass = 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 shadow-2xs';
    dotClass = 'bg-purple-500';
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
    HARVESTED: 'Harvested',
  };

  if (stageLabels[status]) {
    label = stageLabels[status];
    variantClass = 'bg-primary/10 text-primary border-primary/30 shadow-2xs';
    dotClass = 'bg-primary';
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize font-semibold text-xs tracking-tight px-2.5 py-0.5 rounded-full border shadow-none whitespace-nowrap inline-flex items-center gap-1.5',
        variantClass,
        className
      )}
    >
      {showDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />}
      <span>{label}</span>
    </Badge>
  );
}
