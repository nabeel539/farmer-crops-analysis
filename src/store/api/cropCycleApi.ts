import { baseApi } from './baseApi';

export interface CropCycleRecord {
  id: string;
  cycle_code: string;
  farmer_id: string;
  field_id: string;
  crop_type: string;
  variety: string;
  season: string;
  sowing_date: string;
  sowing_method: string;
  allocated_acres: number;
  stage: string;
  health_status: string;
  expected_harvest_date: string;
  actual_harvest_date?: string | null;
  expected_yield_maunds_per_acre: number;
  target_total_yield_kg: number;
  actual_total_yield_kg?: number | null;
  ndvi_score: number;
  soil_moisture_pct: number;
  temperature_celsius: number;
  risk_alert_level: string;
  last_inspection_date?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface CropCycleCreateRequest {
  farmer_id: string;
  field_id: string;
  crop_type?: string;
  variety?: string;
  season?: string;
  sowing_date: string;
  sowing_method?: string;
  allocated_acres: number;
  expected_harvest_date: string;
  expected_yield_maunds_per_acre?: number;
  remarks?: string | null;
}

export interface CropCycleStageUpdateRequest {
  stage: string;
  health_status: string;
  ndvi_score?: number;
  remarks?: string | null;
}

export interface CropCycleListParams {
  farmer_id?: string;
  field_id?: string;
  stage?: string;
  health_status?: string;
  season?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const cropCycleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCropCycles: builder.query<CropCycleRecord[], CropCycleListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.farmer_id) queryParams.set('farmer_id', params.farmer_id);
          if (params.field_id) queryParams.set('field_id', params.field_id);
          if (params.stage && params.stage !== 'ALL') queryParams.set('stage', params.stage);
          if (params.health_status && params.health_status !== 'ALL') queryParams.set('health_status', params.health_status);
          if (params.season && params.season !== 'ALL') queryParams.set('season', params.season);
          if (params.search) queryParams.set('search', params.search);
          if (params.page) queryParams.set('page', params.page.toString());
          if (params.limit) queryParams.set('limit', params.limit.toString());
        }
        const qs = queryParams.toString();
        return qs ? `/crop-cycles?${qs}` : '/crop-cycles';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'CropCycle' as const, id })),
              { type: 'CropCycle', id: 'LIST' },
            ]
          : [{ type: 'CropCycle', id: 'LIST' }],
    }),
    getCropCycleById: builder.query<CropCycleRecord, string>({
      query: (id) => `/crop-cycles/${id}`,
      providesTags: (result, error, id) => [{ type: 'CropCycle', id }],
    }),
    createCropCycle: builder.mutation<CropCycleRecord, CropCycleCreateRequest>({
      query: (body) => ({
        url: '/crop-cycles',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'CropCycle', id: 'LIST' }],
    }),
    advanceCropStage: builder.mutation<
      CropCycleRecord,
      { id: string; data: CropCycleStageUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/crop-cycles/${id}/stage`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CropCycle', id },
        { type: 'CropCycle', id: 'LIST' },
      ],
    }),
    updateCropCycle: builder.mutation<
      CropCycleRecord,
      { id: string; data: Partial<CropCycleCreateRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/crop-cycles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CropCycle', id },
        { type: 'CropCycle', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCropCyclesQuery,
  useGetCropCycleByIdQuery,
  useCreateCropCycleMutation,
  useAdvanceCropStageMutation,
  useUpdateCropCycleMutation,
} = cropCycleApi;
