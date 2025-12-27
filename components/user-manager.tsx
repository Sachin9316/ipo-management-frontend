"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowUpDown, Pencil, Check, X, MoreHorizontal, Trash2, UserCog } from "lucide-react"

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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { toast } from "sonner"
import { useGetCustomersQuery, useUpdateUserPanMutation, useUpdateUserMutation, useDeleteUserMutation, useDeleteUsersBulkMutation } from "@/lib/features/api/userApi"
import { Checkbox } from "@/components/ui/checkbox"
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

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().optional(),
    role: z.enum(["user", "admin", "superadmin"]),
})

type PanFormValues = z.infer<typeof panSchema>
type UserFormValues = z.infer<typeof userSchema>

export function UserManager() {
    const { data: users, isLoading, isError, error } = useGetCustomersQuery()
    const [updateUserPan] = useUpdateUserPanMutation()
    const [updateUser] = useUpdateUserMutation()
    const [deleteUser] = useDeleteUserMutation()
    const [deleteUsersBulk, { isLoading: isBulkDeleting }] = useDeleteUsersBulkMutation()

    // State
    const [isPanSheetOpen, setIsPanSheetOpen] = useState(false)
    const [isUserSheetOpen, setIsUserSheetOpen] = useState(false)
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<any | null>(null)

    // Example user structure in existing code had: _id, name, email, phoneNumber, panDocuments, role?
    // User model has role.

    // --- PAN Form ---
    const panForm = useForm<PanFormValues>({
        resolver: zodResolver(panSchema),
        defaultValues: { panDocuments: [] }
    })

    const { fields: panFields, append: appendPan, remove: removePan } = useFieldArray({
        control: panForm.control,
        name: "panDocuments"
    })

    // --- User Edit Form ---
    const userForm = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            phoneNumber: "",
            role: "user"
        }
    })

    // Actions
    const openPanManager = (user: any) => {
        setEditingUser(user)
        panForm.reset({ panDocuments: user.panDocuments || [] })
        setIsPanSheetOpen(true)
    }

    const openEditUser = (user: any) => {
        setEditingUser(user)
        userForm.reset({
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber || "",
            role: user.role || "user"
        })
        setIsUserSheetOpen(true)
    }

    const openDeleteAlert = (user: any) => {
        setEditingUser(user)
        setIsDeleteAlertOpen(true)
    }

    // Handlers
    const onPanSubmit = async (data: PanFormValues) => {
        if (!editingUser) return
        try {
            await updateUserPan({ id: editingUser._id, panDocuments: data.panDocuments }).unwrap()
            toast.success("User PAN documents updated")
            setIsPanSheetOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to update PAN documents")
        }
    }

    const onUserSubmit = async (data: UserFormValues) => {
        if (!editingUser) return
        try {
            await updateUser({ id: editingUser._id, data }).unwrap()
            toast.success("User updated successfully")
            setIsUserSheetOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to update user")
        }
    }

    const onDeleteConfirm = async () => {
        if (!editingUser) return
        try {
            await deleteUser(editingUser._id).unwrap()
            toast.success("User deleted successfully")
            setIsDeleteAlertOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete user")
        }
    }

    const onBulkDelete = async (selectedRows: any[]) => {
        const ids = selectedRows.map(r => r._id).filter(Boolean);
        if (ids.length === 0) return;

        try {
            await deleteUsersBulk(ids).unwrap();
            toast.success(`${ids.length} users removed successfully`);
        } catch (error) {
            console.error(error);
            toast.error("Error performing bulk delete");
        }
    }

    const columns: ColumnDef<any>[] = useMemo(() => [
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
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-bold pl-3">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Email <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("email")}</div>,
        },
        {
            accessorKey: "phoneNumber",
            header: "Phone",
            cell: ({ row }) => <div>{row.getValue("phoneNumber") || "N/A"}</div>,
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => <Badge variant={row.getValue("role") === "admin" ? "default" : "secondary"}>{row.getValue("role")}</Badge>,
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
                const user = row.original;
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
                            <DropdownMenuItem onClick={() => openEditUser(user)}>
                                <UserCog className="mr-2 h-4 w-4" /> Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openPanManager(user)}>
                                <Pencil className="mr-2 h-4 w-4" /> Manage PANs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteAlert(user)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        }
    ], []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
            </div>

            {/* --- User Edit Sheet --- */}
            <Sheet open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Edit User Profile</SheetTitle>
                        <SheetDescription>
                            Make changes to user profile here. Click save when you're done.
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" {...userForm.register("name")} />
                            {userForm.formState.errors.name && <p className="text-sm text-red-500">{userForm.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" {...userForm.register("email")} />
                            {userForm.formState.errors.email && <p className="text-sm text-red-500">{userForm.formState.errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input id="phoneNumber" {...userForm.register("phoneNumber")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Controller
                                control={userForm.control}
                                name="role"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="superadmin">Superadmin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            {/* --- PAN Manager Sheet --- */}
            <Sheet open={isPanSheetOpen} onOpenChange={setIsPanSheetOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-[600px]">
                    <SheetHeader>
                        <SheetTitle>Manage PAN Documents</SheetTitle>
                        <SheetDescription>
                            User: {editingUser?.name} ({editingUser?.email})
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={panForm.handleSubmit(onPanSubmit)} className="mt-6 space-y-6">
                        {panFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-md space-y-4 bg-muted/20">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Document #{index + 1}</h4>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removePan(index)} className="text-red-500">
                                        Remove
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>PAN Number</Label>
                                        <Input
                                            {...panForm.register(`panDocuments.${index}.panNumber`)}
                                            className={panForm.formState.errors.panDocuments?.[index]?.panNumber ? "border-red-500" : ""}
                                        />
                                        {panForm.formState.errors.panDocuments?.[index]?.panNumber && (
                                            <p className="text-xs text-red-500">{panForm.formState.errors.panDocuments[index]?.panNumber?.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Name on PAN</Label>
                                        <Input
                                            {...panForm.register(`panDocuments.${index}.name`)}
                                            className={panForm.formState.errors.panDocuments?.[index]?.name ? "border-red-500" : ""}
                                        />
                                        {panForm.formState.errors.panDocuments?.[index]?.name && (
                                            <p className="text-xs text-red-500">{panForm.formState.errors.panDocuments[index]?.name?.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Controller
                                            control={panForm.control}
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
                            onClick={() => appendPan({ panNumber: "", name: "", status: "PENDING", documentUrl: "" })}
                            className="w-full"
                        >
                            + Add New PAN Document
                        </Button>

                        <div className="flex gap-2 justify-end mt-6">
                            <Button type="button" variant="outline" onClick={() => setIsPanSheetOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>

            {/* --- Delete Alert --- */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            <strong> {editingUser?.name} </strong>
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {isLoading ? (
                <TableSkeleton rows={5} columns={7} />
            ) : isError ? (
                <div className="text-red-500">
                    Error loading users: {(error as any)?.data?.message || (error as any)?.error || "Unknown error"}
                </div>
            ) : (
                <DataTable columns={columns} data={users || []} onBulkDelete={onBulkDelete} bulkDeleteLoading={isBulkDeleting} filterColumnName="fullName" />
            )}
        </div>
    )
}
