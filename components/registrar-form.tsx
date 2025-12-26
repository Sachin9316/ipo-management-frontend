"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import imageCompression from 'browser-image-compression';
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Registrar name must be at least 2 characters.",
    }),
    logo: z.string().optional(),
    websiteLink: z.string().url({
        message: "Please enter a valid URL.",
    }),
    description: z.string().optional(),
})

export function RegistrarForm({ onSubmit, initialValues }: { onSubmit: (data: any) => void, initialValues?: any }) {
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.logo || null);
    const [isCompressing, setIsCompressing] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            logo: "",
            websiteLink: "",
            description: "",
        },
    })

    useEffect(() => {
        if (initialValues) {
            form.reset({
                name: initialValues.name || "",
                logo: initialValues.logo || "",
                websiteLink: initialValues.websiteLink || "",
                description: initialValues.description || "",
            })
            setImagePreview(initialValues.logo || null);
        }
    }, [initialValues, form])

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsCompressing(true);
        try {
            const options = {
                maxSizeMB: 0.1, // Max 100KB
                maxWidthOrHeight: 500,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            setImageFile(compressedFile);

            // Generate preview
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                form.setValue("logo", reader.result as string); // Keep base64 for preview/fallback if needed
            };
            toast.success(`Image compressed to ${(compressedFile.size / 1024).toFixed(2)} KB`);

        } catch (error) {
            console.error("Image compression error:", error);
            toast.error("Failed to compress image");
        } finally {
            setIsCompressing(false);
        }
    };

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        console.log("Submitting Registrar:", values);
        await onSubmit(values)
        setLoading(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Registrar Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Link Intime India Pvt Ltd" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="websiteLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website Link</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://linkintime.co.in" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Optional description..." {...field} className="min-h-[100px]" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column - Logo Upload */}
                    <div className="space-y-6">
                        <FormItem>
                            <FormLabel>Registrar Logo</FormLabel>
                            <FormControl>
                                <div className="flex flex-col gap-3">
                                    {imagePreview && (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                                            <img
                                                src={imagePreview}
                                                alt="Logo preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={isCompressing}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                        />
                                        {isCompressing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                    </div>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Max size: 100KB (Auto-compressed)
                                    </p>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialValues ? "Update Registrar" : "Create Registrar"}
                </Button>
            </form>
        </Form>
    )
}
