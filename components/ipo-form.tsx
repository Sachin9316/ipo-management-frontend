"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

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
import { ipoCreateSchema } from "@/lib/schemas"

const formSchema = z.object({
    companyName: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string(),
    icon: z.string().optional(),
    ipoType: z.enum(["MAINBOARD", "SME"]).optional(),
    status: z.enum(["UPCOMING", "OPEN", "CLOSED", "LISTED"]),
    // Flat fields for form handling
    subscription_qib: z.coerce.number().optional().default(0),
    subscription_nii: z.coerce.number().optional().default(0),
    subscription_bnii: z.coerce.number().optional().default(0),
    subscription_snii: z.coerce.number().optional().default(0),
    subscription_retail: z.coerce.number().optional().default(0),
    subscription_employee: z.coerce.number().optional().default(0),
    subscription_total: z.coerce.number().optional().default(0),
    // GMP as simple number for input, will be transformed
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
    bse_code_nse_code: z.string(),
    issueSize: z.string().optional(),
    isAllotmentOut: z.coerce.boolean(),
    rhp_pdf: z.string().optional(),
    drhp_pdf: z.string().optional(),
    registrarName: z.string().optional(),
    registrarLink: z.string().optional(),
    // Financials
    financials_revenue: z.coerce.number().optional().default(0),
    financials_profit: z.coerce.number().optional().default(0),
    financials_eps: z.coerce.number().optional().default(0),
    financials_valuation: z.string().optional(),
    // Listing Info
    listing_price: z.coerce.number().optional().default(0),
    listing_day_high: z.coerce.number().optional().default(0),
    listing_day_low: z.coerce.number().optional().default(0),
}).superRefine((data, ctx) => {
    if ((data.status === "CLOSED" || data.status === "LISTED")) {
        if (!data.registrarName || data.registrarName.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Registrar Name is required when status is CLOSED or LISTED",
                path: ["registrarName"],
            });
        }
        if (!data.registrarLink || data.registrarLink.trim() === "") {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Registrar Link is required when status is CLOSED or LISTED",
                path: ["registrarLink"],
            });
        }
    }
});

import { useGetRegistrarsQuery } from "@/lib/features/api/registrarApi"
import imageCompression from "browser-image-compression";
import { Loader2 } from "lucide-react";

// ... existing imports

// Helper to add trading days (skipping Sat/Sun)
function addTradingDays(date: Date, days: number): Date {
    let result = new Date(date);
    let added = 0;
    while (added < days) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 0 && result.getDay() !== 6) {
            added++;
        }
    }
    return result;
}

function SmartDatePicker({ value, onChange, disabled, label }: { value: Date | undefined, onChange: (date: Date | undefined) => void, disabled?: (date: Date) => boolean, label: string }) {
    const [open, setOpen] = useState(false)
    return (
        <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !value && "text-muted-foreground"
                            )}
                        >
                            {value ? (
                                format(value, "dd MMM yyyy")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            onChange(date);
                            setOpen(false);
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

export function IPOForm({ onSubmit, initialValues, defaultType = "MAINBOARD" }: { onSubmit: (data: any) => void, initialValues?: any, defaultType?: string }) {
    const { data: registrarsData } = useGetRegistrarsQuery(undefined)
    const registrars = registrarsData?.registrars || []

    const [loading, setLoading] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.icon || null);
    const [isCompressing, setIsCompressing] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            companyName: "",
            slug: "",
            icon: "",
            // ... existing default values
            ipoType: initialValues?.ipoType || defaultType,
            status: initialValues?.status || "UPCOMING",
            subscription_qib: 0,
            subscription_nii: 0,
            subscription_bnii: 0,
            subscription_snii: 0,
            subscription_retail: 0,
            subscription_employee: 0,
            subscription_total: 0,
            gmp: 0,
            open_date: new Date(),
            close_date: new Date(),
            listing_date: new Date(),
            refund_date: new Date(),
            allotment_date: new Date(),
            lot_size: 0,
            lot_price: 0,
            min_price: 0,
            max_price: 0,
            bse_code_nse_code: "",
            issueSize: "",
            isAllotmentOut: false,
            rhp_pdf: "",
            drhp_pdf: "",
            registrarName: "",
            registrarLink: "",
            financials_revenue: 0,
            financials_profit: 0,
            financials_eps: 0,
            financials_valuation: "",
            listing_price: 0,
            listing_day_high: 0,
            listing_day_low: 0,
        },
    })

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsCompressing(true);
        try {
            const options = {
                maxSizeMB: 0.09, // 90KB
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            setImageFile(compressedFile);

            // Generate preview
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            toast.success(`Image compressed to ${(compressedFile.size / 1024).toFixed(2)} KB`);

        } catch (error) {
            console.error("Image compression error:", error);
            toast.error("Failed to compress image");
        } finally {
            setIsCompressing(false);
        }
    };

    const gmpValue = form.watch("gmp") || 0;
    const lotSizeValue = form.watch("lot_size") || 0;
    const estimatedGain = gmpValue * lotSizeValue;
    const status = form.watch("status");
    const companyName = form.watch("companyName");
    const maxPrice = form.watch("max_price");

    // Watch Subscription Fields for Auto-Calculation
    const subQIB = form.watch("subscription_qib");
    const subNII = form.watch("subscription_nii");
    const subBNII = form.watch("subscription_bnii");
    const subSNII = form.watch("subscription_snii");
    const subRetail = form.watch("subscription_retail");
    const subEmployee = form.watch("subscription_employee");

    // Auto-generate Slug
    useEffect(() => {
        if (companyName && !initialValues) {
            const generatedSlug = companyName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dashes
                .replace(/^-+|-+$/g, '') + "-ipo"; // Trim dashes and append -ipo

            // Only update if slug is empty or looks like an auto-generated one
            const currentSlug = form.getValues("slug");
            if (!currentSlug || currentSlug.includes("-ipo")) {
                form.setValue("slug", generatedSlug);
            }
        }
    }, [companyName, form, initialValues]);

    // Auto-fill Cut-off Price (Lot Price) from Max Price
    useEffect(() => {
        if (maxPrice) {
            const currentLotPrice = form.getValues("lot_price");
            // Update if lot_price is empty or equals previous max_price logic (heuristic)
            if (!currentLotPrice || currentLotPrice === 0) {
                form.setValue("lot_price", maxPrice);
            }
        }
    }, [maxPrice, form]);

    // Auto-calculate Total Subscription (Summation)
    useEffect(() => {
        const total = (Number(subQIB) || 0) + (Number(subNII) || 0) + (Number(subRetail) || 0) + (Number(subEmployee) || 0);
        // Only update if total is different to avoid loops, and strictly if user hasn't overridden it? 
        // For "fast filling", we generally want it to sync always.
        if (total >= 0) {
            form.setValue("subscription_total", total);
        }
    }, [subQIB, subNII, subRetail, subEmployee, form]);

    // Auto-calculate NII from bNII (HNI) + sNII (SNI)
    useEffect(() => {
        const niiTotal = (Number(subBNII) || 0) + (Number(subSNII) || 0);
        if (niiTotal > 0) {
            form.setValue("subscription_nii", niiTotal);
        }
    }, [subBNII, subSNII, form]);

    useEffect(() => {
        if (initialValues) {
            console.log("Processing initialValues for form reset...");

            const values = { ...initialValues };
            const statusValue = values.status || "UPCOMING";

            // Prepare a clean object matching the schema specifically
            const cleanValues: any = {
                companyName: values.companyName || "",
                slug: values.slug || "",
                icon: values.icon || "",
                ipoType: values.ipoType || "MAINBOARD",
                status: statusValue,
                bse_code_nse_code: values.bse_code_nse_code || "",
                lot_size: values.lot_size || 0,
                lot_price: values.lot_price || 0,
                min_price: values.min_price || 0,
                max_price: values.max_price || 0,
                issueSize: values.issueSize || "",
                isAllotmentOut: values.isAllotmentOut || false,
                rhp_pdf: values.rhp_pdf || "",
                drhp_pdf: values.drhp_pdf || "",
                registrarName: values.registrarName || "",
                registrarLink: values.registrarLink || "",
            };

            // Transform Dates safely
            ['open_date', 'close_date', 'listing_date', 'refund_date', 'allotment_date'].forEach(field => {
                if (values[field]) {
                    const date = new Date(values[field]);
                    cleanValues[field] = isNaN(date.getTime()) ? new Date() : date;
                } else {
                    cleanValues[field] = new Date();
                }
            });

            // Transform Nested Subscription to Flat
            const sub = values.subscription;
            cleanValues.subscription_qib = sub?.qib ?? values.subscription_qib ?? 0;
            cleanValues.subscription_nii = sub?.nii ?? values.subscription_nii ?? 0;
            cleanValues.subscription_bnii = sub?.bnii ?? values.subscription_bnii ?? 0;
            cleanValues.subscription_snii = sub?.snii ?? values.subscription_snii ?? 0;
            cleanValues.subscription_retail = sub?.retail ?? values.subscription_retail ?? 0;
            cleanValues.subscription_employee = sub?.employee ?? values.subscription_employee ?? 0;
            cleanValues.subscription_total = sub?.total ?? values.subscription_total ?? 0;

            // Transform GMP
            if (Array.isArray(values.gmp) && values.gmp.length > 0) {
                const latest = values.gmp[values.gmp.length - 1];
                cleanValues.gmp = latest?.price || 0;
            } else if (typeof values.gmp === 'number') {
                cleanValues.gmp = values.gmp;
            } else {
                cleanValues.gmp = 0;
            }

            // Transform Financials
            const fin = values.financials;
            cleanValues.financials_revenue = fin?.revenue ?? values.financials_revenue ?? 0;
            cleanValues.financials_profit = fin?.profit ?? values.financials_profit ?? 0;
            cleanValues.financials_eps = fin?.eps ?? values.financials_eps ?? 0;
            cleanValues.financials_valuation = fin?.valuation ?? values.financials_valuation ?? "";

            // Transform Listing Info
            const listInfo = values.listing_info;
            cleanValues.listing_price = listInfo?.listing_price ?? values.listing_price ?? 0;
            cleanValues.listing_day_high = listInfo?.day_high ?? values.listing_day_high ?? 0;
            cleanValues.listing_day_low = listInfo?.day_low ?? values.listing_day_low ?? 0;

            console.log("Resetting form with clean state:", cleanValues.companyName);
            form.reset(cleanValues);
        }
    }, [initialValues, form]);

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        console.log("IPOForm handleSubmit triggered (FormData)");
        setLoading(true);

        try {
            // Transform Flat -> Nested Payload Object first
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
                    listing_gain: (values.listing_price && values.lot_price) ? values.listing_price - values.lot_price : 0,
                    day_high: values.listing_day_high,
                    day_low: values.listing_day_low,
                }
            };

            // Remove flat fields from payload object
            const keysToRemove = [
                'subscription_qib', 'subscription_nii', 'subscription_bnii', 'subscription_snii', 'subscription_retail', 'subscription_employee', 'subscription_total',
                'financials_revenue', 'financials_profit', 'financials_eps', 'financials_valuation',
                'listing_price', 'listing_day_high', 'listing_day_low',
                'icon' // handled separately
            ];

            keysToRemove.forEach(k => delete (apiPayloadPlain as any)[k]);

            // Construct FormData
            const formData = new FormData();

            // Append all regular fields
            Object.keys(apiPayloadPlain).forEach(key => {
                const value = (apiPayloadPlain as any)[key];
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else if (typeof value === 'object' && value !== null) {
                    // Serialize objects for backend JSON parser
                    formData.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            // Append Image File
            if (imageFile) {
                formData.append('icon', imageFile);
            }

            // Call onSubmit with FormData
            await onSubmit(formData);
            toast.success("IPO saved successfully!");
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to save IPO");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit, (errors) => {
                    toast.error("Please check the form for errors. Required fields are missing.");
                    console.error("Form Validation Errors:", errors);
                })}
                className="space-y-6 p-4"
            >

                {/* 1. Status Section */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">IPO Status & Classification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => {
                                console.log('field', field)
                                return (
                                    <FormItem>
                                        <FormLabel>Current Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full overflow-hidden">
                                                    <SelectValue placeholder="Select status" className="truncate" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                                                <SelectItem value="OPEN">Open</SelectItem>
                                                <SelectItem value="CLOSED">Closed</SelectItem>
                                                <SelectItem value="LISTED">Listed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                        {(status === 'CLOSED' || status === 'LISTED') && (
                            <FormField
                                control={form.control}
                                name="isAllotmentOut"
                                render={({ field }) => (
                                    <FormItem
                                        className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto">
                                        <div className="space-y-0.5">
                                            <FormLabel>Allotment Out</FormLabel>
                                            <FormDescription>Enable when allotment is declared</FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </div>

                {/* 2. Basic Information */}
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
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                                            <img
                                                src={imagePreview}
                                                alt="Icon Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={isCompressing}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                        />
                                        {isCompressing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                    </div>
                                    <p className="text-[0.8rem] text-muted-foreground">
                                        Max size: 90KB (Auto-compressed)
                                    </p>
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
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <FormField
                            control={form.control}
                            name="bse_code_nse_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>BSE/NSE Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="BSE: 1234, NSE: ABCD" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* 3. Issue Details & GMP */}
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
                            <p className="text-xs text-muted-foreground">Based on GMP * Lot Size</p>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(estimatedGain)}
                        </div>
                    </div>
                </div>

                {/* 4. Timeline */}
                <div className="rounded-lg border p-4 bg-card">
                    <h3 className="mb-4 text-lg font-semibold">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            const closeDate = addTradingDays(date, 2); // 3 days total: Open(1) + 2
                                            const allotmentDate = addTradingDays(closeDate, 1); // T+1
                                            const refundDate = addTradingDays(closeDate, 1); // T+1 (approx)
                                            const listingDate = addTradingDays(closeDate, 3); // T+3

                                            form.setValue("close_date", closeDate);
                                            form.setValue("allotment_date", allotmentDate);
                                            form.setValue("refund_date", refundDate);
                                            form.setValue("listing_date", listingDate);
                                        }
                                    }}
                                    disabled={(date) => date < new Date("1900-01-01")}
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
                                    disabled={(date) => date < new Date("1900-01-01")}
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
                                    disabled={(date) => date < new Date("1900-01-01")}
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
                                    disabled={(date) => date < new Date("1900-01-01")}
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
                                    disabled={(date) => date < new Date("1900-01-01")}
                                />
                            )}
                        />
                    </div>
                </div>

                {/* 5. Subscription - Always Visible */}
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


                {/* 6. Allotment Info - Always Visible */}
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
                                            if (selected) {
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
                </div>

                {/* 7. Documents */}
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

                {/* 8. Financials */}
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

                {/* 9. Listing Info */}
                {(status === 'LISTED') && (
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
                    className={'bg-primary rounded-md cursor-pointer w-full'}
                >
                    Save changes
                </Button>
            </form>
        </Form >
    )
}
