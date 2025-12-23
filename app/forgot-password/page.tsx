"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react"

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

import { useForgotPasswordMutation } from "@/lib/features/auth/authApiSlice"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
})

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await forgotPassword(values).unwrap()
            toast.success("OTP Sent", {
                description: "Please check your email for the OTP."
            })
            router.push(`/reset-password?email=${encodeURIComponent(values.email)}`)
        } catch (err: any) {
            toast.error("Failed to send OTP", {
                description: err?.data?.message || "Please check your email and try again."
            })
        }
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

            <div className="relative z-10 w-full max-w-md">
                <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-background/95">
                    <CardHeader className="space-y-1 text-center pb-8 pt-8">
                        <div className="flex justify-center mb-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <KeyRound className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your email address and we'll send you an OTP to reset your password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-foreground/80">Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com"
                                                    className="h-11 bg-background/50"
                                                    {...field}
                                                />
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
                                            Sending OTP...
                                        </>
                                    ) : (
                                        "Send OTP"
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
            </div>
        </div>
    )
}
