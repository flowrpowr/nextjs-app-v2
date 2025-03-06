import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/prisma";
import { formatDate } from "@/lib/utils";
import { SongsList } from "@/components/songs-list";

interface AlbumPageProps {
    params: {
        albumId: string;
    };
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
    const album = await prisma.album.findUnique({
        where: { id: params.albumId },
        include: { artist: true },
    });

    if (!album) {
        return {
            title: "Album Not Found",
        };
    }

    return {
        title: `${album.title} - ${album.artist.name}`,
        description: `Listen to ${album.title} by ${album.artist.name}`,
    };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
    const album = await prisma.album.findUnique({
        where: { id: params.albumId },
        include: {
            artist: true,
            songs: {
                include: {
                    artist: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    album: {
                        select: {
                            id: true,
                            title: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });

    if (!album) {
        notFound();
    }

    return (
        <div className="container py-6 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <div className="shrink-0">
                    {album.image ? (
                        <Image
                            src={album.image}
                            alt={album.title}
                            width={300}
                            height={300}
                            className="rounded-md shadow-md"
                        />
                    ) : (
                        <div className="w-[300px] h-[300px] bg-muted rounded-md flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center md:items-start">
                    <h1 className="text-3xl font-bold">{album.title}</h1>
                    <p className="text-lg text-muted-foreground">{album.artist.name}</p>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4">Songs</h2>
                <SongsList songs={album.songs} />
            </div>
        </div>
    );
}

function calculateTotalDuration(songs: any[]): string {
    const totalSeconds = songs.reduce((total, song) => total + song.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
}
