import { baseApi } from './baseApi';

export interface HarvestRecordItem {
  id: string;
  harvest_code: string;
  farmer_id: string;
  field_id?: string | null;
  crop_cycle_id?: string | null;
  harvest_date: string;
  harvest_method: string;
  acreage_harvested: number;
  bags_collected: number;
  total_weight_maunds: number;
  total_weight_kg: number;
  yield_per_acre_maunds: number;
  grain_moisture_pct: number;
  grain_quality_grade: string;
  dockage_percentage: number;
  procurement_center: string;
  officer_verified: boolean;
  status: string;
  remarks?: string | null;
  created_at: string;
}

export interface HarvestCreateRequest {
  farmer_id: string;
  field_id?: string | null;
  crop_cycle_id?: string | null;
  harvest_date: string;
  harvest_method?: string;
  acreage_harvested: number;
  bags_collected?: number;
  total_weight_maunds: number;
  grain_moisture_pct?: number;
  grain_quality_grade?: string;
  dockage_percentage?: number;
  procurement_center?: string;
  officer_verified?: boolean;
  status?: string;
  remarks?: string | null;
}

export interface HarvestUpdateRequest {
  bags_collected?: number;
  total_weight_maunds?: number;
  grain_moisture_pct?: number;
  grain_quality_grade?: string;
  dockage_percentage?: number;
  procurement_center?: string;
  officer_verified?: boolean;
  status?: string;
  remarks?: string | null;
}

export interface HarvestListParams {
  farmer_id?: string;
  quality_grade?: string;
  status?: string;
  procurement_center?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const harvestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHarvests: builder.query<HarvestRecordItem[], HarvestListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.farmer_id) queryParams.set('farmer_id', params.farmer_id);
          if (params.quality_grade && params.quality_grade !== 'ALL') queryParams.set('quality_grade', params.quality_grade);
          if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
          if (params.procurement_center) queryParams.set('procurement_center', params.procurement_center);
          if (params.search) queryParams.set('search', params.search);
          if (params.page) queryParams.set('page', params.page.toString());
          if (params.limit) queryParams.set('limit', params.limit.toString());
        }
        const qs = queryParams.toString();
        return qs ? `/harvests?${qs}` : '/harvests';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'HarvestRecord' as const, id })),
              { type: 'HarvestRecord', id: 'LIST' },
            ]
          : [{ type: 'HarvestRecord', id: 'LIST' }],
    }),
    getHarvestById: builder.query<HarvestRecordItem, string>({
      query: (id) => `/harvests/${id}`,
      providesTags: (result, error, id) => [{ type: 'HarvestRecord', id }],
    }),
    createHarvest: builder.mutation<HarvestRecordItem, HarvestCreateRequest>({
      query: (body) => ({
        url: '/harvests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'HarvestRecord', id: 'LIST' }, { type: 'CropCycle', id: 'LIST' }],
    }),
    updateHarvest: builder.mutation<
      HarvestRecordItem,
      { id: string; data: HarvestUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/harvests/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'HarvestRecord', id },
        { type: 'HarvestRecord', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetHarvestsQuery,
  useGetHarvestByIdQuery,
  useCreateHarvestMutation,
  useUpdateHarvestMutation,
} = harvestApi;
