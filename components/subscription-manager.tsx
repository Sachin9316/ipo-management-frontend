"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Pencil } from "lucide-react"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { IPOForm } from "@/components/ipo-form"
import { IPOData } from "@/app/dashboard/mainboard/columns"
import { toast } from "sonner"
import { useGetMainboardsQuery, useUpdateMainboardMutation } from "@/lib/features/api/mainboardApi"

export function SubscriptionManager() {
    const { data: mainBoardData, isLoading, isError, isFetching } = useGetMainboardsQuery()
    const [updateMainboard] = useUpdateMainboardMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingIPO, setEditingIPO] = useState<IPOData | null>(null)

    // Filter Logic: Show UPCOMING, OPEN, CLOSED (Exclude LISTED usually, or keep all)
    // For Subscription, usually relevant until Listing.
    const filteredData = useMemo(() => {
        const data = mainBoardData?.data || []
        return data.filter((item: IPOData) => item.status !== "LISTED")
    }, [mainBoardData])

    const handleUpdate = async (values: any) => {
        if (!editingIPO) return;
        const idToUpdate = editingIPO._id || editingIPO.id;
        try {
            await updateMainboard({ id: idToUpdate!, data: values }).unwrap()
            setIsOpen(false);
            setEditingIPO(null);
            toast.success("Subscription updated successfully")
        } catch (error) {
            console.error(error);
            toast.error("Error updating subscription")
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let colorClass = "text-gray-500";
                if (status === "OPEN") colorClass = "text-green-600 font-bold";
                if (status === "CLOSED") colorClass = "text-red-600 font-bold";

                return <div className={`capitalize ${colorClass}`}>{status}</div>
            }
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
            id: "qib",
            header: "QIB (x)",
            cell: ({ row }) => {
                const sub = row.original.subscription;
                return <div className="font-medium">{(sub as any)?.qib || 0}x</div>
            }
        },
        {
            id: "nii",
            header: "NII (x)",
            cell: ({ row }) => {
                const sub = row.original.subscription;
                return <div className="font-medium">{(sub as any)?.nii || 0}x</div>
            }
        },
        {
            id: "retail",
            header: "Retail (x)",
            cell: ({ row }) => {
                const sub = row.original.subscription;
                return <div className="font-medium">{(sub as any)?.retail || 0}x</div>
            }
        },
        {
            id: "total",
            header: "Total (x)",
            cell: ({ row }) => {
                const sub = row.original.subscription;
                return <div className="font-bold text-primary">{(sub as any)?.total || 0}x</div>
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(row.original)}>
                        <Pencil className="mr-2 h-4 w-4" /> Update
                    </Button>
                )
            },
        },
    ], []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Subscription Management</h1>
            </div>

            <Sheet open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingIPO(null);
            }}>
                <SheetContent className="overflow-y-auto sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Update Subscription</SheetTitle>
                        <SheetDescription>
                            Update the subscription figures for {editingIPO?.companyName}.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                        <IPOForm
                            onSubmit={handleUpdate}
                            initialValues={editingIPO}
                        />
                    </div>
                </SheetContent>
            </Sheet>

            {isLoading ? (
                <TableSkeleton rows={5} columns={6} />
            ) : isError ? (
                <div>Error loading data</div>
            ) : (
                <DataTable columns={columns} data={filteredData} />
            )}
        </div>
    )
}
