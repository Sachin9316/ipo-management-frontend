"use client"

import { RegistrarForm } from "@/components/registrar-form"
import { useCreateRegistrarMutation } from "@/lib/features/api/registrarApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AddRegistrarPage() {
    const [createRegistrar] = useCreateRegistrarMutation()
    const router = useRouter()

    const handleCreate = async (values: any) => {
        try {
            await createRegistrar(values).unwrap()
            toast.success("Registrar created successfully")
            router.push("/dashboard/registrars")
        } catch (error) {
            console.error(error);
            toast.error("Failed to create Registrar")
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">Add New Registrar</h1>
            </div>
            <RegistrarForm onSubmit={handleCreate} />
        </div>
    )
}
