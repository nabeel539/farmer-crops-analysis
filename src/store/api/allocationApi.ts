import { baseApi } from './baseApi';

export interface SeedAllocation {
  id: string;
  seed_batch_id: string;
  farmer_id: string;
  field_id: string;
  quantity: number;
  unit: string;
  allocation_date: string;
  allocated_by: string | null;
  remarks: string | null;
  created_at: string;
}

export interface SeedAllocationCreateRequest {
  seed_batch_id: string;
  farmer_id: string;
  field_id: string;
  quantity: number;
  unit?: string;
  allocation_date?: string | null;
  remarks?: string | null;
}

export interface AllocationListParams {
  farmer_id?: string;
  field_id?: string;
  seed_batch_id?: string;
}

export const allocationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllocations: builder.query<SeedAllocation[], AllocationListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.farmer_id) queryParams.set('farmer_id', params.farmer_id);
          if (params.field_id) queryParams.set('field_id', params.field_id);
          if (params.seed_batch_id) queryParams.set('seed_batch_id', params.seed_batch_id);
        }
        const qs = queryParams.toString();
        return qs ? `/seed-allocations?${qs}` : '/seed-allocations';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SeedAllocation' as const, id })),
              { type: 'SeedAllocation', id: 'LIST' },
            ]
          : [{ type: 'SeedAllocation', id: 'LIST' }],
    }),
    createAllocation: builder.mutation<SeedAllocation, SeedAllocationCreateRequest>({
      query: (allocationData) => ({
        url: '/seed-allocations',
        method: 'POST',
        body: allocationData,
      }),
      invalidatesTags: [
        { type: 'SeedAllocation', id: 'LIST' },
        { type: 'SeedBatch', id: 'LIST' },
        'SeedBatch',
      ],
    }),
  }),
});

export const {
  useGetAllocationsQuery,
  useCreateAllocationMutation,
} = allocationApi;
