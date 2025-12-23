import { apiSlice } from './apiSlice'
import { IPOData } from '@/app/dashboard/mainboard/columns'

// Define a response type for listed IPOs if it differs, or use IPOData if it's the same structure
// Based on previous code, it seems to expect similar structure.

export const listedApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getListedIPOs: builder.query<IPOData[], void>({
            query: () => 'v1/listed-ipos',
            providesTags: ['Listed'],
            // Check if transformation is needed based on previous fetch logic:
            // setData(newData.data || newData);
            transformResponse: (response: any) => {
                return response.data || response
            }
        }),
        updateListedIPO: builder.mutation<void, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `v1/listed-ipo/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Listed'],
        }),
        deleteListedIPO: builder.mutation<void, string>({
            query: (id) => ({
                url: `v1/listed-ipo/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Listed'],
        }),
    }),
})

export const {
    useGetListedIPOsQuery,
    useUpdateListedIPOMutation,
    useDeleteListedIPOMutation,
} = listedApi
