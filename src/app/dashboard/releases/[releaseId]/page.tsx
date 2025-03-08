import { prisma } from "@/prisma";
import { Release } from "@/components/release";
import { Tracks } from "@/components/tracks";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

interface ReleasePageProps {
    params: {
        releaseId: string;
    };
}

async function getRelease(releaseId: string) {
    // Get the current user session
    const session = await auth();
    const userId = session?.user?.id;

    const releaseRaw = await prisma.release.findUniqueOrThrow({
        where: {
            id: releaseId,
        },
        include: {
            Artist: {
                select: {
                    id: true,
                    name: true,
                },
            },
            Track: {
                include: {
                    // Include the users who like each track to check if current user is among them
                    usersWhoLike: userId
                        ? {
                              where: {
                                  id: userId,
                              },
                              select: {
                                  id: true,
                              },
                          }
                        : false,
                },
            },
        },
    });

    const release = {
        release: {
            id: releaseRaw.id,
            title: releaseRaw.title,
            artistName: releaseRaw.Artist.name,
            coverUrl: releaseRaw.coverUrl,
            releaseDate: releaseRaw.releaseDate,
        },
        tracks: releaseRaw.Track.map((track) => ({
            id: track.id,
            title: track.title,
            coverUrl: releaseRaw.coverUrl!,
            artistName: releaseRaw.Artist.name,
            artistId: releaseRaw.artistId,
            audioUrl: track.audioUrl!,
            duration: track.duration!,
            trackNumber: track.trackNumber!,
            // Check if the current user has liked this track
            liked: userId ? track.usersWhoLike.length > 0 : false,
        })).sort((a, b) => a.trackNumber - b.trackNumber),
    };

    return release;
}

export default async function ReleasePage({ params }: ReleasePageProps) {
    const data = await getRelease(params.releaseId);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{data.release.title}</h1>
            <Tracks showCover={false} showArtist={false} tracks={data.tracks} />
        </div>
    );
}
