import { ListedClient } from "@/components/listed-client"


export default function ListedPage() {
    return (
        <div className="container mx-auto py-10">
            <ListedClient initialData={[]} />
        </div>
    )
}
