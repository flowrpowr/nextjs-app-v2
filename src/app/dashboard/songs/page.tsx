import { Suspense } from "react";
import { prisma } from "@/prisma";
import { SongsList } from "@/components/songs-list";
import { auth } from "@/auth"; // Import auth for getting the user session

export const metadata = {
    title: "My Songs | Music App",
    description: "Browse and play your favorite songs",
};

async function getUserSongs() {
    const session = await auth();

    if (!session || !session.user?.id) {
        return [];
    }

    // Get songs from userSongs relation for the current user
    const userSongs = await prisma.userSong.findMany({
        where: {
            userId: session.user.id,
        },
        include: {
            song: {
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
                        },
                    },
                },
            },
        },
    });

    // Transform to match the expected songs format
    return userSongs.map((userSong) => userSong.song);
}

export default async function SongsPage() {
    const songs = await getUserSongs();

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-3xl font-bold tracking-tight">Songs</h1>
            </div>

            <Suspense fallback={<SongsLoading />}>
                <SongsList songs={songs} title="My Songs" />
            </Suspense>
        </div>
    );
}

function SongsLoading() {
    return (
        <div className="space-y-4">
            {Array(5)
                .fill(0)
                .map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-md animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-md"></div>
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                        <div className="w-24 h-8 bg-muted rounded-md"></div>
                    </div>
                ))}
        </div>
    );
}
