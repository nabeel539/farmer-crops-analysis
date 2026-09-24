import { baseApi } from './baseApi';

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lng, lat], ...]]
}

export interface Field {
  id: string;
  farmer_id: string;
  field_name: string;
  village: string | null;
  block: string | null;
  district: string | null;
  area: number | null;
  crop: string | null;
  season: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'HARVESTED';
  latitude: number | null;
  longitude: number | null;
  polygon: GeoJSONPolygon | null;
  polygon_color: 'GREEN' | 'YELLOW' | 'RED' | 'BLUE';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FieldCreateRequest {
  farmer_id: string;
  field_name: string;
  village?: string | null;
  block?: string | null;
  district?: string | null;
  area?: number | null;
  crop?: string | null;
  season?: string | null;
  status?: 'ACTIVE' | 'INACTIVE' | 'HARVESTED';
  latitude?: number | null;
  longitude?: number | null;
  polygon?: GeoJSONPolygon | null;
  polygon_color?: 'GREEN' | 'YELLOW' | 'RED' | 'BLUE';
  notes?: string | null;
}

export interface FieldUpdateRequest {
  id: string;
  data: Partial<FieldCreateRequest>;
}

export const fieldApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFields: builder.query<Field[], { farmer_id?: string; status?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.farmer_id) queryParams.set('farmer_id', params.farmer_id);
          if (params.status) queryParams.set('status', params.status);
        }
        const qs = queryParams.toString();
        return qs ? `/fields?${qs}` : '/fields';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Field' as const, id })),
              { type: 'Field', id: 'LIST' },
            ]
          : [{ type: 'Field', id: 'LIST' }],
    }),
    getFieldById: builder.query<Field, string>({
      query: (id) => `/fields/${id}`,
      providesTags: (result, error, id) => [{ type: 'Field', id }],
    }),
    createField: builder.mutation<Field, FieldCreateRequest>({
      query: (fieldData) => ({
        url: '/fields',
        method: 'POST',
        body: fieldData,
      }),
      invalidatesTags: [{ type: 'Field', id: 'LIST' }],
    }),
    updateField: builder.mutation<Field, FieldUpdateRequest>({
      query: ({ id, data }) => ({
        url: `/fields/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Field', id },
        { type: 'Field', id: 'LIST' },
      ],
    }),
    deleteFieldPolygon: builder.mutation<Field, string>({
      query: (fieldId) => ({
        url: `/fields/${fieldId}/polygon`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Field', id },
        { type: 'Field', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFieldsQuery,
  useGetFieldByIdQuery,
  useCreateFieldMutation,
  useUpdateFieldMutation,
  useDeleteFieldPolygonMutation,
} = fieldApi;
