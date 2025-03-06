import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DiscographyPage() {
    return (
        <div className="mb-5 flex justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Discography</h1>
            <Button variant="outline" asChild>
                <Link href="/dashboard/discography/create" className="py-6">
                    Create
                    <Plus size="4" />
                </Link>
            </Button>
        </div>
    );
}
