"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, TrendingUp, Users, DollarSign } from "lucide-react"

interface DetailedStatsProps {
    mainboardCount: number
    smeCount: number
    activeCount: number
    avgGMP: number
    highestGMP: number
    highestGMPCompany: string
}

export function DetailedStats({
    mainboardCount,
    smeCount,
    activeCount,
    avgGMP,
    highestGMP,
    highestGMPCompany
}: DetailedStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Market
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mainboardCount + smeCount}</div>
                    <div className="text-xs text-muted-foreground flex justify-between mt-1">
                        <span>Mainboard: {mainboardCount}</span>
                        <span>SME: {smeCount}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Active IPOs
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Currently Open / Upcoming
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
                        Across active IPOs
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Highest GMP
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
