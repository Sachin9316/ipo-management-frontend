"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from "date-fns"

export type IPOData = {
    _id?: string
    id?: string
    companyName: string
    slug: string
    icon: string
    status: "UPCOMING" | "OPEN" | "CLOSED" | "LISTED"
    // Updated types matching backend
    subscription?: {
        qib: number
        nii: number
        retail: number
        employee: number
        total: number
        snii?: number
        bnii?: number
    }
    gmp?: {
        price: number
        kostak: string
        date: string
    }[]
    open_date: string
    close_date: string
    listing_date: string
    refund_date: string
    allotment_date: string
    lot_size: number
    lot_price: number
    bse_code_nse_code: string
    isAllotmentOut: boolean
    issueSize?: string
    min_price?: number
    max_price?: number
    registrarName?: string
    registrarLink?: string
}

export const columns: ColumnDef<IPOData>[] = [
    {
        accessorKey: "companyName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Company Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase font-bold">{row.getValue("companyName")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("status")}</div>
        )
    },
    {
        accessorKey: "gmp",
        header: "GMP",
        cell: ({ row }) => {
            // value might be array (new) or number (old legacy)
            const val = row.original.gmp;
            let amount = 0;
            if (Array.isArray(val) && val.length > 0) {
                // Get latest (last item?) or just check first
                // Assuming array is pushed to, so last is latest.
                amount = val[val.length - 1].price || 0;
            } else if (typeof val === 'number') {
                amount = val;
            }

            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount)

            return <div className="font-medium text-green-600">{formatted}</div>
        },
    },
    {
        accessorKey: "open_date",
        header: "Open Date",
        cell: ({ row }) => <div>{format(new Date(row.getValue("open_date")), "dd MMM")}</div>
    },
    {
        accessorKey: "close_date",
        header: "Close Date",
        cell: ({ row }) => <div>{format(new Date(row.getValue("close_date")), "dd MMM")}</div>
    },
    {
        accessorKey: "subscription",
        header: "Sub (x)",
        cell: ({ row }) => {
            const sub = row.original.subscription;
            let total = 0;
            if (typeof sub === 'object' && sub !== null) {
                total = sub.total || 0;
            } else if (typeof sub === 'number') {
                total = sub;
            }
            return <div>{total}x</div>
        }
    },
    {
        accessorKey: "issueSize",
        header: "Issue Size",
        cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("issueSize") || "N/A"}</div>
    },
    {
        id: "price_band",
        header: "Price Band",
        cell: ({ row }) => {
            const min = row.original.min_price;
            const max = row.original.max_price;
            if (!min && !max) return <div>-</div>
            if (min === max) return <div>₹{max}</div>
            return <div className="whitespace-nowrap">₹{min} - ₹{max}</div>
        }
    },
    {
        accessorKey: "lot_size",
        header: "Lot Size",
        cell: ({ row }) => <div>{row.getValue("lot_size")}</div>
    },
    {
        accessorKey: "registrarName",
        header: "Registrar",
        cell: ({ row }) => {
            const name = row.original.registrarName || "N/A";
            const link = row.original.registrarLink;
            if (link && link.startsWith('http')) {
                return (
                    <a href={link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline max-w-[150px] truncate block" title={name}>
                        {name}
                    </a>
                )
            }
            return <div className="max-w-[150px] truncate" title={name}>{name}</div>
        }
    },
    {
        accessorKey: "listing_date",
        header: "Listing Date",
        cell: ({ row }) => {
            const date = row.getValue("listing_date");
            if (!date) return <div>-</div>
            return <div>{format(new Date(date as string), "dd MMM")}</div>
        }
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const payment = row.original
            // ... existing action cell content ...
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(payment.id || payment._id || "")}
                            className="cursor-pointer"
                        >
                            Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">View details</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Edit details</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
