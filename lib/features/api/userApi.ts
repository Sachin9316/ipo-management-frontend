import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query<any, void>({
            query: () => 'users/customers',
            providesTags: ['User'],
        }),
        getUsers: builder.query<any, void>({
            query: () => 'users',
            providesTags: ['User'],
        }),
        getUserById: builder.query<any, string>({
            query: (id) => `users/${id}`,
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),
        updateUserPan: builder.mutation<any, { id: string; panDocuments: any[] }>({
            query: ({ id, panDocuments }) => ({
                url: `users/${id}/pan`,
                method: 'PUT',
                body: { panDocuments },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),
        updateUser: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `users/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
        }),
        deleteUser: builder.mutation<any, string>({
            query: (id) => ({
                url: `users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),
    }),
});

export const {
    useGetCustomersQuery,
    useGetUsersQuery,
    useGetUserByIdQuery,
    useUpdateUserPanMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi;
