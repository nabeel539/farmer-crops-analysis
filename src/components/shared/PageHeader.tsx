import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  actionButton?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  };
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  children,
  actionButton,
  className
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border/70', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {children}
        {actionButton && (
          <Button 
            variant={actionButton.variant || 'default'} 
            onClick={actionButton.onClick}
            className="gap-2 shadow-sm font-medium"
          >
            {actionButton.icon && <actionButton.icon className="h-4 w-4" />}
            {actionButton.label}
          </Button>
        )}
      </div>
    </div>
  );
}
