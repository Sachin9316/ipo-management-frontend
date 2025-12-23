"use client";

import { useVerifyOtpMutation } from "@/lib/features/auth/authApiSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { useAppDispatch } from "@/lib/hooks";
import { setCredentials } from "@/lib/features/auth/authSlice";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await verifyOtp({ email, otp }).unwrap() as any;

            if (response?.token && response?.user) {
                dispatch(setCredentials({ user: response.user, token: response.token }));
                toast.success("Email verified successfully!");
                router.push("/dashboard");
            } else {
                toast.success("Email verified successfully! Please login.");
                router.push("/login");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Verification failed");
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Verify Email</CardTitle>
                <CardDescription>Enter the OTP sent to your email</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="m@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="otp">OTP</Label>
                        <Input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            required
                        />
                    </div>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    )
}
