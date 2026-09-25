import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const baseApi = createApi({
  reducerPath: 'api',
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state or localStorage
      const state = getState() as RootState;
      const token = (state.auth as any)?.token || (typeof window !== 'undefined' ? localStorage.getItem('krishi_token') : null);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'User',
    'Vendor',
    'SeedSupply',
    'SeedBatch',
    'Farmer',
    'Field',
    'SeedAllocation',
    'CropCycle',
    'Activity',
    'OfficerVisit',
    'HarvestRecord',
    'Report',
  ],
  endpoints: () => ({}),
});
