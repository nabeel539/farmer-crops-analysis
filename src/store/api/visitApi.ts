import { baseApi } from './baseApi';

export interface OfficerVisitRecord {
  id: string;
  officer_id: string;
  farmer_id: string;
  field_id?: string | null;
  crop_cycle_id?: string | null;
  visit_date: string;
  visit_type: string;
  observed_stage: string;
  crop_condition: string;
  pest_observed?: string | null;
  verification_status: string;
  action_recommended?: string | null;
  farmer_signature_obtained: boolean;
  gps_lat?: number | null;
  gps_lng?: number | null;
  photo_url?: string | null;
  remarks?: string | null;
  created_at: string;
}

export interface VisitCreateRequest {
  farmer_id: string;
  field_id?: string | null;
  crop_cycle_id?: string | null;
  visit_date: string;
  visit_type?: string;
  observed_stage?: string;
  crop_condition?: string;
  pest_observed?: string | null;
  verification_status?: string;
  action_recommended?: string | null;
  farmer_signature_obtained?: boolean;
  gps_lat?: number | null;
  gps_lng?: number | null;
  photo_url?: string | null;
  remarks?: string | null;
}

export interface VisitUpdateRequest {
  visit_type?: string;
  crop_condition?: string;
  pest_observed?: string | null;
  verification_status?: string;
  action_recommended?: string | null;
  farmer_signature_obtained?: boolean;
  remarks?: string | null;
}

export interface VisitListParams {
  officer_id?: string;
  farmer_id?: string;
  visit_type?: string;
  verification_status?: string;
  page?: number;
  limit?: number;
}

export const visitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOfficerVisits: builder.query<OfficerVisitRecord[], VisitListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.officer_id) queryParams.set('officer_id', params.officer_id);
          if (params.farmer_id) queryParams.set('farmer_id', params.farmer_id);
          if (params.visit_type && params.visit_type !== 'ALL') queryParams.set('visit_type', params.visit_type);
          if (params.verification_status && params.verification_status !== 'ALL') queryParams.set('verification_status', params.verification_status);
          if (params.page) queryParams.set('page', params.page.toString());
          if (params.limit) queryParams.set('limit', params.limit.toString());
        }
        const qs = queryParams.toString();
        return qs ? `/visits?${qs}` : '/visits';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'OfficerVisit' as const, id })),
              { type: 'OfficerVisit', id: 'LIST' },
            ]
          : [{ type: 'OfficerVisit', id: 'LIST' }],
    }),
    getOfficerVisitById: builder.query<OfficerVisitRecord, string>({
      query: (id) => `/visits/${id}`,
      providesTags: (result, error, id) => [{ type: 'OfficerVisit', id }],
    }),
    createOfficerVisit: builder.mutation<OfficerVisitRecord, VisitCreateRequest>({
      query: (body) => ({
        url: '/visits',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'OfficerVisit', id: 'LIST' }],
    }),
    updateOfficerVisit: builder.mutation<
      OfficerVisitRecord,
      { id: string; data: VisitUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/visits/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'OfficerVisit', id },
        { type: 'OfficerVisit', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOfficerVisitsQuery,
  useGetOfficerVisitByIdQuery,
  useCreateOfficerVisitMutation,
  useUpdateOfficerVisitMutation,
} = visitApi;
