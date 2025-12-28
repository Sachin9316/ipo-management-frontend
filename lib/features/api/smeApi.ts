import { apiSlice } from './apiSlice'
import { IPOData } from '@/app/dashboard/mainboard/columns'

export const smeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSMEIPOs: builder.query<IPOData[], { status?: string } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params && params.status) queryParams.append("status", params.status);
                queryParams.append("limit", "1000");
                return `sme/sme-ipos?${queryParams.toString()}`;
            },
            providesTags: ['SME'],
        }),
        createSMEIPO: builder.mutation<void, any>({
            query: (body) => ({
                url: 'sme/sme-ipos',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SME'],
        }),
        updateSMEIPO: builder.mutation<void, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `sme/sme-ipo/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['SME'],
        }),
        deleteSMEIPO: builder.mutation<void, string>({
            query: (id) => ({
                url: `sme/sme-ipo/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['SME'],
        }),
        deleteSMEBulk: builder.mutation<void, string[]>({
            query: (ids) => ({
                url: 'sme/sme-ipos/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: ['SME'],
        }),
    }),
})

export const {
    useGetSMEIPOsQuery,
    useCreateSMEIPOMutation,
    useUpdateSMEIPOMutation,
    useDeleteSMEIPOMutation,
    useDeleteSMEBulkMutation,
} = smeApi
