import { apiSlice } from "../api/apiSlice";

export const registrarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRegistrars: builder.query({
            query: () => "registrars/registrars",
            providesTags: ['Registrar'],
        }),
        createRegistrar: builder.mutation({
            query: (data) => ({
                url: "registrars/registrars",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Registrar'],
        }),
        updateRegistrar: builder.mutation({
            query: ({ id, data }) => ({
                url: `registrars/registrars/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ['Registrar'],
        }),
        deleteRegistrar: builder.mutation({
            query: (id) => ({
                url: `registrars/registrars/${id}`,
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
