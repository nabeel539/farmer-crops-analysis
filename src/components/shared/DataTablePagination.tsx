'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  LayoutGrid, 
  Table as TableIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'table' | 'cards';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showViewToggle?: boolean;
  className?: string;
}

export default function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  viewMode = 'table',
  onViewModeChange,
  showViewToggle = true,
  className,
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 border-t border-border/60 text-xs text-muted-foreground',
        className
      )}
    >
      {/* Left side: View Mode Toggle & Items Count */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
            <Button
              type="button"
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('table')}
              className={cn(
                'h-7 px-2.5 text-xs gap-1.5 font-medium rounded-md transition-all',
                viewMode === 'table' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Table View</span>
            </Button>
            <Button
              type="button"
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
              className={cn(
                'h-7 px-2.5 text-xs gap-1.5 font-medium rounded-md transition-all',
                viewMode === 'cards' ? 'shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Card Grid</span>
            </Button>
          </div>
        )}

        <div className="text-xs">
          Showing <span className="font-semibold text-foreground">{startItem}</span> to{' '}
          <span className="font-semibold text-foreground">{endItem}</span> of{' '}
          <span className="font-semibold text-foreground">{totalItems}</span> records
        </div>
      </div>

      {/* Right side: Page size selector & Page navigation buttons */}
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-xs">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => {
              if (val) {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }
            }}
          >
            <SelectTrigger className="h-7 w-[70px] text-xs">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs mr-1 font-mono">
            Page <strong className="text-foreground">{currentPage}</strong> of{' '}
            <strong className="text-foreground">{Math.max(1, totalPages)}</strong>
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            className="h-7 w-7 p-0"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
            <span className="sr-only">First Page</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="sr-only">Previous Page</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="sr-only">Next Page</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="h-7 w-7 p-0"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
            <span className="sr-only">Last Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
