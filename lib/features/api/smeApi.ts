import { apiSlice } from './apiSlice'
import { IPOData } from '@/app/dashboard/mainboard/columns'

export const smeApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSMEIPOs: builder.query<IPOData[], void>({
            query: () => 'v1/sme-ipos',
            providesTags: ['SME'],
        }),
        createSMEIPO: builder.mutation<void, any>({
            query: (body) => ({
                url: 'v1/sme-ipos',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SME'],
        }),
        updateSMEIPO: builder.mutation<void, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `v1/sme-ipo/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['SME'],
        }),
        deleteSMEIPO: builder.mutation<void, string>({
            query: (id) => ({
                url: `v1/sme-ipo/${id}`,
                method: 'DELETE',
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
} = smeApi
