'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search options...',
  className,
  disabled = false,
  required = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [open]);

  const filteredOptions = options.filter((opt) => {
    const q = searchTerm.toLowerCase();
    const lMatch = opt.label.toLowerCase().includes(q);
    const subMatch = opt.subLabel ? opt.subLabel.toLowerCase().includes(q) : false;
    return lMatch || subMatch;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between text-left font-normal text-xs h-9 px-3 rounded-md border border-input bg-transparent dark:bg-input/30 hover:bg-muted/40 transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
          !selectedOption && 'text-muted-foreground',
          className
        )}
      >
        <span className="truncate flex-1 min-w-0">
          {selectedOption ? (
            <span className="font-medium text-foreground">
              {selectedOption.label}
              {selectedOption.subLabel && (
                <span className="text-muted-foreground font-normal ml-1.5 text-[11px]">
                  &bull; {selectedOption.subLabel}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[280px] p-0 shadow-2xl border-border/80 z-[99999] bg-popover" align="start">
        <div className="p-2 border-b border-border/60 bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 pr-7 h-8 text-xs bg-background"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto p-1 text-xs">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No matching options found.
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-2.5 py-2 rounded-md flex items-center justify-between transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-muted text-foreground',
                    option.disabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="truncate">{option.label}</span>
                    {option.subLabel && (
                      <span
                        className={cn(
                          'text-[10px] truncate',
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        )}
                      >
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
