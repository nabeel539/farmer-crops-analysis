import { baseApi } from './baseApi';

export interface SeedSupply {
  id: string;
  vendor_id: string;
  crop: string;
  variety: string;
  supply_date: string;
  purchase_reference: string | null;
  remarks: string | null;
  created_at: string;
}

export interface SeedBatch {
  id: string;
  supply_id: string;
  batch_number: string;
  quantity: number;
  unit: string;
  received_quantity: number;
  allocated_quantity: number;
  available_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface SeedSupplyCreateRequest {
  vendor_id: string;
  crop: string;
  variety: string;
  batch_number: string;
  quantity: number;
  unit?: string;
  supply_date: string;
  purchase_reference?: string | null;
  remarks?: string | null;
}

export const seedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSeedSupplies: builder.query<SeedSupply[], { vendor_id?: string } | void>({
      query: (params) => {
        if (params && params.vendor_id) {
          return `/seeds/supplies?vendor_id=${params.vendor_id}`;
        }
        return '/seeds/supplies';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SeedSupply' as const, id })),
              { type: 'SeedSupply', id: 'LIST' },
            ]
          : [{ type: 'SeedSupply', id: 'LIST' }],
    }),
    getSeedBatches: builder.query<SeedBatch[], void>({
      query: () => '/seeds/batches',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'SeedBatch' as const, id })),
              { type: 'SeedBatch', id: 'LIST' },
            ]
          : [{ type: 'SeedBatch', id: 'LIST' }],
    }),
    getSeedBatchById: builder.query<SeedBatch, string>({
      query: (id) => `/seeds/batches/${id}`,
      providesTags: (result, error, id) => [{ type: 'SeedBatch', id }],
    }),
    createSeedSupply: builder.mutation<SeedSupply, SeedSupplyCreateRequest>({
      query: (supplyData) => ({
        url: '/seeds/supplies',
        method: 'POST',
        body: supplyData,
      }),
      invalidatesTags: [
        { type: 'SeedSupply', id: 'LIST' },
        { type: 'SeedBatch', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSeedSuppliesQuery,
  useGetSeedBatchesQuery,
  useGetSeedBatchByIdQuery,
  useCreateSeedSupplyMutation,
} = seedApi;
