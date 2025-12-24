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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IPOForm } from "@/components/ipo-form"
import { IPOData } from "@/app/dashboard/mainboard/columns"
import moment from "moment";
import { toast } from "sonner"
import { useGetMainboardsQuery, useUpdateMainboardMutation, useDeleteMainboardMutation } from "@/lib/features/api/mainboardApi"
import { AlertModal } from "@/components/ui/alert-modal"
import { TableSkeleton } from "@/components/ui/table-skeleton"

export function IPOStatusList({ status, ipoType }: { status?: string, ipoType?: string }) {
    const { data: mainBoardData, isLoading, isError, refetch, isFetching } = useGetMainboardsQuery({
        limit: 1000,
        ipoType: ipoType
    })
    const [updateMainboard] = useUpdateMainboardMutation()
    const [deleteMainboard] = useDeleteMainboardMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingIPO, setEditingIPO] = useState<IPOData | null>(null)

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const filteredData = useMemo(() => {
        const data = mainBoardData?.data || []
        if (!status) return data
        const targetStatus = status.toUpperCase();
        return data.filter((item: IPOData) => item.status === targetStatus)
    }, [mainBoardData, status, ipoType])

    const handleUpdate = async (values: any) => {
        if (!editingIPO) return;
        const idToUpdate = editingIPO._id || editingIPO.id;
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

    const columns: ColumnDef<IPOData>[] = useMemo(() => [
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
            accessorKey: "ipoType",
            header: "IPO Type",
            cell: ({ row }) => {
                const type = row.getValue("ipoType") as string || "MAINBOARD";
                return (
                    <div>
                        {type === "SME" ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">SME</span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">MAINBOARD</span>
                        )}
                    </div>
                )
            }
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
                const id = row.original._id || row.original.id; // Corrected to use fallback

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
                <h1 className="text-2xl font-bold capitalize">{status ? `${status} IPOs` : 'All IPOs'}</h1>
            </div>

            <Sheet open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingIPO(null);
            }}>
                <SheetContent className="overflow-y-auto sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Edit IPO</SheetTitle>
                        <SheetDescription>
                            Update the IPO details below.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                        <IPOForm
                            key={editingIPO?._id || editingIPO?.id || 'new'}
                            onSubmit={handleUpdate}
                            initialValues={editingIPO}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {isLoading ? (
                <TableSkeleton rows={5} columns={10} />
            ) : isError ? (
                <div>Error loading data</div>
            ) : (
                <DataTable columns={columns} data={filteredData} />
            )}
        </div>
    )
}
