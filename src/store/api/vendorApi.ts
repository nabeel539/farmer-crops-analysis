import { baseApi } from './baseApi';

export interface Vendor {
  id: string;
  vendor_name: string;
  company_name: string;
  contact_person: string;
  mobile_number: string;
  email: string | null;
  address: string | null;
  gstin: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

export interface VendorCreateRequest {
  vendor_name: string;
  company_name: string;
  contact_person: string;
  mobile_number: string;
  email?: string | null;
  address?: string | null;
  gstin?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface VendorUpdateRequest {
  id: string;
  data: Partial<VendorCreateRequest>;
}

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<Vendor[], { status?: string } | void>({
      query: (params) => {
        if (params && params.status) {
          return `/vendors?status=${params.status}`;
        }
        return '/vendors';
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Vendor' as const, id })),
              { type: 'Vendor', id: 'LIST' },
            ]
          : [{ type: 'Vendor', id: 'LIST' }],
    }),
    getVendorById: builder.query<Vendor, string>({
      query: (id) => `/vendors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vendor', id }],
    }),
    createVendor: builder.mutation<Vendor, VendorCreateRequest>({
      query: (newVendor) => ({
        url: '/vendors',
        method: 'POST',
        body: newVendor,
      }),
      invalidatesTags: [{ type: 'Vendor', id: 'LIST' }],
    }),
    updateVendor: builder.mutation<Vendor, VendorUpdateRequest>({
      query: ({ id, data }) => ({
        url: `/vendors/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Vendor', id },
        { type: 'Vendor', id: 'LIST' },
      ],
    }),
    deleteVendor: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vendors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Vendor', id },
        { type: 'Vendor', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
} = vendorApi;
