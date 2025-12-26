"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff, LayoutDashboard, Loader2 } from "lucide-react"

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

import { useLoginMutation } from "@/lib/features/auth/authApiSlice"
import { setCredentials } from "@/lib/features/auth/authSlice"
import { useAppDispatch } from "@/lib/hooks"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export function LoginForm() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const [login, { isLoading }] = useLoginMutation()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const userData = await login(values).unwrap()
            dispatch(setCredentials({ user: userData, token: userData.token }))
            toast.success("Welcome back!", {
                description: "You have successfully logged in."
            })
            router.push("/dashboard")
        } catch (err: any) {
            if (err?.data?.isVerified === false) {
                toast.error("Email not verified", {
                    description: "Redirecting you to verification page..."
                })
                router.push(`/verify-email?email=${encodeURIComponent(values.email)}`)
            } else {
                toast.error("Login failed", {
                    description: err?.data?.message || "Please check your credentials and try again."
                })
            }
        }
    }

    return (
        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-background/95">
            <CardHeader className="space-y-1 text-center pb-8 pt-8">
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LayoutDashboard className="h-6 w-6 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Enter your credentials to access the admin panel
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
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground/80 flex justify-between items-center">
                                        Password
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs font-normal text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    </FormLabel>
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
                                                <span className="sr-only">
                                                    {showPassword ? "Hide password" : "Show password"}
                                                </span>
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
                                    Logging in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-6 pb-8">
                <div className="text-center text-sm text-muted-foreground">
                    Admin access only. Unauthorized access is restricted.
                </div>
            </CardFooter>
        </Card>
    )
}
