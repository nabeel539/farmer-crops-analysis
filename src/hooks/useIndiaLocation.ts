'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  lookupPincode,
  fetchStateList,
  fetchStateDistricts,
  PincodeLookupResult,
  ApiStateItem,
} from '@/services/indiaPincodeService';
import {
  getAllStateOptions,
  getDistrictsForState,
} from '@/data/indiaStatesDistricts';

export function useIndiaLocation() {
  const [states, setStates] = useState<{ label: string; value: string }[]>(getAllStateOptions());
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeData, setPincodeData] = useState<PincodeLookupResult | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Initialize live states from API with fallback
  useEffect(() => {
    let isMounted = true;
    fetchStateList()
      .then((apiStates) => {
        if (isMounted && apiStates.length > 0) {
          const formatted = apiStates.map((s) => ({
            label: s.name,
            value: s.name,
          }));
          setStates(formatted);
        }
      })
      .catch(() => {
        // Fallback already initialized with getAllStateOptions()
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const searchPincode = useCallback(async (pin: string) => {
    const clean = pin.trim();
    if (clean.length !== 6 || !/^\d{6}$/.test(clean)) {
      setPincodeData(null);
      setPincodeError(null);
      return null;
    }

    setIsPincodeLoading(true);
    setPincodeError(null);

    try {
      const result = await lookupPincode(clean);
      if (result) {
        setPincodeData(result);
        setIsPincodeLoading(false);
        return result;
      } else {
        setPincodeData(null);
        setPincodeError('Pincode not found in India Post database');
        setIsPincodeLoading(false);
        return null;
      }
    } catch (err) {
      setPincodeData(null);
      setPincodeError('Failed to lookup pincode');
      setIsPincodeLoading(false);
      return null;
    }
  }, []);

  const getDistricts = useCallback((stateName: string) => {
    if (!stateName) return [];
    return getDistrictsForState(stateName);
  }, []);

  return {
    states,
    getDistricts,
    searchPincode,
    isPincodeLoading,
    pincodeData,
    pincodeError,
    clearPincodeData: () => setPincodeData(null),
  };
}
