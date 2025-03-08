import { prisma } from "@/prisma";
import { Release } from "@/components/release";

export const dynamic = "force-dynamic";

async function getReleases() {
    const releasesRaw = await prisma.release.findMany({
        include: {
            Artist: {
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
    const releases = releasesRaw.map((releaseRaw) => {
        return {
            id: releaseRaw.id!,
            title: releaseRaw.title!,
            artistName: releaseRaw.Artist.name!,
            coverUrl: releaseRaw.coverUrl!,
            releaseDate: releaseRaw.releaseDate!,
        };
    });
    return releases;
}

export default async function DiscoverPage() {
    const releases = await getReleases();

    return (
        <div className="container">
            <h1 className="text-2xl font-bold mb-6">Discover</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {releases.map((release) => (
                    <Release key={release.id} {...release} />
                ))}
            </div>
        </div>
    );
}
