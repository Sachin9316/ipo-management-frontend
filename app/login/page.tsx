import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

            {/* Gradient blobs for premium feel */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

            <div className="relative z-10 w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    )
}
