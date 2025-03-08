import { Suspense } from "react";
import { prisma } from "@/prisma";
import { TracksList } from "@/components/trackList";
import { auth } from "@/auth"; // Import auth for getting the user session

export const metadata = {
  title: "Your released Tracks",
  description: "Browse and play your released tracks",
};

async function getReleasedTracks() {
  const session = await auth();

  if (!session || !session.user?.id) {
    return [];
  }

  // Get released tracks by the user
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      releasedTracks: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          artist: {
            select: {
              id: true,
              name: true,
            },
          },
          Release: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
            },
          },
        },
      },
    },
  });

  return user?.releasedTracks || [];
}

export default async function TracksPage() {
  const tracks = await getReleasedTracks();

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Your Released Tracks</h1>
      <Suspense fallback={<div>Loading tracks...</div>}>
        <TracksList tracks={tracks} />
      </Suspense>
    </div>
  );
}

function TracksLoading() {
  return (
    <div className="space-y-4">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-md animate-pulse"
          >
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
