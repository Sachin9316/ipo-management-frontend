"use client";

import { useAppSelector } from "@/lib/hooks";
import { selectCurrentToken, selectCurrentUser } from "@/lib/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = useAppSelector(selectCurrentToken);
    const user = useAppSelector(selectCurrentUser);
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push("/login");
        } else if (user && !user.isVerified) {
            router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
        }
    }, [token, user, router]);

    if (!token || (user && !user.isVerified)) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
};

export default ProtectedRoute;
