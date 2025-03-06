import { prisma } from "@/prisma";
import { Album } from "@/components/album";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAlbums() {
    try {
        const albums = await prisma.album.findMany({
            include: {
                artist: {
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

        return albums;
    } catch (error) {
        console.error("Error fetching albums:", error);
        return [];
    }
}

export default async function AlbumsPage() {
    const albums = await getAlbums();

    if (albums.length === 0) {
        return <div className="flex items-center justify-center h-64 text-gray-500">No albums available.</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">Discover</h1>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {albums.map((album) => (
                    <Album key={album.id} album={album} />
                ))}
            </div>
        </div>
    );
}
