"use client"

import { useGetMainboardsQuery } from "@/lib/features/api/mainboardApi"
import { useGetListedIPOsQuery } from "@/lib/features/api/listedApi"
import { useGetSMEIPOsQuery } from "@/lib/features/api/smeApi"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { RecentListingsChart } from "@/components/dashboard/recent-listings-chart"

export default function DashboardPage() {
    const { data: mainboardData } = useGetMainboardsQuery()
    const { data: listedData } = useGetListedIPOsQuery()
    const { data: smeData } = useGetSMEIPOsQuery()

    // Aggregate data
    // Handle potential { data: [...] } structure or direct array
    const mainboards = Array.isArray(mainboardData) ? mainboardData : (mainboardData as any)?.data || []
    const listed = Array.isArray(listedData) ? listedData : (listedData as any)?.data || []
    const sme = Array.isArray(smeData) ? smeData : (smeData as any)?.data || []

    const allIPOs = [...mainboards, ...listed, ...sme];

    const totalIPOs = allIPOs.length
    const activeIPOs = allIPOs.filter((ipo: any) => ipo.status === "OPEN" || ipo.status === "UPCOMING").length
    const upcomingIPOs = allIPOs.filter((ipo: any) => ipo.status === "UPCOMING").length

    // Calculate Average GMP for active/upcoming IPOs
    const activeGmpIPOs = allIPOs.filter((ipo: any) => (ipo.status === "OPEN" || ipo.status === "UPCOMING") && ipo.gmp)
    const totalGmp = activeGmpIPOs.reduce((sum: number, ipo: any) => sum + (parseFloat(ipo.gmp) || 0), 0)
    const avgGMP = activeGmpIPOs.length > 0 ? totalGmp / activeGmpIPOs.length : 0

    // Prepare chart data (Listing Gains of recently listed)
    // Listed IPOs likely have a 'listing_price' or we calculate gain based on gmp+lot_price if listed
    // For now, let's assume 'listed' array contains listed IPOs and better to visualize listing gains
    // Or we use 'gmp' * 'lot_size' as a proxy for "Expected Gain" for all IPOs
    const chartData = allIPOs.slice(0, 10).map((ipo: any) => ({
        name: ipo.companyName,
        gain: (parseFloat(ipo.gmp) || 0) * (parseFloat(ipo.lot_size) || 0)
    }))

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>
            <OverviewCards
                totalIPOs={totalIPOs}
                activeIPOs={activeIPOs}
                upcomingIPOs={upcomingIPOs}
                avgGMP={avgGMP}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RecentListingsChart data={chartData} />
            </div>
        </div>
    )
}
