import { baseApi } from './baseApi';

export interface ActivityRecord {
  id: string;
  crop_cycle_id?: string | null;
  farmer_id: string;
  field_id?: string | null;
  activity_type: string;
  scheduled_date: string;
  executed_date?: string | null;
  status: string;
  dosage_or_volume?: string | null;
  cost: number;
  logged_by_role: string;
  logged_by_name: string;
  notes?: string | null;
  photo_url?: string | null;
  recommendation_adherence: boolean;
  created_at: string;
}

export interface ActivityCreateRequest {
  farmer_id: string;
  field_id?: string | null;
  crop_cycle_id?: string | null;
  activity_type: string;
  scheduled_date: string;
  dosage_or_volume?: string | null;
  cost?: number;
  logged_by_role?: string;
  logged_by_name?: string;
  notes?: string | null;
  photo_url?: string | null;
  recommendation_adherence?: boolean;
}

export interface ActivityCompleteRequest {
  executed_date: string;
  notes?: string | null;
  recommendation_adherence?: boolean;
}

export interface ActivityListParams {
  farmer_id?: string;
  crop_cycle_id?: string | null;
  field_id?: string | null;
  activity_type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<ActivityRecord[], ActivityListParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.farmer_id) queryParams.set('farmer_id', params.farmer_id);
          if (params.crop_cycle_id) queryParams.set('crop_cycle_id', params.crop_cycle_id);
          if (params.field_id) queryParams.set('field_id', params.field_id);
          if (params.activity_type && params.activity_type !== 'ALL') queryParams.set('activity_type', params.activity_type);
          if (params.status && params.status !== 'ALL') queryParams.set('status', params.status);
          if (params.search) queryParams.set('search', params.search);
          if (params.page) queryParams.set('page', params.page.toString());
          if (params.limit) queryParams.set('limit', params.limit.toString());
        }
        const qs = queryParams.toString();
        return qs ? `/activities?${qs}` : '/activities';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Activity' as const, id })),
              { type: 'Activity', id: 'LIST' },
            ]
          : [{ type: 'Activity', id: 'LIST' }],
    }),
    getActivityById: builder.query<ActivityRecord, string>({
      query: (id) => `/activities/${id}`,
      providesTags: (result, error, id) => [{ type: 'Activity', id }],
    }),
    createActivity: builder.mutation<ActivityRecord, ActivityCreateRequest>({
      query: (body) => ({
        url: '/activities',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Activity', id: 'LIST' }],
    }),
    completeActivity: builder.mutation<
      ActivityRecord,
      { id: string; data: ActivityCompleteRequest }
    >({
      query: ({ id, data }) => ({
        url: `/activities/${id}/complete`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Activity', id },
        { type: 'Activity', id: 'LIST' },
      ],
    }),
    updateActivity: builder.mutation<
      ActivityRecord,
      { id: string; data: Partial<ActivityCreateRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/activities/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Activity', id },
        { type: 'Activity', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useGetActivityByIdQuery,
  useCreateActivityMutation,
  useCompleteActivityMutation,
  useUpdateActivityMutation,
} = activityApi;
