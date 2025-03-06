import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Props interface
interface AlbumCardProps {
    album: {
        id: string;
        title: string;
        artist: {
            name: string;
        };
        image?: string;
        releaseDate?: string;
    };
    href?: string;
}

export function Album({ album, href }: AlbumCardProps) {
    const { title, artist, image, id, releaseDate } = album;
    const albumLink = href || `/dashboard/albums/${id}`;
    const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString() : "Unknown";

    return (
        <Link href={albumLink} className="block" aria-label={`View album ${title} by ${artist.name}`}>
            <Card className="overflow-hidden ">
                <div className="relative aspect-square w-full">
                    <Image
                        src={image || "/api/placeholder/400/400"}
                        alt={`${title} album cover`}
                        fill
                        className="object-cover rounded-t-lg"
                        priority
                    />
                </div>

                <CardHeader>
                    <CardTitle className="line-clamp-1">{title}</CardTitle>
                    <CardDescription>{artist.name}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}
