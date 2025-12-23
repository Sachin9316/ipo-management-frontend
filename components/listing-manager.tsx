"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Pencil } from "lucide-react"

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
import { IPOForm } from "@/components/ipo-form"
import { IPOData } from "@/app/dashboard/mainboard/columns"
import { toast } from "sonner"
import { useGetMainboardsQuery, useUpdateMainboardMutation } from "@/lib/features/api/mainboardApi"

export function ListingManager() {
    const { data: mainBoardData, isLoading, isError, isFetching } = useGetMainboardsQuery()
    const [updateMainboard] = useUpdateMainboardMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingIPO, setEditingIPO] = useState<IPOData | null>(null)

    // Filter: Only LISTED IPOs
    const filteredData = useMemo(() => {
        const data = mainBoardData?.data || []
        return data.filter((item: IPOData) => item.status === "LISTED")
    }, [mainBoardData])

    const handleUpdate = async (values: any) => {
        if (!editingIPO) return;
        const idToUpdate = editingIPO._id || editingIPO.id;
        try {
            await updateMainboard({ id: idToUpdate!, data: values }).unwrap()
            setIsOpen(false);
            setEditingIPO(null);
            toast.success("Listing info updated successfully")
        } catch (error) {
            console.error(error);
            toast.error("Error updating listing info")
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
            accessorKey: "lot_price",
            header: "Issue Price",
            cell: ({ row }) => {
                const amount = row.getValue<number>("lot_price") || 0
                return <div>{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount)}</div>
            }
        },
        {
            id: "listing_price",
            header: "Listing Price",
            cell: ({ row }) => {
                const info = (row.original as any).listing_info;
                const price = info?.listing_price || 0;
                return <div className="font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price)}</div>
            }
        },
        {
            id: "listing_gain",
            header: "Gain / Loss",
            cell: ({ row }) => {
                const info = (row.original as any).listing_info;
                const issuePrice = row.getValue<number>("lot_price") || 0;
                const listingPrice = info?.listing_price || 0;

                if (!issuePrice || !listingPrice) return <div>-</div>;

                const gain = listingPrice - issuePrice;
                const gainPercent = (gain / issuePrice) * 100;
                const isPositive = gain >= 0;

                return (
                    <div className={isPositive ? "text-green-600" : "text-red-600"}>
                        <span className="font-bold">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(gain)}</span>
                        <span className="text-xs ml-1">({gainPercent.toFixed(2)}%)</span>
                    </div>
                )
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
                <h1 className="text-2xl font-bold">Listing Information</h1>
            </div>

            <Sheet open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingIPO(null);
            }}>
                <SheetContent className="overflow-y-auto sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Update Listing Info</SheetTitle>
                        <SheetDescription>
                            Update listing price and day high/low for {editingIPO?.companyName}.
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
                <div>Loading...</div>
            ) : isError ? (
                <div>Error loading data</div>
            ) : (
                <DataTable columns={columns} data={filteredData} />
            )}
        </div>
    )
}
