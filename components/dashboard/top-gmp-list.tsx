"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TopGMPListProps {
    data: {
        name: string
        gmp: number
        price: number
        type: string
        status: string
    }[]
}

export function TopGMPList({ data }: TopGMPListProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Top Opportunities</CardTitle>
                <CardDescription>
                    Highest GMP among active IPOs
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.length === 0 && <div className="text-sm text-muted-foreground">No active GMP data found.</div>}
                    {data.map((item, index) => {
                        const gain = (item.gmp / item.price) * 100;
                        return (
                            <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none truncate max-w-[150px]" title={item.name}>
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.type}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-bold text-green-600">₹{item.gmp}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={gain > 50 ? "default" : "secondary"} className="text-[10px]">
                                            +{gain.toFixed(0)}%
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
