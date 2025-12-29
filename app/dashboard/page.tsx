"use client"

import { useGetMainboardsQuery } from "@/lib/features/api/mainboardApi"
import { useGetListedIPOsQuery } from "@/lib/features/api/listedApi"
import { useGetSMEIPOsQuery } from "@/lib/features/api/smeApi"
import { RecentListingsChart } from "@/components/dashboard/recent-listings-chart"
import { Button } from "@/components/ui/button"
import { useSyncScrapedDataMutation, useSyncGMPDataMutation } from "@/lib/features/api/scraperApi"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { DetailedStats } from "@/components/dashboard/detailed-stats"
import { CategoryStats } from "@/components/dashboard/category-stats"
import { SubscriptionTrendChart } from "@/components/dashboard/subscription-chart"
import { TopGMPList } from "@/components/dashboard/top-gmp-list"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
    const { data: mainboardData } = useGetMainboardsQuery()
    const { data: listedData } = useGetListedIPOsQuery()
    const { data: smeData } = useGetSMEIPOsQuery()

    const [syncScraper] = useSyncScrapedDataMutation()
    const [syncGMP] = useSyncGMPDataMutation()
    const [isSyncing, setIsSyncing] = useState(false)

    const handleManualSync = async () => {
        setIsSyncing(true)
        const toastId = toast.loading("Syncing IPO and GMP data...")
        try {
            const [scraperResult, gmpResult] = await Promise.all([
                syncScraper(10).unwrap(),
                syncGMP().unwrap()
            ])
            toast.success(`Sync successful! Updated IPOs and GMP.`, { id: toastId })
        } catch (error: any) {
            toast.error(`Sync failed: ${error?.data?.message || error.message || "Unknown error"}`, { id: toastId })
        } finally {
            setIsSyncing(false)
        }
    }

    // --- Data Aggregation Helpers ---
    const mainboards = Array.isArray(mainboardData) ? mainboardData : (mainboardData as any)?.data || []
    const listed = Array.isArray(listedData) ? listedData : (listedData as any)?.data || []
    const sme = Array.isArray(smeData) ? smeData : (smeData as any)?.data || []
    const allIPOs = [...mainboards, ...listed, ...sme];

    // Helper to calculate stats for a subset of IPOs
    const calculateStats = (ipos: any[]) => {
        const active = ipos.filter((ipo: any) => ipo.status === "OPEN" || ipo.status === "UPCOMING");
        const upcoming = ipos.filter((ipo: any) => ipo.status === "UPCOMING");

        const iposWithGmp = active.filter((ipo: any) =>
            ipo.gmp && (Array.isArray(ipo.gmp) ? ipo.gmp.length > 0 : typeof ipo.gmp === 'number')
        );

        let totalGmp = 0;
        let highestGmpVal = 0;
        let highestGmpName = "";

        iposWithGmp.forEach((ipo: any) => {
            let val = 0;
            if (Array.isArray(ipo.gmp)) val = ipo.gmp[ipo.gmp.length - 1]?.price || 0;
            else val = ipo.gmp || 0;

            totalGmp += val;
            if (val > highestGmpVal) {
                highestGmpVal = val;
                highestGmpName = ipo.companyName;
            }
        });

        const avgGMP = iposWithGmp.length > 0 ? totalGmp / iposWithGmp.length : 0;

        return { active, upcoming, avgGMP, highestGmpVal, highestGmpName };
    }

    // 1. Overall Stats
    const overallStats = calculateStats(allIPOs);

    // 2. Mainboard Stats
    const mainboardStats = calculateStats(mainboards);

    // 3. SME Stats
    const smeStats = calculateStats(sme);


    // Helper for Subscription Data
    const getSubChartData = (activeIpos: any[]) => {
        return activeIpos
            .filter((ipo: any) => ipo.subscription && (ipo.subscription.total > 0))
            .map((ipo: any) => ({
                name: ipo.companyName.substring(0, 10) + '...',
                qib: ipo.subscription?.qib || 0,
                nii: ipo.subscription?.nii || 0,
                retail: ipo.subscription?.retail || 0
            }))
            .slice(0, 5);
    }

    // Helper for Top Listed Data
    const getTopGmpList = (activeIpos: any[]) => {
        return activeIpos.filter((ipo: any) =>
            ipo.gmp && (Array.isArray(ipo.gmp) ? ipo.gmp.length > 0 : typeof ipo.gmp === 'number')
        ).map((ipo: any) => {
            let val = 0;
            if (Array.isArray(ipo.gmp)) val = ipo.gmp[ipo.gmp.length - 1]?.price || 0;
            else val = ipo.gmp || 0;

            const price = ipo.max_price || ipo.price || 100;

            return {
                name: ipo.companyName,
                gmp: val,
                price: price,
                type: ipo.ipoType || (mainboards.find((m: any) => m._id === ipo._id) ? 'MAINBOARD' : 'SME'),
                status: ipo.status
            }
        }).sort((a: any, b: any) => b.gmp - a.gmp).slice(0, 5);
    }

    // Recent Listing Data (Common)
    const recentListingData = allIPOs
        .filter((ipo: any) => ipo.status === 'LISTED')
        .slice(0, 10).map((ipo: any) => {
            let gmpVal = 0;
            if (Array.isArray(ipo.gmp)) gmpVal = ipo.gmp[ipo.gmp.length - 1]?.price || 0;
            else gmpVal = ipo.gmp || 0;

            return {
                name: ipo.companyName.substring(0, 10),
                gain: gmpVal * (ipo.lot_size || 0)
            }
        });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Sync Data' : 'Sync Data'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="mainboard">Mainboard</TabsTrigger>
                    <TabsTrigger value="sme">SME</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <DetailedStats
                        mainboardCount={mainboards.length}
                        smeCount={sme.length}
                        activeCount={overallStats.active.length}
                        avgGMP={overallStats.avgGMP}
                        highestGMP={overallStats.highestGmpVal}
                        highestGMPCompany={overallStats.highestGmpName}
                    />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4">
                            <RecentListingsChart data={recentListingData} />
                        </div>
                        <div className="col-span-3">
                            <ActivityFeed ipos={overallStats.active} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="mainboard" className="space-y-4">
                    <CategoryStats
                        title="Mainboard"
                        activeCount={mainboardStats.active.length}
                        upcomingCount={mainboardStats.upcoming.length}
                        avgGMP={mainboardStats.avgGMP}
                        highestGMP={mainboardStats.highestGmpVal}
                        highestGMPCompany={mainboardStats.highestGmpName}
                    />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <SubscriptionTrendChart data={getSubChartData(mainboardStats.active)} />
                        <TopGMPList data={getTopGmpList(mainboardStats.active)} />
                    </div>
                </TabsContent>

                <TabsContent value="sme" className="space-y-4">
                    <CategoryStats
                        title="SME"
                        activeCount={smeStats.active.length}
                        upcomingCount={smeStats.upcoming.length}
                        avgGMP={smeStats.avgGMP}
                        highestGMP={smeStats.highestGmpVal}
                        highestGMPCompany={smeStats.highestGmpName}
                    />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <SubscriptionTrendChart data={getSubChartData(smeStats.active)} />
                        <TopGMPList data={getTopGmpList(smeStats.active)} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
