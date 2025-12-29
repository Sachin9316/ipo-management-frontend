"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface SubscriptionTrendChartProps {
    data: {
        name: string
        qib: number
        nii: number
        retail: number
    }[]
}

export function SubscriptionTrendChart({ data }: SubscriptionTrendChartProps) {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Subscription Trends</CardTitle>
                <CardDescription>
                    Demand across categories for active/recent IPOs
                </CardDescription>
            </CardHeader>
            <CardContent>
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
                            tickFormatter={(value) => `${value}x`}
                        />
                        <Tooltip
                            formatter={(value: any) => [`${value}x`]}
                            labelStyle={{ color: 'black' }}
                        />
                        <Legend />
                        <Bar dataKey="qib" fill="#2563eb" name="QIB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="nii" fill="#16a34a" name="NII" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="retail" fill="#e11d48" name="Retail" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
