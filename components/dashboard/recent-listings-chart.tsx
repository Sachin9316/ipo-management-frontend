"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentListingsChartProps {
    data: any[]
}

export function RecentListingsChart({ data }: RecentListingsChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>
                    Recent IPO listing gains
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip
                            formatter={(value: any) => [`₹${value}`, 'Listing Gain']}
                            labelStyle={{ color: 'black' }}
                        />
                        <Legend />
                        <Bar dataKey="gain" fill="#16a34a" radius={[4, 4, 0, 0]} name="Listing Gain (₹)" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
