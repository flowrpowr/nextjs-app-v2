import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Props interface
interface ReleaseProps {
    id: string;
    title: string;
    artistName: string;
    coverUrl: string;
    releaseDate: Date;
}

export function Release({ id, title, artistName, coverUrl, releaseDate }: ReleaseProps) {
    const releaseLink = `/dashboard/releases/${id}`;

    return (
        <Link href={releaseLink} className="block" aria-label={`View release ${title} by ${artistName}`}>
            <Card className="overflow-hidden">
                <div className="relative aspect-square w-full">
                    <Image
                        src={coverUrl || "/api/placeholder/400/400"}
                        alt={`${title} release cover`}
                        fill
                        className="object-cover rounded-t-lg"
                        priority
                    />
                </div>

                <CardHeader>
                    <CardTitle className="line-clamp-1">{title}</CardTitle>
                    <CardDescription>{artistName}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}
