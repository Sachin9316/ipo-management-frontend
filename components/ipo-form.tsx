"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import imageCompression from "browser-image-compression"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { ImageModal } from "@/components/ui/image-modal"
import { useGetRegistrarsQuery } from "@/lib/features/api/registrarApi"

// Form Schema
const formSchema = z.object({
    companyName: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string(),
    icon: z.string().optional(),
    ipoType: z.enum(["MAINBOARD", "SME"]).optional(),
    status: z.enum(["UPCOMING", "OPEN", "CLOSED", "LISTED", "CANCELLED"]),
    subscription_qib: z.coerce.number().optional().default(0),
    subscription_nii: z.coerce.number().optional().default(0),
    subscription_bnii: z.coerce.number().optional().default(0),
    subscription_snii: z.coerce.number().optional().default(0),
    subscription_retail: z.coerce.number().optional().default(0),
    subscription_employee: z.coerce.number().optional().default(0),
    subscription_total: z.coerce.number().optional().default(0),
    gmp: z.coerce.number().optional().default(0),
    open_date: z.coerce.date(),
    close_date: z.coerce.date(),
    listing_date: z.coerce.date(),
    refund_date: z.coerce.date(),
    allotment_date: z.coerce.date(),
    lot_size: z.coerce.number(),
    lot_price: z.coerce.number(),
    min_price: z.coerce.number().optional().default(0),
    max_price: z.coerce.number().optional().default(0),
    issueSize: z.string().optional(),
    isAllotmentOut: z.coerce.boolean(),
    rhp_pdf: z.string().optional(),
    drhp_pdf: z.string().optional(),
    registrarName: z.string().optional(),
    registrarLink: z.string().optional(),
    financials_revenue: z.coerce.number().optional().default(0),
    financials_profit: z.coerce.number().optional().default(0),
    financials_eps: z.coerce.number().optional().default(0),
    financials_valuation: z.string().optional(),
    listing_price: z.coerce.number().optional().default(0),
    listing_day_high: z.coerce.number().optional().default(0),
    listing_day_low: z.coerce.number().optional().default(0),
    kfintech_client_id: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.status === "CLOSED" || data.status === "LISTED") {
        if (!data.registrarName?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Registrar Name is required when status is CLOSED or LISTED",
                path: ["registrarName"],
            })
        }
        if (!data.registrarLink?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Registrar Link is required when status is CLOSED or LISTED",
                path: ["registrarLink"],
            })
        }
    }
})

// Helper: Add trading days (skip weekends)
const addTradingDays = (date: Date, days: number): Date => {
    const result = new Date(date)
    let added = 0
    while (added < days) {
        result.setDate(result.getDate() + 1)
        if (result.getDay() !== 0 && result.getDay() !== 6) added++
    }
    return result
}

// Helper: Transform initial values to form format
const transformInitialValues = (values: any) => {
    const statusValue = values.status || "UPCOMING"

    const cleanValues: any = {
        companyName: values.companyName || "",
        slug: values.slug || "",
        icon: values.icon || "",
        ipoType: values.ipoType || "MAINBOARD",
        status: statusValue,
        lot_size: values.lot_size || 0,
        lot_price: values.lot_price || 0,
        min_price: values.min_price ?? values.minPrice ?? 0,
        max_price: values.max_price ?? values.maxPrice ?? 0,
        issueSize: values.issueSize || "",
        isAllotmentOut: values.isAllotmentOut || false,
        rhp_pdf: values.rhp_pdf || "",
        drhp_pdf: values.drhp_pdf || "",
        registrarName: values.registrarName || "",
        registrarLink: values.registrarLink || "",
        kfintech_client_id: values.kfintech_client_id || "",
    };

    // Transform dates
    ['open_date', 'close_date', 'listing_date', 'refund_date', 'allotment_date'].forEach(field => {
        const date = values[field] ? new Date(values[field]) : new Date()
        cleanValues[field] = isNaN(date.getTime()) ? new Date() : date
    })

    // Transform subscription data
    const sub = values.subscription || {}
    cleanValues.subscription_qib = sub.qib ?? values.subscription_qib ?? 0
    cleanValues.subscription_nii = sub.nii ?? values.subscription_nii ?? 0
    cleanValues.subscription_bnii = sub.bnii ?? values.subscription_bnii ?? 0
    cleanValues.subscription_snii = sub.snii ?? values.subscription_snii ?? 0
    cleanValues.subscription_retail = sub.retail ?? values.subscription_retail ?? 0
    cleanValues.subscription_employee = sub.employee ?? values.subscription_employee ?? 0
    cleanValues.subscription_total = sub.total ?? values.subscription_total ?? 0

    // Transform GMP
    if (Array.isArray(values.gmp) && values.gmp.length > 0) {
        cleanValues.gmp = values.gmp[values.gmp.length - 1]?.price || 0
    } else {
        cleanValues.gmp = typeof values.gmp === 'number' ? values.gmp : 0
    }

    // Transform financials
    const fin = values.financials || {}
    cleanValues.financials_revenue = fin.revenue ?? values.financials_revenue ?? 0
    cleanValues.financials_profit = fin.profit ?? values.financials_profit ?? 0
    cleanValues.financials_eps = fin.eps ?? values.financials_eps ?? 0
    cleanValues.financials_valuation = fin.valuation ?? values.financials_valuation ?? ""

    // Transform listing info
    const listInfo = values.listing_info || {}
    cleanValues.listing_price = listInfo.listing_price ?? values.listing_price ?? 0
    cleanValues.listing_day_high = listInfo.day_high ?? values.listing_day_high ?? 0
    cleanValues.listing_day_low = listInfo.day_low ?? values.listing_day_low ?? 0

    return cleanValues
}

// Smart Date Picker Component
const SmartDatePicker = ({ value, onChange, disabled, label }: {
    value: Date | undefined
    onChange: (date: Date | undefined) => void
    disabled?: (date: Date) => boolean
    label: string
}) => {
    const [open, setOpen] = useState(false)

    return (
        <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !value && "text-muted-foreground"
                            )}
                        >
                            {value ? format(value, "dd MMM yyyy") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            onChange(date)
                            setOpen(false)
                        }}
                        disabled={disabled}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            <FormMessage />
        </FormItem>
    )
}

export function IPOForm({
    onSubmit,
    initialValues,
    defaultType = "MAINBOARD"
}: {
    onSubmit: (data: any) => void
    initialValues?: any
    defaultType?: string
}) {
    const { data: registrarsData } = useGetRegistrarsQuery(undefined)
    const registrars = registrarsData?.registrars || []
    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.icon || null)
    const [isCompressing, setIsCompressing] = useState(false)
    const [previewModalOpen, setPreviewModalOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            companyName: initialValues?.companyName || "",
            slug: initialValues?.slug || "",
            icon: initialValues?.icon || "",
            ipoType: initialValues?.ipoType || defaultType,
            status: initialValues?.status || "UPCOMING",
            subscription_qib: initialValues?.subscription_qib || 0,
            subscription_nii: initialValues?.subscription_nii || 0,
            subscription_bnii: initialValues?.subscription_bnii || 0,
            subscription_snii: initialValues?.subscription_snii || 0,
            subscription_retail: initialValues?.subscription_retail || 0,
            subscription_employee: initialValues?.subscription_employee || 0,
            subscription_total: initialValues?.subscription_total || 0,
            gmp: initialValues?.gmp || 0,
            open_date: initialValues?.open_date || new Date(),
            close_date: initialValues?.close_date || new Date(),
            listing_date: initialValues?.listing_date || new Date(),
            refund_date: initialValues?.refund_date || new Date(),
            allotment_date: initialValues?.allotment_date || new Date(),
            lot_size: initialValues?.lot_size || 0,
            lot_price: initialValues?.lot_price || 0,
            min_price: initialValues?.min_price || 0,
            max_price: initialValues?.max_price || 0,
            issueSize: initialValues?.issueSize || "",
            isAllotmentOut: initialValues?.isAllotmentOut || false,
            rhp_pdf: "",
            drhp_pdf: "",
            registrarName: initialValues?.registrarName || "",
            registrarLink: initialValues?.registrarLink || "",
            financials_revenue: initialValues?.financials_revenue || 0,
            financials_profit: initialValues?.financials_profit || 0,
            financials_eps: initialValues?.financials_eps || 0,
            financials_valuation: initialValues?.financials_valuation || "",
            listing_price: initialValues?.listing_price || 0,
            listing_day_high: initialValues?.listing_day_high || 0,
            listing_day_low: initialValues?.listing_day_low || 0,
            kfintech_client_id: initialValues?.kfintech_client_id || "",
        },
    })

    // Watch form values
    const companyName = form.watch("companyName")
    const maxPrice = form.watch("max_price")
    const status = form.watch("status")
    const gmpValue = form.watch("gmp") || 0
    const lotSizeValue = form.watch("lot_size") || 0
    const subQIB = form.watch("subscription_qib")
    const subNII = form.watch("subscription_nii")
    const subBNII = form.watch("subscription_bnii")
    const subSNII = form.watch("subscription_snii")
    const subRetail = form.watch("subscription_retail")
    const subEmployee = form.watch("subscription_employee")
    const currentRegistrarName = form.watch("registrarName")

    // Memoize estimated gain calculation
    const estimatedGain = useMemo(() =>
        gmpValue * lotSizeValue,
        [gmpValue, lotSizeValue]
    )

    // Pad image to square
    const padImageToSquare = useCallback(async (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            const url = URL.createObjectURL(file)

            img.onload = () => {
                const size = Math.max(img.width, img.height)
                const canvas = document.createElement('canvas')
                canvas.width = size
                canvas.height = size

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    URL.revokeObjectURL(url)
                    reject(new Error('Failed to get canvas context'))
                    return
                }

                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, size, size)
                const x = (size - img.width) / 2
                const y = (size - img.height) / 2
                ctx.drawImage(img, x, y)

                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url)
                    if (blob) {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }))
                    } else {
                        reject(new Error('Canvas to blob failed'))
                    }
                }, 'image/jpeg', 1.0)
            }

            img.onerror = () => {
                URL.revokeObjectURL(url)
                reject(new Error('Failed to load image'))
            }

            img.src = url
        })
    }, [])

    // Handle image change
    const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsCompressing(true)
        try {
            const squaredFile = await padImageToSquare(file)
            const options = {
                maxSizeMB: 0.09,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            }

            const compressedFile = await imageCompression(squaredFile, options)
            setImageFile(compressedFile)

            const reader = new FileReader()
            reader.readAsDataURL(compressedFile)
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            toast.success(`Image compressed to ${(compressedFile.size / 1024).toFixed(2)} KB`)
        } catch (error) {
            console.error("Image compression error:", error)
            toast.error("Failed to compress image")
        } finally {
            setIsCompressing(false)
        }
    }, [padImageToSquare])

    // Auto-generate slug
    useEffect(() => {
        if (companyName && !initialValues) {
            const generatedSlug = companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') + "-ipo"

            const currentSlug = form.getValues("slug")
            if (!currentSlug || currentSlug.endsWith("-ipo")) {
                form.setValue("slug", generatedSlug)
            }
        }
    }, [companyName, form, initialValues])

    // Auto-fill lot price from max price
    useEffect(() => {
        if (maxPrice && !initialValues) {
            const currentLotPrice = form.getValues("lot_price")
            if (!currentLotPrice || currentLotPrice === 0) {
                form.setValue("lot_price", maxPrice)
            }
        }
    }, [maxPrice, form, initialValues])

    // Auto-calculate total subscription
    useEffect(() => {
        if (!form.formState.isDirty) return

        const total = (Number(subQIB) || 0) + (Number(subNII) || 0) +
            (Number(subRetail) || 0) + (Number(subEmployee) || 0)

        if (total >= 0) {
            form.setValue("subscription_total", Number(total.toFixed(2)), { shouldDirty: true })
        }
    }, [subQIB, subNII, subRetail, subEmployee, form])

    // Auto-calculate NII from bNII + sNII
    useEffect(() => {
        if (!form.formState.isDirty) return

        const niiTotal = (Number(subBNII) || 0) + (Number(subSNII) || 0)
        if (niiTotal > 0) {
            form.setValue("subscription_nii", Number(niiTotal.toFixed(2)), { shouldDirty: true })
        }
    }, [subBNII, subSNII, form])

    // Initialize form with initial values - FIX FOR REGISTRAR POPULATION
    useEffect(() => {
        if (initialValues) {
            const currentSlug = form.getValues("slug")
            const newSlug = initialValues.slug

            // Skip reset if same record and form is dirty
            if (currentSlug === newSlug && form.formState.isDirty) {
                return
            }

            const cleanValues = transformInitialValues(initialValues)

            // Set image preview if icon exists
            if (cleanValues.icon) {
                setImagePreview(cleanValues.icon)
            }

            form.reset(cleanValues)
        }
    }, [initialValues, form])

    // Handle form submission
    const handleSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        setLoading(true)

        try {
            const apiPayloadPlain = {
                ...values,
                subscription: {
                    qib: values.subscription_qib,
                    nii: values.subscription_nii,
                    bnii: values.subscription_bnii,
                    snii: values.subscription_snii,
                    retail: values.subscription_retail,
                    employee: values.subscription_employee,
                    total: values.subscription_total,
                },
                gmp: [{
                    price: values.gmp,
                    kostak: "0",
                    date: new Date()
                }],
                financials: {
                    revenue: values.financials_revenue,
                    profit: values.financials_profit,
                    eps: values.financials_eps,
                    valuation: values.financials_valuation,
                },
                listing_info: {
                    listing_price: values.listing_price,
                    listing_gain: (values.listing_price && values.lot_price)
                        ? values.listing_price - values.lot_price
                        : 0,
                    day_high: values.listing_day_high,
                    day_low: values.listing_day_low,
                }
            }

            // Force allotment status logic
            if (apiPayloadPlain.status !== "CLOSED" && apiPayloadPlain.status !== "LISTED") {
                apiPayloadPlain.isAllotmentOut = false
            }

            // Remove flat fields
            const keysToRemove = [
                'subscription_qib', 'subscription_nii', 'subscription_bnii', 'subscription_snii',
                'subscription_retail', 'subscription_employee', 'subscription_total',
                'financials_revenue', 'financials_profit', 'financials_eps', 'financials_valuation',
                'listing_price', 'listing_day_high', 'listing_day_low', 'icon'
            ]

            keysToRemove.forEach(k => delete (apiPayloadPlain as any)[k])

            // Construct FormData
            const formData = new FormData()

            Object.keys(apiPayloadPlain).forEach(key => {
                const value = (apiPayloadPlain as any)[key]
                if (value instanceof Date) {
                    formData.append(key, value.toISOString())
                } else if (typeof value === 'object' && value !== null) {
                    formData.append(key, JSON.stringify(value))
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value))
                }
            })

            if (imageFile) {
                formData.append('icon', imageFile)
            }

            await onSubmit(formData)
        } catch (error) {
            console.error("Submission error:", error)
            toast.error("Failed to save IPO")
        } finally {
            setLoading(false)
        }
    }, [imageFile, onSubmit])

    return (
        <Form {...form}>
            <ImageModal
                isOpen={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                imageUrl={imagePreview}
                title="Company Logo Preview"
            />
            <form
                onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                    toast.error("Please check the form for errors")
                    console.error("Form Validation Errors:", errors)
                })}
                className="space-y-6 p-4"
            >
                {/* Status Section */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">IPO Status & Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="CLOSED">Closed</SelectItem>
                                            <SelectItem value="LISTED">Listed</SelectItem>
                                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {(status === 'CLOSED' || status === 'LISTED') && (
                            <FormField
                                control={form.control}
                                name="isAllotmentOut"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto">
                                        <div className="space-y-0.5">
                                            <FormLabel>Allotment Out</FormLabel>
                                            <FormDescription>Enable when allotment is declared</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* Basic Information */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="TechCorp" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl>
                                        <Input placeholder="techcorp-ipo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Company Icon</FormLabel>
                            <FormControl>
                                <div className="flex flex-col gap-3">
                                    {imagePreview && (
                                        <div
                                            className="relative w-20 h-20 rounded-lg overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setPreviewModalOpen(true)}
                                            title="Click to preview"
                                        >
                                            <img src={imagePreview} alt="Icon Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={isCompressing}
                                        />
                                        {isCompressing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Max size: 90KB (Auto-compressed)</p>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="ipoType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>IPO Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select IPO Type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="MAINBOARD">MAINBOARD</SelectItem>
                                            <SelectItem value="SME">SME</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Issue Details & GMP */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Issue Details & GMP</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="min_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Min Price (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="max_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Price (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lot_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cut-off Price (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lot_size"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lot Size (Shares)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="gmp"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current GMP (₹)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="issueSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Issue Size (Cr)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 500 Cr" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="mt-4 rounded-lg border p-4 bg-muted/50 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h4 className="font-medium text-sm">Estimated Listing Gain</h4>
                            <p className="text-xs text-muted-foreground">Based on current GMP and Lot Size</p>
                        </div>
                        <div className={`text-2xl font-bold ${estimatedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{estimatedGain.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                {/* Important Dates */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Important Dates</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="open_date"
                            render={({ field }) => (
                                <SmartDatePicker
                                    label="Open Date"
                                    value={field.value}
                                    onChange={(date) => {
                                        field.onChange(date);
                                        if (date) {
                                            const closeDate = addTradingDays(date, 2);
                                            const allotmentDate = addTradingDays(closeDate, 1);
                                            const refundDate = allotmentDate;
                                            const listingDate = addTradingDays(closeDate, 3);
                                            form.setValue("close_date", closeDate);
                                            form.setValue("allotment_date", allotmentDate);
                                            form.setValue("refund_date", refundDate);
                                            form.setValue("listing_date", listingDate);
                                        }
                                    }}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="close_date"
                            render={({ field }) => (
                                <SmartDatePicker
                                    label="Close Date"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="allotment_date"
                            render={({ field }) => (
                                <SmartDatePicker
                                    label="Allotment Date"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="refund_date"
                            render={({ field }) => (
                                <SmartDatePicker
                                    label="Refund Date"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="listing_date"
                            render={({ field }) => (
                                <SmartDatePicker
                                    label="Listing Date"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* Subscription Details */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Subscription Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="subscription_qib"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>QIB (x)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subscription_nii"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NII (x)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subscription_bnii"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>HNI (bNII)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subscription_snii"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SNI (sNII)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subscription_retail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Retail (x)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subscription_employee"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee (x)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subscription_total"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Subscription (x)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Allotment Information */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Allotment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="registrarName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Registrar Name</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            const selected = registrars.find((r: any) => r.name === value);
                                            field.onChange(value);
                                            if (selected && selected.websiteLink) {
                                                form.setValue("registrarLink", selected.websiteLink);
                                            }
                                        }}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full overflow-hidden">
                                                <span className="truncate w-full text-left">
                                                    <SelectValue placeholder="Select Registrar" />
                                                </span>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* Safety: Explicitly render current val if missing from list */}
                                            {field.value && !registrars.some((r: any) => r.name === field.value) && (
                                                <SelectItem value={field.value}>
                                                    {field.value}
                                                </SelectItem>
                                            )}
                                            {registrars.map((registrar: any) => (
                                                <SelectItem key={registrar._id} value={registrar.name}>
                                                    {registrar.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="registrarLink"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Registrar Link</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="mt-4">
                        <FormField
                            control={form.control}
                            name="kfintech_client_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>KFintech Client ID (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 123456" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Required only if the IPO is not found automatically by name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Documents */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="rhp_pdf"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>RHP PDF URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="drhp_pdf"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>DRHP PDF URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Financials */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Financials</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField
                            control={form.control}
                            name="financials_revenue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Revenue (Cr)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="financials_profit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profit (Cr)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="financials_eps"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>EPS</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="financials_valuation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Valuation</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Undervalued / Fair" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Listing Information */}
                {status === 'LISTED' && (
                    <div className="rounded-lg border p-4 bg-card">
                        <h3 className="mb-4 text-lg font-semibold">Listing Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="listing_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Listing Price (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="listing_day_high"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day High (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="listing_day_low"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day Low (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary rounded-md cursor-pointer w-full"
                >
                    Save changes
                </Button>
            </form>
        </Form>
    )
}