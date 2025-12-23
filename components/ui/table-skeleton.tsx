import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface TableSkeletonProps {
    rows?: number
    columns?: number
}

export function TableSkeleton({ rows = 5, columns = 9 }: TableSkeletonProps) {
    return (
        <div className="w-full">
            {/* Search and Filter Skeleton */}
            <div className="flex items-center py-4 gap-4">
                <Skeleton className="h-10 w-full max-w-sm" />
                <Skeleton className="h-10 w-32 ml-auto" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columns }).map((_, index) => (
                                <TableHead key={index}>
                                    <Skeleton className="h-4 w-full" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <TableCell key={colIndex}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
        </div>
    )
}
