import { baseApi } from './baseApi';

export interface Farmer {
  id: string;
  name: string;
  mobile_number: string;
  address: string | null;
  village: string;
  block: string | null;
  district: string;
  state: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface FarmerCreateRequest {
  name: string;
  mobile_number: string;
  address?: string | null;
  village: string;
  block?: string | null;
  district: string;
  state: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION';
  registration_date?: string | null;
}

export interface FarmerListParams {
  village?: string;
  district?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const farmerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFarmers: builder.query<Farmer[], FarmerListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.village) queryParams.set('village', params.village);
          if (params.district) queryParams.set('district', params.district);
          if (params.status) queryParams.set('status', params.status);
          if (params.search) queryParams.set('search', params.search);
          if (params.page) queryParams.set('page', params.page.toString());
          if (params.limit) queryParams.set('limit', params.limit.toString());
        }
        const qs = queryParams.toString();
        return qs ? `/farmers?${qs}` : '/farmers';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Farmer' as const, id })),
              { type: 'Farmer', id: 'LIST' },
            ]
          : [{ type: 'Farmer', id: 'LIST' }],
    }),
    getFarmerById: builder.query<Farmer, string>({
      query: (id) => `/farmers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Farmer', id }],
    }),
    createFarmer: builder.mutation<Farmer, FarmerCreateRequest>({
      query: (farmerData) => ({
        url: '/farmers',
        method: 'POST',
        body: farmerData,
      }),
      invalidatesTags: [{ type: 'Farmer', id: 'LIST' }],
    }),
    updateFarmer: builder.mutation<Farmer, { id: string; data: Partial<FarmerCreateRequest> }>({
      query: ({ id, data }) => ({
        url: `/farmers/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Farmer', id },
        { type: 'Farmer', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFarmersQuery,
  useGetFarmerByIdQuery,
  useCreateFarmerMutation,
  useUpdateFarmerMutation,
} = farmerApi;
