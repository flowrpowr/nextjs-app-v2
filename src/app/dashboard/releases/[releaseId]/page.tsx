import { prisma } from "@/prisma";
import { Release } from "@/components/release";
import { Tracks } from "@/components/tracks";
import { auth } from "@/auth";
import Image from "next/image";

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
        select: {
          id: true,
          title: true,
          artistId: true,
          genre: true,
          mimeType: true,
          fileSize: true,
          duration: true,
          suiId: true,
          trackNumber: true,
          // Include the users who like each track to check if current user is among them
          usersWhoLike: true
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
      duration: track.duration!,
      trackNumber: track.trackNumber!,
      suiId: track.suiId,
      // Check if the current user has liked this track
      liked: userId ? track.usersWhoLike.length > 0 : false,
    })).sort((a, b) => a.trackNumber - b.trackNumber),
  };

  return release;
}

export default async function ReleasePage({ params }: ReleasePageProps) {
  const data = await getRelease(params.releaseId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header section with image and title */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <Image
          src={data.release.coverUrl || "/api/placeholder/500/500"}
          alt={`Cover art for ${data.release.title}`}
          width={200}
          height={200}
          className="object-cover shadow-md"
          priority
        />
        <div className="flex flex-col justify-end">
          <h1 className="text-3xl md:text-4xl font-bold">
            {data.release.title}
          </h1>
          {data.release.artistName && (
            <p className="text-lg text-gray-600 mt-2">
              {data.release.artistName}
            </p>
          )}
        </div>
      </div>

      {/* Track list section */}
      <div className="mt-4">
        <Tracks showCover={false} showArtist={false} tracks={data.tracks} />
      </div>
    </div>
  );
}
