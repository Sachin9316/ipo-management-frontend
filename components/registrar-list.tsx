"use client"

import {
    ColumnDef,
} from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash, Plus, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { useState, useMemo } from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useGetRegistrarsQuery, useUpdateRegistrarMutation, useDeleteRegistrarMutation } from "@/lib/features/api/registrarApi"
import { AlertModal } from "@/components/ui/alert-modal"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { RegistrarForm } from "@/components/registrar-form"
import { toast } from "sonner"
import Link from "next/link"
import { ImageModal } from "@/components/ui/image-modal"

export type Registrar = {
    _id: string
    name: string
    logo: string
    websiteLink: string
    description?: string
    createdAt: string
}

export function RegistrarList() {
    const { data: registrarsData, isLoading, isError } = useGetRegistrarsQuery(undefined)
    const [updateRegistrar] = useUpdateRegistrarMutation()
    const [deleteRegistrar] = useDeleteRegistrarMutation()

    const [isOpen, setIsOpen] = useState(false)
    const [editingRegistrar, setEditingRegistrar] = useState<Registrar | null>(null)

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [previewOpen, setPreviewOpen] = useState(false)

    const handleEditClick = (registrar: Registrar) => {
        setEditingRegistrar(registrar);
        setIsOpen(true);
    }

    const handleUpdate = async (values: any) => {
        if (!editingRegistrar) return;
        try {
            await updateRegistrar({ id: editingRegistrar._id, data: values }).unwrap()
            setIsOpen(false);
            setEditingRegistrar(null);
            toast.success("Registrar updated successfully")
        } catch (error) {
            console.error(error);
            toast.error("Error updating Registrar")
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
            await deleteRegistrar(deleteId).unwrap()
            toast.success("Registrar deleted successfully")
            setDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
            toast.error("Error deleting Registrar")
        } finally {
            setDeleteLoading(false);
        }
    }

    const onImageClick = (url: string) => {
        setPreviewImage(url);
        setPreviewOpen(true);
    }

    const columns: ColumnDef<Registrar>[] = useMemo(() => [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Registrar Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="flex items-center gap-3 pl-2">
                    <div
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            onImageClick(row.original.logo);
                        }}
                    >
                        <Avatar className="h-8 w-8 rounded-lg border border-border">
                            <AvatarImage src={row.original.logo} alt={row.getValue("name")} className="object-cover" />
                            <AvatarFallback className="rounded-lg font-bold">
                                {(row.getValue("name") as string)?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="font-bold">{row.getValue("name")}</div>
                </div>
            ),
        },
        {
            accessorKey: "websiteLink",
            header: "Website",
            cell: ({ row }) => (
                <a href={row.getValue("websiteLink")} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm">
                    {row.getValue("websiteLink")}
                </a>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const registrar = row.original
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
                            <DropdownMenuItem onClick={() => handleEditClick(registrar)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(registrar._id)} className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ], [])

    if (isLoading) return <TableSkeleton />
    if (isError) return <div className="text-center text-red-500">Failed to load registrars</div>

    const data = registrarsData?.registrars || []

    return (
        <div className="flex flex-col gap-4">
            <ImageModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                imageUrl={previewImage}
                title="Registrar Logo"
            />

            <AlertModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                loading={deleteLoading}
                title="Delete Registrar"
                description="Are you sure you want to delete this Registrar? This action cannot be undone."
            />

            <Sheet open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setEditingRegistrar(null);
            }}>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Edit Registrar</SheetTitle>
                        <SheetDescription>
                            Make changes to the registrar details here. Click save when you&apos;re done.
                        </SheetDescription>
                    </SheetHeader>
                    {editingRegistrar && (
                        <RegistrarForm
                            initialValues={editingRegistrar}
                            onSubmit={handleUpdate}
                        />
                    )}
                </SheetContent>
            </Sheet>

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Registrars</h1>
                <Link href="/dashboard/registrars/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Registrar
                    </Button>
                </Link>
            </div>

            <DataTable columns={columns} data={data} filterColumnName="name" />
        </div>
    )
}
