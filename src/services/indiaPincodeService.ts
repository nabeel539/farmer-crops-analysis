/**
 * India Pincode & State/District API Service
 * Source: https://aniket-thapa.github.io/india-pincode-api/
 */

import { INDIAN_STATES_AND_DISTRICTS, StateData } from '@/data/indiaStatesDistricts';

export interface PincodePostOffice {
  officeName: string;
  officeType: string;
  deliveryStatus: string;
  circleName?: string;
  regionName?: string;
  divisionName?: string;
  latitude?: number;
  longitude?: number;
}

export interface PincodeLookupResult {
  pincode: string;
  state: string;
  district: string;
  offices: PincodePostOffice[];
}

export interface ApiStateItem {
  name: string;
  slug: string;
  districtCount?: number;
}

export interface ApiStateDetail {
  name: string;
  slug: string;
  districtCount: number;
  districts: {
    name: string;
    slug: string;
    officeCount?: number;
  }[];
}

const API_BASE_URL = 'https://aniket-thapa.github.io/india-pincode-api';

// In-memory response cache
const pincodeCache = new Map<string, PincodeLookupResult>();
const stateDetailCache = new Map<string, ApiStateDetail>();
let stateListCache: ApiStateItem[] | null = null;

/**
 * Format string to Title Case (e.g., 'ANDAMAN AND NICOBAR ISLANDS' -> 'Andaman and Nicobar Islands')
 */
export function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (['and', 'of', 'the', '&'].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Normalizes state name to match our standard internal naming
 */
export function normalizeStateName(rawState: string): string {
  const clean = rawState.trim().toLowerCase();
  const matched = INDIAN_STATES_AND_DISTRICTS.find(
    (s) =>
      s.name.toLowerCase() === clean ||
      s.code.toLowerCase() === clean ||
      s.name.toLowerCase().replace(/\s+/g, '') === clean.replace(/\s+/g, '')
  );
  return matched ? matched.name : toTitleCase(rawState);
}

/**
 * Normalizes district name to match our internal dataset
 */
export function normalizeDistrictName(rawDistrict: string, stateName?: string): string {
  const clean = rawDistrict.trim().toLowerCase();
  if (stateName) {
    const stateObj = INDIAN_STATES_AND_DISTRICTS.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase()
    );
    if (stateObj) {
      const distMatch = stateObj.districts.find(
        (d) =>
          d.name.toLowerCase() === clean ||
          d.code.toLowerCase() === clean.replace(/\s+/g, '_')
      );
      if (distMatch) return distMatch.name;
    }
  }
  return toTitleCase(rawDistrict);
}

/**
 * Lookup details for a 6-digit Indian Pincode
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult | null> {
  const cleanPin = pincode.trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return null;
  }

  if (pincodeCache.has(cleanPin)) {
    return pincodeCache.get(cleanPin)!;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/pincodes/${cleanPin}.json`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const normalizedState = normalizeStateName(data.state || '');
    const normalizedDistrict = normalizeDistrictName(data.district || '', normalizedState);

    const result: PincodeLookupResult = {
      pincode: cleanPin,
      state: normalizedState,
      district: normalizedDistrict,
      offices: (data.offices || []).map((o: any) => ({
        officeName: toTitleCase(o.officeName || ''),
        officeType: o.officeType || 'PO',
        deliveryStatus: o.deliveryStatus || 'Delivery',
        circleName: o.circleName,
        regionName: o.regionName,
        divisionName: o.divisionName,
        latitude: o.latitude,
        longitude: o.longitude,
      })),
    };

    pincodeCache.set(cleanPin, result);
    return result;
  } catch (error) {
    console.warn(`India Pincode API lookup failed for ${cleanPin}:`, error);
    return null;
  }
}

/**
 * Fetch list of all Indian states from the API
 */
export async function fetchStateList(): Promise<ApiStateItem[]> {
  if (stateListCache) {
    return stateListCache;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/states.json`);
    if (response.ok) {
      const data: ApiStateItem[] = await response.json();
      stateListCache = data.map((s) => ({
        ...s,
        name: toTitleCase(s.name),
      }));
      return stateListCache;
    }
  } catch (error) {
    console.warn('Failed to fetch states from API, using local fallback:', error);
  }

  // Fallback to local dataset
  return INDIAN_STATES_AND_DISTRICTS.map((s) => ({
    name: s.name,
    slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    districtCount: s.districts.length,
  }));
}

/**
 * Fetch districts for a specific state slug
 */
export async function fetchStateDistricts(stateSlug: string): Promise<string[]> {
  const cleanSlug = stateSlug.toLowerCase().trim();
  if (stateDetailCache.has(cleanSlug)) {
    return stateDetailCache.get(cleanSlug)!.districts.map((d) => d.name);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/states/${cleanSlug}.json`);
    if (response.ok) {
      const data: ApiStateDetail = await response.json();
      const formatted: ApiStateDetail = {
        ...data,
        name: toTitleCase(data.name),
        districts: (data.districts || []).map((d) => ({
          ...d,
          name: toTitleCase(d.name),
        })),
      };
      stateDetailCache.set(cleanSlug, formatted);
      return formatted.districts.map((d) => d.name);
    }
  } catch (error) {
    console.warn(`Failed to fetch districts for state ${stateSlug} from API:`, error);
  }

  // Fallback to local dataset
  const localMatch = INDIAN_STATES_AND_DISTRICTS.find(
    (s) =>
      s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanSlug ||
      s.name.toLowerCase() === cleanSlug.replace(/-/g, ' ')
  );

  return localMatch ? localMatch.districts.map((d) => d.name) : [];
}
