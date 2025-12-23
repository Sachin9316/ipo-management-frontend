"use client"

import { useState, useMemo } from "react"
import { ArrowUpDown, Pencil, FileText, Check, X } from "lucide-react"

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
import { toast } from "sonner"
import { useGetCustomersQuery, useUpdateUserPanMutation } from "@/lib/features/api/userApi"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export function UserManager() {
    const { data: users, isLoading, isError, error } = useGetCustomersQuery()
    const [updateUserPan] = useUpdateUserPanMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)
    const [panDocs, setPanDocs] = useState<any[]>([])

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setPanDocs(user.panDocuments || []);
        setIsOpen(true);
    }

    const handleUpdatePan = async () => {
        if (!editingUser) return;
        try {
            await updateUserPan({ id: editingUser._id, panDocuments: panDocs }).unwrap();
            toast.success("User PAN documents updated");
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update PAN documents");
        }
    }

    const updateDoc = (index: number, field: string, value: any) => {
        const newDocs = [...panDocs];
        newDocs[index] = { ...newDocs[index], [field]: value };
        setPanDocs(newDocs);
    }

    const addDoc = () => {
        setPanDocs([...panDocs, { panNumber: "", nameOnPan: "", status: "PENDING" }]);
    }

    const removeDoc = (index: number) => {
        const newDocs = [...panDocs];
        newDocs.splice(index, 1);
        setPanDocs(newDocs);
    }

    const columns: ColumnDef<any>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-bold pl-3">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("email")}</div>,
        },
        {
            accessorKey: "phoneNumber",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phoneNumber") || "N/A"}</div>,
        },
        {
            id: "saved_pans",
            header: "Saved PANs",
            cell: ({ row }) => {
                const docs = (row.original as any).panDocuments || [];
                if (docs.length === 0) return <Badge variant="secondary">0 Saved</Badge>;
                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant="outline">{docs.length} PANs</Badge>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {docs.map((d: any) => d.panNumber).join(", ")}
                        </span>
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
                        <Pencil className="mr-2 h-4 w-4" /> Manage PANs
                    </Button>
                )
            },
        }
    ], []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Manage PAN Documents</SheetTitle>
                        <SheetDescription>
                            User: {editingUser?.name} ({editingUser?.email})
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        {panDocs.map((doc, index) => (
                            <div key={index} className="p-4 border rounded-md space-y-4 bg-muted/20">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Document #{index + 1}</h4>
                                    <Button variant="ghost" size="sm" onClick={() => removeDoc(index)} className="text-red-500">
                                        Remove
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>PAN Number</Label>
                                        <Input
                                            value={doc.panNumber}
                                            onChange={(e) => updateDoc(index, "panNumber", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Name on PAN</Label>
                                        <Input
                                            value={doc.nameOnPan}
                                            onChange={(e) => updateDoc(index, "nameOnPan", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                            value={doc.status}
                                            onValueChange={(val) => updateDoc(index, "status", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                                <SelectItem value="VERIFIED">Verified</SelectItem>
                                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Document URL</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={doc.documentUrl || ""}
                                                onChange={(e) => updateDoc(index, "documentUrl", e.target.value)}
                                                placeholder="https://..."
                                            />
                                            {doc.documentUrl && (
                                                <Button size="icon" variant="ghost" asChild>
                                                    <a href={doc.documentUrl} target="_blank" rel="noreferrer">
                                                        <FileText className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button variant="outline" onClick={addDoc} className="w-full">
                            + Add New PAN Document
                        </Button>

                        <div className="flex gap-2 justify-end mt-6">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdatePan}>Save Changes</Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
            ) : isError ? (
                <div className="text-red-500">
                    Error loading users: {(error as any)?.data?.message || (error as any)?.error || "Unknown error"}
                </div>
            ) : (
                <DataTable columns={columns} data={users || []} />
            )}
        </div>
    )
}
