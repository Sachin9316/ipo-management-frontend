"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { useRouter } from "next/navigation"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IPOForm } from "@/components/ipo-form"
import { IPOData } from "@/app/dashboard/mainboard/columns"
import moment from "moment";
import { toast } from "sonner"
import { useGetListedIPOsQuery, useUpdateListedIPOMutation, useDeleteListedIPOMutation, useDeleteListedBulkMutation } from "@/lib/features/api/listedApi"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertModal } from "@/components/ui/alert-modal"

interface ListedClientProps {
    initialData: IPOData[]
}

export function ListedClient({ initialData }: ListedClientProps) {
    const { data: qData, isLoading } = useGetListedIPOsQuery()
    const [updateListedIPO] = useUpdateListedIPOMutation()
    const [deleteListedIPO] = useDeleteListedIPOMutation()
    const [deleteListedBulk, { isLoading: isBulkDeleting }] = useDeleteListedBulkMutation()

    const data = qData || initialData || []

    const [isOpen, setIsOpen] = useState(false)
    const [editingIPO, setEditingIPO] = useState<IPOData | null>(null)
    const router = useRouter()

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleUpdate = async (values: any) => {
        if (!editingIPO) return;
        try {
            await updateListedIPO({ id: editingIPO.id || editingIPO._id!, data: values }).unwrap()
            setIsOpen(false);
            setEditingIPO(null);
            toast.success("Listed IPO updated successfully")
        } catch (error) {
            console.error(error);
            toast.error("Error updating Listed IPO")
        }
    }

    const onDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModalOpen(true);
    }

    const onConfirmDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await deleteListedIPO(deleteId).unwrap()
            toast.success("Listed IPO deleted successfully")
            setDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error deleting Listed IPO")
        } finally {
            setDeleteLoading(false);
        }
    }

    const onConfirmBulkDelete = async (selectedRows: IPOData[]) => {
        const ids = selectedRows.map(r => r.id || r._id).filter(Boolean) as string[];
        if (ids.length === 0) return;

        try {
            await deleteListedBulk(ids).unwrap();
            toast.success(`${ids.length} listed IPOs deleted successfully`);
        } catch (error) {
            console.error(error);
            toast.error("Error performing bulk delete");
        }
    }

    const columns: ColumnDef<IPOData>[] = useMemo(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value: any) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value: any) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
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
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <Avatar className="h-8 w-8 rounded-lg border border-border">
                        <AvatarImage src={row.original.icon} alt={row.getValue("companyName")} className="object-cover" />
                        <AvatarFallback className="rounded-lg font-bold">
                            {(row.getValue("companyName") as string)?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="font-bold">{row.getValue("companyName")}</div>
                </div>
            ),
        },
        {
            accessorKey: "lot_size",
            header: "Lot Size",
            cell: ({ row }) => <div>{row.getValue("lot_size")}</div>
        },
        {
            accessorKey: "lot_price",
            header: "Lot Price",
            cell: ({ row }) => {
                const amount = row.getValue<number>("lot_price") || 0
                return <div>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)}</div>
            }
        },
        {
            id: "listing_gain",
            header: "Listing Gain",
            cell: ({ row }) => {
                const val = row.getValue("gmp");
                let gmp = 0;
                if (Array.isArray(val) && val.length > 0) {
                    gmp = val[val.length - 1].price || 0;
                } else if (typeof val === 'number') {
                    gmp = val;
                } else if (typeof val === 'string') {
                    gmp = parseFloat(val);
                }

                const lotSize = row.getValue<number>("lot_size") || 0
                const lotPrice = row.getValue<number>("lot_price") || 0

                if (lotPrice === 0 || lotSize === 0) return <div>-</div>

                const totalGain = gmp * lotSize;
                const gainPercentage = (totalGain / lotPrice) * 100;

                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-green-600">
                            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(totalGain)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            ({gainPercentage.toFixed(2)}%)
                        </span>
                    </div>
                )
            },
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
                const val = row.getValue("gmp");
                let amount = 0;
                if (Array.isArray(val) && val.length > 0) {
                    amount = val[val.length - 1].price || 0;
                } else if (typeof val === 'number') {
                    amount = val;
                } else if (typeof val === 'string') {
                    amount = parseFloat(val);
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
            cell: ({ row }) => <div>{moment(row.getValue("open_date")).format('ll')}</div>
        },
        {
            accessorKey: "close_date",
            header: "Close Date",
            cell: ({ row }) => <div>{moment(row.getValue("close_date")).format('ll')}</div>
        },
        {
            accessorKey: "subscription",
            header: "Sub (x)",
            cell: ({ row }) => {
                const sub = row.getValue("subscription");
                let total = 0;
                if (typeof sub === 'object' && sub !== null) {
                    total = (sub as any).total || 0;
                } else if (typeof sub === 'number') {
                    total = sub;
                }
                return <div>{total}x</div>
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const ipo = row.original

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
                            <DropdownMenuItem onClick={() => {
                                setEditingIPO(ipo);
                                setIsOpen(true);
                            }}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(ipo.id || ipo._id || "")} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], []);


    return (
        <div className="flex flex-col gap-4">
            <AlertModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                loading={deleteLoading}
                title="Delete Listed IPO"
                description="Are you sure you want to delete this Listed IPO? This action cannot be undone."
            />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Listed IPOs</h1>
                {/* No Add Button for Listed IPOs */}
            </div>

            <Sheet open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingIPO(null);
            }}>
                <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Edit Listed IPO</SheetTitle>
                        <SheetDescription>
                            Update the details of the listed IPO.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                        <IPOForm
                            onSubmit={handleUpdate}
                            initialValues={editingIPO || undefined}
                        />
                    </div>
                </SheetContent>
            </Sheet>
            <DataTable columns={columns} data={data} onBulkDelete={onConfirmBulkDelete} bulkDeleteLoading={isBulkDeleting} />
        </div>
    )
}
