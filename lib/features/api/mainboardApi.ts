import { apiSlice } from './apiSlice'
import { IPOData } from '@/app/dashboard/mainboard/columns'

// Response type matches backend controller structure
type MainboardResponse = {
    success: boolean
    message: string
    data: IPOData[]
    pagination: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
    }
}

export const mainboardApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMainboards: builder.query<MainboardResponse, { status?: string, ipoType?: string, page?: number, limit?: number } | void>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params) {
                    if (params.status) queryParams.append("status", params.status);
                    if (params.ipoType) queryParams.append("ipoType", params.ipoType);
                    if (params.page) queryParams.append("page", params.page.toString());
                    if (params.limit) queryParams.append("limit", params.limit.toString());
                    else queryParams.append("limit", "1000");
                } else {
                    queryParams.append("limit", "1000");
                }
                return `mainboard/mainboards?${queryParams.toString()}`;
            },
            providesTags: ['Mainboard'],
        }),
        createMainboard: builder.mutation<void, any>({
            query: (body) => ({
                url: 'mainboard/mainboards',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Mainboard', 'Listed'],
        }),
        updateMainboard: builder.mutation<void, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `mainboard/mainboard/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Mainboard', 'Listed'],
        }),
        deleteMainboard: builder.mutation<void, string>({
            query: (id) => ({
                url: `mainboard/mainboard/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Mainboard', 'Listed'],
        }),
        deleteMainboardBulk: builder.mutation<void, string[]>({
            query: (ids) => ({
                url: 'mainboard/mainboards/bulk-delete',
                method: 'POST',
                body: { ids },
            }),
            invalidatesTags: ['Mainboard', 'Listed'],
        }),
        manualUpdateMainboard: builder.mutation<void, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `mainboard/edit/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Mainboard', 'Listed'],
        }),
        getMainboardForEdit: builder.query<{ success: boolean; data: IPOData }, string>({
            query: (id) => `mainboard/edit/${id}`,
            // We do NOT provide tags here to avoid caching this specific edit fetch generally?
            // Actually, we want it fresh.
            keepUnusedDataFor: 0, // Ensure we always fetch fresh when opening edit form
        }),
    }),
})

export const {
    useGetMainboardsQuery,
    useCreateMainboardMutation,
    useUpdateMainboardMutation,
    useDeleteMainboardMutation,
    useDeleteMainboardBulkMutation,
    useManualUpdateMainboardMutation,
    useGetMainboardForEditQuery,
    useLazyGetMainboardForEditQuery
} = mainboardApi
