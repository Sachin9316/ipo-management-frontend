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

import imageCompression from "browser-image-compression";
import { Loader2 } from "lucide-react";

// ... existing imports

export function IPOForm({ onSubmit, initialValues }: { onSubmit: (data: any) => void, initialValues?: any }) {
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
            ipoType: "MAINBOARD",
            status: initialValues?.status || "UPCOMING",
            subscription_qib: 0,
            subscription_nii: 0,
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

    useEffect(() => {
        if (initialValues) {
            console.log("Processing initialValues for form reset...");

            const values = { ...initialValues };

            // 1. Explicitly extract and sanitize status
            const statusValue = values.status || "UPCOMING";
            console.log("Sanitized Status:", statusValue);

            // 2. Prepare a clean object matching the schema specifically
            // This prevents extra fields from backend polluting the form state
            const cleanValues: any = {
                status: statusValue,
                companyName: values.companyName || "",
                slug: values.slug || "",
                icon: values.icon || "",
                ipoType: values.ipoType || "MAINBOARD",
                bse_code_nse_code: values.bse_code_nse_code || "",
                lot_size: values.lot_size || 0,
                lot_price: values.lot_price || 0,
                min_price: values.min_price || 0,
                max_price: values.max_price || 0,
                isAllotmentOut: values.isAllotmentOut || false,
                rhp_pdf: values.rhp_pdf || "",
                drhp_pdf: values.drhp_pdf || "",
                registrarName: values.registrarName || "",
                registrarLink: values.registrarLink || "",
            };

            // 3. Transform Dates
            ['open_date', 'close_date', 'listing_date', 'refund_date', 'allotment_date'].forEach(field => {
                // Use the value from original object, convert, and assign to cleanValues
                if (values[field]) {
                    cleanValues[field] = new Date(values[field]);
                } else {
                    cleanValues[field] = new Date();
                }
            });

            // 4. Transform Nested Subscription to Flat
            if (values.subscription && typeof values.subscription === 'object') {
                cleanValues.subscription_qib = values.subscription.qib || 0;
                cleanValues.subscription_nii = values.subscription.nii || 0;
                cleanValues.subscription_retail = values.subscription.retail || 0;
                cleanValues.subscription_employee = values.subscription.employee || 0;
                cleanValues.subscription_total = values.subscription.total || 0;
            } else {
                cleanValues.subscription_qib = values.subscription_qib || 0;
                cleanValues.subscription_nii = values.subscription_nii || 0;
                cleanValues.subscription_retail = values.subscription_retail || 0;
                cleanValues.subscription_employee = values.subscription_employee || 0;
                cleanValues.subscription_total = values.subscription.total || 0;
            }

            // 5. Transform GMP
            if (Array.isArray(values.gmp) && values.gmp.length > 0) {
                const latest = values.gmp[values.gmp.length - 1];
                cleanValues.gmp = latest?.price || 0;
            } else if (typeof values.gmp === 'number') {
                cleanValues.gmp = values.gmp;
            } else {
                cleanValues.gmp = 0;
            }

            // 6. Transform Financials
            if (values.financials) {
                cleanValues.financials_revenue = values.financials.revenue || 0;
                cleanValues.financials_profit = values.financials.profit || 0;
                cleanValues.financials_eps = values.financials.eps || 0;
                cleanValues.financials_valuation = values.financials.valuation || "";
            } else {
                cleanValues.financials_revenue = values.financials_revenue || 0;
                cleanValues.financials_profit = values.financials_profit || 0;
                cleanValues.financials_eps = values.financials_eps || 0;
                cleanValues.financials_valuation = values.financials_valuation || "";
            }

            // 7. Transform Listing Info
            if (values.listing_info) {
                cleanValues.listing_price = values.listing_info.listing_price || 0;
                cleanValues.listing_day_high = values.listing_info.day_high || 0;
                cleanValues.listing_day_low = values.listing_info.day_low || 0;
            } else {
                cleanValues.listing_price = values.listing_price || 0;
                cleanValues.listing_day_high = values.listing_day_high || 0;
                cleanValues.listing_day_low = values.listing_day_low || 0;
            }

            console.log("Resetting form with CLEAN strings:", JSON.stringify(cleanValues, null, 2));
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
                'subscription_qib', 'subscription_nii', 'subscription_retail', 'subscription_employee', 'subscription_total',
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
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
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
                                <FormItem className="flex flex-col">
                                    <FormLabel>Open Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd MMM yyyy")
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
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="close_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Close Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd MMM yyyy")
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
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="allotment_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Allotment Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd MMM yyyy")
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
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="refund_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Refund Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd MMM yyyy")
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
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="listing_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Listing Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd MMM yyyy")
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
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* 5. Subscription - Conditional */}
                {status !== 'UPCOMING' && (
                    <div className="rounded-lg border p-4 bg-card">
                        <h3 className="mb-4 text-lg font-semibold">Subscription Details</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        </div>
                    </div>
                )}

                {/* 6. Allotment Info - Conditional */}
                {(status === 'CLOSED' || status === 'LISTED') && (
                    <div className="rounded-lg border p-4 bg-card">
                        <h3 className="mb-4 text-lg font-semibold">Allotment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="registrarName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Registrar Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Link Intime / KFintech" {...field} />
                                        </FormControl>
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
                )}

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
        </Form>
    )
}
