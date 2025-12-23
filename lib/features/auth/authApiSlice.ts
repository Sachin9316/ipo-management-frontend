import { apiSlice } from "../api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "auth/login",
                method: "POST",
                body: credentials,
            }),
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: "auth/register",
                method: "POST",
                body: userData,
            }),
        }),
        verifyOtp: builder.mutation({
            query: (data) => ({
                url: "auth/verify-otp",
                method: "POST",
                body: data,
            }),
        }),
        adminPing: builder.mutation({
            query: (data) => ({
                url: "auth/admin/ping",
                method: "POST",
                body: data,
            }),
        }),
        getUser: builder.query({
            query: () => "auth/me",
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: "auth/profile",
                method: "PUT",
                body: data,
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useVerifyOtpMutation,
    useAdminPingMutation,
    useGetUserQuery,
    useUpdateUserMutation,
} = authApiSlice;
