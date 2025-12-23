"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Eye, EyeOff, LockKeyhole, Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"

import { useResetPasswordMutation } from "@/lib/features/auth/authApiSlice"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
    otp: z.string().length(6, {
        message: "OTP must be exactly 6 digits.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email")

    const [resetPassword, { isLoading }] = useResetPasswordMutation()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: "",
            password: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        if (!email) {
            toast.error("Invalid Request", {
                description: "Email is missing. Please restart the process."
            })
            router.push("/forgot-password")
        }
    }, [email, router])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!email) return;

        try {
            await resetPassword({
                email,
                otp: values.otp,
                password: values.password
            }).unwrap()

            toast.success("Password Reset Successful", {
                description: "You can now login with your new password."
            })
            router.push("/login")
        } catch (err: any) {
            toast.error("Reset Failed", {
                description: err?.data?.message || "Invalid OTP or expired session."
            })
        }
    }

    if (!email) return null;

    return (
        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-background/95">
            <CardHeader className="space-y-1 text-center pb-8 pt-8">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LockKeyhole className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Enter the OTP sent to <strong>{email}</strong> and your new password.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground/80">OTP</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="123456"
                                            className="h-11 bg-background/50 tracking-widest text-center text-lg"
                                            maxLength={6}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground/80">New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                className="h-11 bg-background/50 pr-10"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                className="absolute right-0 top-0 h-full w-10 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground/80">Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="h-11 bg-background/50 pr-10"
                                                placeholder="••••••••"
                                                {...field}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                type="button"
                                                className="absolute right-0 top-0 h-full w-10 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-6 pb-8">
                <div className="text-center text-sm">
                    <Link
                        href="/login"
                        className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

            <div className="relative z-10 w-full max-w-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
