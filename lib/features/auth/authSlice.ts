import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    profileImage?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
}

// Safely access localStorage
const getUserFromStorage = () => {
    if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
}

const getTokenFromStorage = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
}

const initialState: AuthState = {
    user: getUserFromStorage(),
    token: getTokenFromStorage(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("token", token);
            }
        },
        logOut: (state) => {
            state.user = null;
            state.token = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            }
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: any) => state.auth.user;
export const selectCurrentToken = (state: any) => state.auth.token;
