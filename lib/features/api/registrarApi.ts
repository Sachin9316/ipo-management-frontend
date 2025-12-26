import { apiSlice } from "../api/apiSlice";

export const registrarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRegistrars: builder.query({
            query: () => "v1/registrars",
            providesTags: ['Registrar'],
        }),
        createRegistrar: builder.mutation({
            query: (data) => ({
                url: "v1/registrars",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Registrar'],
        }),
        updateRegistrar: builder.mutation({
            query: ({ id, data }) => ({
                url: `v1/registrars/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ['Registrar'],
        }),
        deleteRegistrar: builder.mutation({
            query: (id) => ({
                url: `v1/registrars/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Registrar'],
        }),
    }),
});

export const {
    useGetRegistrarsQuery,
    useCreateRegistrarMutation,
    useUpdateRegistrarMutation,
    useDeleteRegistrarMutation,
} = registrarApi;
