import { apiSlice } from "./apiSlice";

export const scraperApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        syncScrapedData: builder.mutation<any, number | void>({
            query: (limit = 10) => ({
                url: `/scraper/sync?limit=${limit}`,
                method: 'POST',
            }),
            invalidatesTags: ['Mainboard', 'SME', 'Listed'],
        }),
        syncGMPData: builder.mutation<any, void>({
            query: () => ({
                url: '/scraper/sync-gmp',
                method: 'POST',
            }),
            invalidatesTags: ['Mainboard', 'SME', 'Listed'],
        }),
        previewScrapedData: builder.query<any, number | void>({
            query: (limit = 3) => `/scraper/preview?limit=${limit}`,
        })
    }),
});

export const {
    useSyncScrapedDataMutation,
    useSyncGMPDataMutation,
    useLazyPreviewScrapedDataQuery
} = scraperApi;
