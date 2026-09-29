import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { setCredentials, logout } from '../slices/authSlice';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state or localStorage
    const state = getState() as RootState;
    const token =
      (state.auth as any)?.token ||
      (typeof window !== 'undefined' ? localStorage.getItem('krishi_token') : null);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krishi_token');
      localStorage.removeItem('krishi_user');
    }
    api.dispatch(logout());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: 30,
  baseQuery: baseQueryWithReauth,
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
