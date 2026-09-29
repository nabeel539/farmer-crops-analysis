import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'secondary';
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
  onClick,
}: MetricCardProps) {
  const variantStyles = {
    default: {
      iconBg: 'bg-muted/70 text-foreground border-border/80 shadow-xs',
      topLine: 'from-muted-foreground/30 to-transparent',
      glow: 'hover:border-border/90 hover:shadow-sm',
    },
    primary: {
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10',
      topLine: 'from-emerald-500 to-teal-400',
      glow: 'hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5',
    },
    success: {
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-xs shadow-emerald-500/10',
      topLine: 'from-emerald-500 to-green-400',
      glow: 'hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5',
    },
    warning: {
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs shadow-amber-500/10',
      topLine: 'from-amber-500 to-orange-400',
      glow: 'hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5',
    },
    info: {
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 shadow-xs shadow-blue-500/10',
      topLine: 'from-blue-500 to-indigo-400',
      glow: 'hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5',
    },
    secondary: {
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-xs shadow-purple-500/10',
      topLine: 'from-purple-500 to-pink-400',
      glow: 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden transition-all duration-300 rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xs hover:shadow-md hover:-translate-y-1',
        currentVariant.glow,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Top ambient colored highlight line */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-90 transition-opacity group-hover:opacity-100',
          currentVariant.topLine
        )}
      />

      <CardContent className="p-5 pt-5.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-foreground">
              {value}
            </h3>
          </div>
          <div
            className={cn(
              'p-3 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
              currentVariant.iconBg
            )}
          >
            <Icon className="h-5 w-5 stroke-[2.2]" />
          </div>
        </div>

        {(subtitle || trend) && (
          <div className="mt-3.5 pt-2.5 border-t border-border/60 flex items-center justify-between gap-2 text-xs">
            {subtitle && (
              <span className="text-muted-foreground text-[11px] truncate font-medium">
                {subtitle}
              </span>
            )}
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[11px] shrink-0 font-mono shadow-2xs',
                  trend.isPositive
                    ? 'text-emerald-700 bg-emerald-500/15 border border-emerald-500/30 dark:text-emerald-400'
                    : 'text-rose-700 bg-rose-500/15 border border-rose-500/30 dark:text-rose-400'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.isPositive ? '+' : ''}
                {trend.value}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
