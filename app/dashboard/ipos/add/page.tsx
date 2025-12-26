"use client"

import { IPOForm } from "@/components/ipo-form"
import { useCreateMainboardMutation } from "@/lib/features/api/mainboardApi"
import { useCreateSMEIPOMutation } from "@/lib/features/api/smeApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AddIPOPage() {
    const [createMainboard] = useCreateMainboardMutation()
    const [createSME] = useCreateSMEIPOMutation()
    const router = useRouter()

    const handleCreate = async (values: any) => {
        try {
            if (values.ipoType === "SME") {
                await createSME(values).unwrap()
                toast.success("SME IPO created successfully")
                router.push("/dashboard/sme/upcoming")
            } else {
                await createMainboard(values).unwrap()
                toast.success("Mainboard IPO created successfully")
                router.push("/dashboard/ipos/upcoming")
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to create IPO")
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Add New IPO</h1>
            <IPOForm onSubmit={handleCreate} />
        </div>
    )
}
