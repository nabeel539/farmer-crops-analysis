'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Table as TableIcon, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  onReset?: () => void;
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
  className?: string;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onReset,
  viewMode = 'table',
  onViewModeChange,
  className,
}: SearchFilterBarProps) {
  const hasActiveFilters =
    searchQuery !== '' || filters.some((f) => f.value !== 'ALL' && f.value !== '');

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full p-1.5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/70 shadow-xs',
        className
      )}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9.5 pr-8 bg-background/80 text-foreground text-xs rounded-xl border-border/80 focus:border-primary transition-all h-9.5"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-full hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Select
            key={filter.id}
            value={filter.value}
            onValueChange={(val) => {
              if (val !== null) filter.onChange(val);
            }}
          >
            <SelectTrigger className="w-[140px] sm:w-[160px] bg-background/80 text-xs rounded-xl border-border/80 h-9.5 font-medium">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-border/80 shadow-lg">
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs rounded-lg">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {hasActiveFilters && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer rounded-xl hover:bg-muted/80"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        {onViewModeChange && (
          <div className="flex items-center bg-muted/70 p-0.5 rounded-xl border border-border/60">
            <Button
              type="button"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              title="Table View"
              className={cn(
                'h-8 px-2.5 text-xs gap-1.5 font-semibold rounded-lg transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-2xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Table</span>
            </Button>
            <Button
              type="button"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
              title="Card Grid View"
              className={cn(
                'h-8 px-2.5 text-xs gap-1.5 font-semibold rounded-lg transition-all cursor-pointer',
                viewMode === 'cards'
                  ? 'bg-card text-foreground shadow-2xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Cards</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
