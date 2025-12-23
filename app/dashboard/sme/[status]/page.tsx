import { IPOStatusList } from "@/components/ipo-status-list"

export default async function SMEStatusPage({ params }: { params: Promise<{ status: string }> }) {
    const { status } = await params;
    return (
        <div className="container mx-auto py-10">
            <IPOStatusList status={status} ipoType="SME" />
        </div>
    )
}
