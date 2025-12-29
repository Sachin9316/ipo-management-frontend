"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, TrendingUp, Users, DollarSign } from "lucide-react"

interface CategoryStatsProps {
    title: string
    activeCount: number
    upcomingCount: number
    avgGMP: number
    highestGMP: number
    highestGMPCompany: string
}

export function CategoryStats({
    title,
    activeCount,
    upcomingCount,
    avgGMP,
    highestGMP,
    highestGMPCompany
}: CategoryStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active {title} IPOs
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Currently Open
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{upcomingCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Opening soon
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average GMP</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{avgGMP.toFixed(0)}</div>
                    <p className="text-xs text-muted-foreground">
                        Across active {title} IPOs
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Highest {title} GMP
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{highestGMP}</div>
                    <p className="text-xs text-muted-foreground truncate" title={highestGMPCompany}>
                        {highestGMPCompany || "N/A"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
