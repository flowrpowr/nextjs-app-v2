import { User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/prisma";
import { cn } from "@/lib/utils";
import { SongsList } from "@/components/songs-list";

interface PlaylistPageProps {
    params: {
        playlistId: string;
    };
}

// Define the type for a playlist with included relations

async function getPlaylist(playlistId: string) {
    const playlist = await prisma.playlist
        .findUnique({
            where: {
                id: playlistId,
            },
            include: {
                user: true,
                songs: {
                    include: {
                        song: {
                            include: {
                                artist: true,
                                album: true,
                            },
                        },
                    },
                },
            },
        })
        .catch((error) => {
            console.error("Failed to fetch playlist:", error);
            return null;
        });

    return playlist;
}

// Transform PlaylistSongs into the Song format expected by the SongsList component
function transformPlaylistSongs(playlist: Awaited<ReturnType<typeof getPlaylist>>) {
    return playlist?.songs.map(({ song }) => ({
        id: song.id,
        title: song.title,
        duration: song.duration,
        artistId: song.artistId,
        artist: song.artist,
        albumId: song.albumId,
        album: song.album,
        streams: song.streams,
    }));
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
    const playlist = await getPlaylist(params.playlistId);

    if (!playlist) {
        notFound();
    }

    // Transform playlist songs to the expected format
    const transformedSongs = transformPlaylistSongs(playlist);

    if (!transformedSongs) {
        notFound();
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div
                className={cn(
                    "flex flex-col md:flex-row items-start md:items-end gap-6",
                    "bg-gradient-to-b rounded-lg"
                )}
            >
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold">{playlist.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link
                            href={`/dashboard/profile/${playlist.userId}`}
                            className="flex items-center gap-1 hover:underline"
                        >
                            <User className="h-4 w-4" />
                            <span>{playlist.user.name || playlist.user.email}</span>
                        </Link>
                        <span>•</span>
                        <span>{playlist.songs.length} songs</span>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <SongsList songs={transformedSongs} title={playlist.name} />
            </div>
        </div>
    );
}
