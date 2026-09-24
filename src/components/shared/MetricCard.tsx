import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  variant = 'default',
  onClick
}: MetricCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200 border bg-card text-card-foreground',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-sm',
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          </div>
          <div className={cn(
            'p-2.5 rounded-xl flex items-center justify-center',
            variant === 'primary' ? 'bg-primary/20 text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          )}>
            <Icon className="h-5 w-5 stroke-[1.8]" />
          </div>
        </div>

        {(subtitle || trend) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center font-semibold px-1.5 py-0.5 rounded text-[11px]',
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-500/15 dark:text-emerald-400'
                    : 'text-rose-700 bg-rose-500/15 dark:text-rose-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}
              </span>
            )}
            {trend?.label && <span className="text-muted-foreground">{trend.label}</span>}
            {subtitle && !trend && <span className="text-muted-foreground">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
