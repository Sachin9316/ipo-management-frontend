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
import { useGetMainboardsQuery, useCreateMainboardMutation, useUpdateMainboardMutation, useDeleteMainboardMutation, useDeleteMainboardBulkMutation } from "@/lib/features/api/mainboardApi"
import { AlertModal } from "@/components/ui/alert-modal"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Checkbox } from "@/components/ui/checkbox"

export function MainboardClient() {
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
    const { data: mainBoardData, isLoading, isError, refetch, isFetching } = useGetMainboardsQuery(statusFilter ? { status: statusFilter } : undefined)
    const [createMainboard] = useCreateMainboardMutation()
    const [updateMainboard] = useUpdateMainboardMutation()
    const [deleteMainboard] = useDeleteMainboardMutation()
    const [deleteMainboardBulk, { isLoading: isBulkDeleting }] = useDeleteMainboardBulkMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingIPO, setEditingIPO] = useState<IPOData | null>(null)

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const handleCreate = async (values: any) => {
        try {
            await createMainboard(values).unwrap()
            setIsOpen(false);
            toast.success("IPO created successfully")
        } catch (error) {
            console.error(error);
            toast.error("Failed to create IPO")
        }
    }

    const handleUpdate = async (values: any) => {
        console.log("handleUpdate called", { values, editingIPO });
        if (!editingIPO) return;
        const idToUpdate = editingIPO._id || editingIPO.id;
        console.log("Updating ID:", idToUpdate);

        try {
            await updateMainboard({ id: idToUpdate!, data: values }).unwrap()
            setIsOpen(false);
            setEditingIPO(null);
            toast.success("IPO updated successfully")
        } catch (error) {
            console.error(error);
            toast.error("Error updating IPO")
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
            await deleteMainboard(deleteId).unwrap()
            toast.success("IPO deleted successfully")
            setDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error deleting IPO")
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
            await deleteMainboardBulk(ids).unwrap();
            toast.success(`${ids.length} IPOs deleted successfully`);
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
            id: "est_profit",
            header: "Est. Profit",
            cell: ({ row }) => {
                const p = row.original.est_profit;
                if (p === undefined || p === null) return <div>-</div>;
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                }).format(p);

                // Color coding: Green > 0, Red < 0, Gray = 0
                const colorClass = p > 0 ? "text-green-600" : p < 0 ? "text-red-600" : "text-gray-500";

                const lotPrice = row.getValue<number>("lot_price") || 0;
                let percentage = 0;
                if (lotPrice > 0) {
                    percentage = (p / lotPrice) * 100;
                }

                return (
                    <div className="flex flex-col">
                        <span className={`font-semibold ${colorClass}`}>{formatted}</span>
                        {percentage !== 0 && (
                            <span className="text-xs text-muted-foreground">({percentage.toFixed(2)}%)</span>
                        )}
                    </div>
                )
            }
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
                    maximumFractionDigits: 0
                }).format(amount)

                const basePrice = row.original.max_price || row.original.min_price || 0;
                let percentage = 0;
                if (basePrice > 0) {
                    percentage = (amount / basePrice) * 100;
                }

                return (
                    <div className="flex flex-col">
                        <span className="font-medium text-green-600">{formatted}</span>
                        {percentage > 0 && (
                            <span className="text-xs text-muted-foreground">({percentage.toFixed(2)}%)</span>
                        )}
                    </div>
                )
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
                const id = row.original._id;

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
                title="Delete IPO"
                description="Are you sure you want to delete this IPO? This action cannot be undone."
            />

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Mainboard IPOs</h1>
                <Sheet open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) setEditingIPO(null);
                }}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New IPO
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto sm:max-w-[600px]">
                        <SheetHeader>
                            <SheetTitle>{editingIPO ? "Edit IPO" : "Add New IPO"}</SheetTitle>
                            <SheetDescription>
                                {editingIPO ? "Update the IPO details below." : "Fill in the details to create a new IPO."}
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4">
                            <IPOForm
                                onSubmit={editingIPO ? handleUpdate : handleCreate}
                                initialValues={editingIPO}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {isLoading ? (
                <TableSkeleton rows={5} columns={9} />
            ) : isError ? (
                <div>Error loading data</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={mainBoardData?.data || []}
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
                                <SelectItem value="CLOSED,LISTED">Closed & Listed</SelectItem>
                            </SelectContent>
                        </Select>
                    }
                />
            )}
        </div>
    )
}
