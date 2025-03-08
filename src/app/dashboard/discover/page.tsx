import { prisma } from "@/prisma";
import { Album } from "@/components/album";

export const dynamic = "force-dynamic";

async function getReleases() {
  try {
    const releases = await prisma.release.findMany({
      include: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        releaseDate: "desc",
      },
    });

    return releases;
  } catch (error) {
    console.error("Error fetching releases:", error);
    return [];
  }
}

export default async function DiscoverPage() {
  const releases = await getReleases();

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Discover New Music</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {releases.map((release) => (
          <Album
            key={release.id}
            album={{
              id: release.id,
              title: release.title,
              artist: {
                name: release.User.name,
              },
              image: release.coverUrl || undefined,
              releaseDate: release.releaseDate.toISOString(),
            }}
          />
        ))}
      </div>
    </div>
  );
}
