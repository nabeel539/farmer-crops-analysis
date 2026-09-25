'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Search, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlaceSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    village?: string;
    town?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state_district?: string;
    district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectPlace?: (place: {
    address: string;
    village?: string;
    district?: string;
    state?: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Type village, town, or district to auto-locate...',
  className,
  required = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    onChange(text);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            text
          )}&addressdetails=1&limit=6`,
          {
            headers: {
              'Accept-Language': 'en',
            },
          }
        );
        if (res.ok) {
          const data: PlaceSuggestion[] = await res.json();
          setSuggestions(data);
          setIsOpen(data.length > 0);
        }
      } catch (err) {
        console.error('Places geocoding fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelect = (item: PlaceSuggestion) => {
    const addr = item.address || {};
    const village = addr.village || addr.town || addr.suburb || addr.city || '';
    const district = addr.state_district || addr.county || addr.district || addr.city || '';
    const state = addr.state || 'Punjab';
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);

    const displayName = item.display_name;
    setQuery(displayName);
    onChange(displayName);
    setIsOpen(false);

    if (onSelectPlace) {
      onSelectPlace({
        address: displayName,
        village,
        district,
        state,
        lat,
        lng,
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className={cn('pl-8 pr-8 text-xs', className)}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          ) : (
            <Search className="h-3.5 w-3.5 text-muted-foreground/60" />
          )}
        </div>
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-[2000] w-full mt-1 bg-popover border border-border/80 rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in-0 zoom-in-95">
          <div className="p-1.5 bg-muted/40 border-b border-border/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            <span>Places / Geocoding Suggestions</span>
            <span>Live GPS</span>
          </div>
          <div className="py-1">
            {suggestions.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-muted/70 flex items-start gap-2.5 transition-colors group border-b border-border/30 last:border-0"
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate text-xs">{item.display_name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Lat: {parseFloat(item.lat).toFixed(4)}, Lng: {parseFloat(item.lon).toFixed(4)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
