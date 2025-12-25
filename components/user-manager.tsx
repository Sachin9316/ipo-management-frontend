"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowUpDown, Pencil, Check, X } from "lucide-react"

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

import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const panSchema = z.object({
    panDocuments: z.array(z.object({
        panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)"),
        name: z.string().min(1, "Name is required"),
        status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
        documentUrl: z.string().optional()
    }))
})

type PanFormValues = z.infer<typeof panSchema>

export function UserManager() {
    const { data: users, isLoading, isError, error } = useGetCustomersQuery()
    const [updateUserPan] = useUpdateUserPanMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<PanFormValues>({
        resolver: zodResolver(panSchema),
        defaultValues: {
            panDocuments: []
        }
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "panDocuments"
    })

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        reset({
            panDocuments: user.panDocuments || []
        });
        setIsOpen(true);
    }

    const onSubmit = async (data: PanFormValues) => {
        if (!editingUser) return;
        try {
            await updateUserPan({ id: editingUser._id, panDocuments: data.panDocuments }).unwrap();
            toast.success("User PAN documents updated");
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update PAN documents");
        }
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
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-md space-y-4 bg-muted/20">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Document #{index + 1}</h4>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-500">
                                        Remove
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>PAN Number</Label>
                                        <Input
                                            {...register(`panDocuments.${index}.panNumber`)}
                                            className={errors.panDocuments?.[index]?.panNumber ? "border-red-500" : ""}
                                        />
                                        {errors.panDocuments?.[index]?.panNumber && (
                                            <p className="text-xs text-red-500">{errors.panDocuments[index]?.panNumber?.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Name on PAN</Label>
                                        <Input
                                            {...register(`panDocuments.${index}.name`)}
                                            className={errors.panDocuments?.[index]?.name ? "border-red-500" : ""}
                                        />
                                        {errors.panDocuments?.[index]?.name && (
                                            <p className="text-xs text-red-500">{errors.panDocuments[index]?.name?.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Controller
                                            control={control}
                                            name={`panDocuments.${index}.status`}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="VERIFIED">Verified</SelectItem>
                                                        <SelectItem value="REJECTED">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ panNumber: "", name: "", status: "PENDING", documentUrl: "" })}
                            className="w-full"
                        >
                            + Add New PAN Document
                        </Button>

                        <div className="flex gap-2 justify-end mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
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
