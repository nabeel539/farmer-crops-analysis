'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIndiaLocation } from '@/hooks/useIndiaLocation';
import {
  MapPin,
  Loader2,
  CheckCircle2,
  Sparkles,
  Building2,
  AlertCircle,
} from 'lucide-react';

interface PincodeQuickLookupProps {
  onLocationSelected: (data: {
    state: string;
    district: string;
    pincode: string;
    selectedOffice?: string;
  }) => void;
  className?: string;
  defaultPincode?: string;
}

export function PincodeQuickLookup({
  onLocationSelected,
  className = '',
  defaultPincode = '',
}: PincodeQuickLookupProps) {
  const [pinInput, setPinInput] = useState(defaultPincode);
  const { searchPincode, isPincodeLoading, pincodeData, pincodeError } = useIndiaLocation();
  const lastLookedUpPinRef = React.useRef<string>('');
  const onLocationSelectedRef = React.useRef(onLocationSelected);

  useEffect(() => {
    onLocationSelectedRef.current = onLocationSelected;
  }, [onLocationSelected]);

  useEffect(() => {
    if (pinInput.length === 6 && /^\d{6}$/.test(pinInput)) {
      if (lastLookedUpPinRef.current === pinInput) {
        return;
      }
      lastLookedUpPinRef.current = pinInput;
      searchPincode(pinInput).then((res) => {
        if (res) {
          onLocationSelectedRef.current?.({
            state: res.state,
            district: res.district,
            pincode: res.pincode,
            selectedOffice: res.offices.length > 0 ? res.offices[0].officeName : undefined,
          });
        }
      });
    } else {
      lastLookedUpPinRef.current = '';
    }
  }, [pinInput, searchPincode]);


  return (
    <div className={`space-y-2 p-3 rounded-lg border border-border/80 bg-muted/30 ${className}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="pincode-quick-input" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>India Pincode Quick Auto-Fill</span>
        </Label>
        <span className="text-[10px] text-muted-foreground">e.g. 132001, 110001, 141001</span>
      </div>

      <div className="relative">
        <Input
          id="pincode-quick-input"
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit Pincode to auto-fill State & District..."
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
          className="h-8.5 text-xs pr-8 font-mono bg-background"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {isPincodeLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : pincodeData ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          ) : (
            <MapPin className="h-3.5 w-3.5" />
          )}
        </div>
      </div>

      {pincodeError && (
        <div className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{pincodeError}</span>
        </div>
      )}

      {pincodeData && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Detected Location:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {pincodeData.district}, {pincodeData.state}
            </span>
          </div>

          {pincodeData.offices.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground block">
                Select village / post office:
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                {pincodeData.offices.slice(0, 8).map((office, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onLocationSelected({
                        state: pincodeData.state,
                        district: pincodeData.district,
                        pincode: pincodeData.pincode,
                        selectedOffice: office.officeName,
                      })
                    }
                    className="h-5 px-1.5 text-[10px] bg-background hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Building2 className="h-2.5 w-2.5 mr-1 text-muted-foreground" />
                    {office.officeName}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
