import React from 'react';
import { CropCycleStage } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const WHEAT_STAGES: { key: CropCycleStage; label: string; days: string }[] = [
  { key: 'LAND_PREPARATION', label: 'Land Prep', days: 'Day 0' },
  { key: 'SOWING', label: 'Sowing', days: 'Day 1-7' },
  { key: 'CROWN_ROOT_INITIATION', label: 'Crown Root (CRI)', days: 'Day 20-25' },
  { key: 'TILLERING', label: 'Tillering', days: 'Day 35-45' },
  { key: 'JOINTING', label: 'Jointing', days: 'Day 60-70' },
  { key: 'BOOTING', label: 'Booting', days: 'Day 75-85' },
  { key: 'HEADING_FLOWERING', label: 'Heading / Flowering', days: 'Day 90-100' },
  { key: 'MILK_STAGE', label: 'Milk Stage', days: 'Day 105-115' },
  { key: 'DOUGH_STAGE', label: 'Dough Stage', days: 'Day 120-130' },
  { key: 'MATURITY_RIPENING', label: 'Maturity', days: 'Day 135-145' },
  { key: 'HARVESTED', label: 'Harvested', days: 'Day 150+' }
];

interface StageProgressBarProps {
  currentStage: CropCycleStage;
  className?: string;
}

export function StageProgressBar({ currentStage, className }: StageProgressBarProps) {
  const currentIndex = WHEAT_STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className={cn('w-full py-4', className)}>
      <div className="relative flex items-center justify-between">
        {/* Background track line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-muted -z-0 rounded-full" />
        
        {/* Active progress fill */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-0 transition-all duration-500 rounded-full"
          style={{ width: `${Math.max(0, (currentIndex / (WHEAT_STAGES.length - 1)) * 100)}%` }}
        />

        {WHEAT_STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center group relative z-10">
              <div 
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 border-2',
                  isCompleted && 'bg-primary text-primary-foreground border-primary',
                  isCurrent && 'bg-background text-primary border-primary ring-4 ring-primary/20 scale-110',
                  isUpcoming && 'bg-background text-muted-foreground border-muted-foreground/30'
                )}
              >
                {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
              </div>
              <span 
                className={cn(
                  'absolute top-8 text-[11px] font-medium tracking-tight whitespace-nowrap transition-colors hidden sm:block',
                  isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-foreground' : 'text-muted-foreground/60'
                )}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Mobile Current Stage Indicator */}
      <div className="sm:hidden mt-4 flex items-center justify-between text-xs font-medium px-1">
        <span className="text-muted-foreground">Current Stage:</span>
        <span className="text-primary font-bold">{WHEAT_STAGES[currentIndex]?.label} ({WHEAT_STAGES[currentIndex]?.days})</span>
      </div>
    </div>
  );
}
