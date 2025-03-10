import { Suspense } from "react";
import { prisma } from "@/prisma";
import { Tracks } from "@/components/tracks";
import { auth } from "@/auth"; // Import auth for getting the user session

export const metadata = {
  title: "Your liked tracks",
  description: "Browse and play your released tracks",
};

async function getLikedTracks() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return [];
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: session.user.id,
    },
    include: {
      likedTracks: {
        include: {
          artist: true,
          Release: true,
        },
      },
    },
  });

  const tracks = user.likedTracks.map((likedTrack) => {
    return {
      coverUrl: likedTrack.Release.coverUrl!,
      title: likedTrack.title,
      artistName: likedTrack.artist.name,
      artistId: likedTrack.artist.id,
      duration: likedTrack.duration!,
      id: likedTrack.id,
      liked: true,
    };
  });
  return tracks;
}

export default async function TracksPage() {
  const tracks = await getLikedTracks();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tracks</h1>
      <Suspense fallback={<div>Loading tracks...</div>}>
        <Tracks tracks={tracks} />
      </Suspense>
    </div>
  );
}
