"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Pencil, FileText, XCircle, CheckCircle } from "lucide-react"

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

export function DocumentsManager() {
    const { data: mainBoardData, isLoading, isError, isFetching } = useGetMainboardsQuery()
    const [updateMainboard] = useUpdateMainboardMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingIPO, setEditingIPO] = useState<IPOData | null>(null)

    // Show all IPOs
    const filteredData = useMemo(() => {
        return mainBoardData?.data || []
    }, [mainBoardData])

    const handleUpdate = async (values: any) => {
        if (!editingIPO) return;
        const idToUpdate = editingIPO._id || editingIPO.id;
        try {
            await updateMainboard({ id: idToUpdate!, data: values }).unwrap()
            setIsOpen(false);
            setEditingIPO(null);
            toast.success("Documents updated successfully")
        } catch (error) {
            console.error(error);
            toast.error("Error updating documents")
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
            id: "drhp",
            header: "DRHP",
            cell: ({ row }) => {
                const link = (row.original as any).drhp_pdf;
                return link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> View
                    </a>
                ) : (
                    <div className="flex items-center text-muted-foreground">
                        <XCircle className="w-4 h-4 mr-1 text-red-500" /> Missing
                    </div>
                );
            }
        },
        {
            id: "rhp",
            header: "RHP",
            cell: ({ row }) => {
                const link = (row.original as any).rhp_pdf;
                return link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" /> View
                    </a>
                ) : (
                    <div className="flex items-center text-muted-foreground">
                        <XCircle className="w-4 h-4 mr-1 text-red-500" /> Missing
                    </div>
                );
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                return (
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(row.original)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Links
                    </Button>
                )
            },
        },
    ], []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Documents & Links</h1>
            </div>

            <Sheet open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingIPO(null);
            }}>
                <SheetContent className="overflow-y-auto sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Update Documents</SheetTitle>
                        <SheetDescription>
                            Update DRHP and RHP links for {editingIPO?.companyName}.
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
                <TableSkeleton rows={5} columns={5} />
            ) : isError ? (
                <div>Error loading data</div>
            ) : (
                <DataTable columns={columns} data={filteredData} />
            )}
        </div>
    )
}
