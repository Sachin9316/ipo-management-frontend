"use client"

import { useState, useMemo } from "react"
import { Plus, ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"
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
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { IPOForm } from "@/components/ipo-form"
import { IPOData } from "@/app/dashboard/mainboard/columns"
import moment from "moment";
import { toast } from "sonner"
import { useGetSMEIPOsQuery, useCreateSMEIPOMutation, useUpdateSMEIPOMutation, useDeleteSMEIPOMutation, useDeleteSMEBulkMutation } from "@/lib/features/api/smeApi"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertModal } from "@/components/ui/alert-modal"

export function SMEClient() {
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const { data: smeData, isLoading, isError, isFetching } = useGetSMEIPOsQuery(statusFilter ? { status: statusFilter } : undefined)
    const [createSMEIPO] = useCreateSMEIPOMutation()
    const [updateSMEIPO] = useUpdateSMEIPOMutation()
    const [deleteSMEIPO] = useDeleteSMEIPOMutation()
    const [deleteSMEBulk, { isLoading: isBulkDeleting }] = useDeleteSMEBulkMutation()
    const [isOpen, setIsOpen] = useState(false)
    const [editingIPO, setEditingIPO] = useState<IPOData | null>(null)

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleCreate = async (values: any) => {
        try {
            await createSMEIPO(values).unwrap()
            setIsOpen(false);
            toast.success("SME IPO created successfully")
        } catch (error) {
            console.error(error);
            toast.error("Failed to create SME IPO")
        }
    }

    const handleUpdate = async (values: any) => {
        if (!editingIPO) return;
        const idToUpdate = editingIPO._id || editingIPO.id;

        try {
            await updateSMEIPO({ id: idToUpdate!, data: values }).unwrap()
            setIsOpen(false);
            setEditingIPO(null);
            toast.success("SME IPO updated successfully")
        } catch (error) {
            console.error(error);
            toast.error("Error updating SME IPO")
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
            await deleteSMEIPO(deleteId).unwrap()
            toast.success("SME IPO deleted successfully")
            setDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error deleting SME IPO")
        } finally {
            setDeleteLoading(false);
        }
    }

    const handleEditClick = (ipo: IPOData) => {
        setEditingIPO(ipo);
        setIsOpen(true);
    }

    const handleBulkDelete = async (selectedRows: IPOData[]) => {
        const ids = selectedRows.map(r => r._id || r.id).filter(Boolean) as string[];
        if (ids.length === 0) return;

        try {
            await deleteSMEBulk(ids).unwrap();
            toast.success(`${ids.length} SME IPOs deleted successfully`);
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
            cell: ({ row }) => <div className="font-bold pl-3">{row.getValue("companyName")}</div>,
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
                const id = row.original._id || row.original.id;

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
                            <DropdownMenuItem onClick={() => handleEditClick(row.original)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(id || "")} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [isFetching]);


    return (
        <div className="flex flex-col gap-4">
            <AlertModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                loading={deleteLoading}
                title="Delete SME IPO"
                description="Are you sure you want to delete this SME IPO? This action cannot be undone."
            />
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">SME IPOs</h1>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingIPO(null);
                }}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {editingIPO ? "Edit IPO" : "Add SME IPO"}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>{editingIPO ? "Edit SME IPO" : "Add New SME IPO"}</SheetTitle>
                            <SheetDescription>
                                {editingIPO ? "Update the details of the SME IPO." : "Fill in the details to list a new SME IPO."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="py-4 p-4">
                            <IPOForm
                                onSubmit={editingIPO ? handleUpdate : handleCreate}
                                initialValues={editingIPO || undefined}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <DataTable
                columns={columns}
                data={(smeData as any)?.data || []}
                onBulkDelete={handleBulkDelete}
                bulkDeleteLoading={isBulkDeleting}
                customFilter={
                    <Select
                        value={statusFilter || "all"}
                        onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="UPCOMING">Upcoming</SelectItem>
                            <SelectItem value="LISTED">Listed</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />
        </div>
    )
}
