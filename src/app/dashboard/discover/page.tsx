// /discover/page.tsx
import { prisma } from "@/prisma";
import { Release } from "@/components/release";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Update function to accept search parameter
async function getReleases(search?: string) {
    const releasesRaw = await prisma.release.findMany({
        where: search
            ? {
                  title: {
                      contains: search,
                      mode: "insensitive", // Case-insensitive search
                  },
              }
            : undefined,
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

// Create a search form component
function SearchForm({ initialSearch }: { initialSearch?: string }) {
    return (
        <form className="flex w-full max-w-md items-center space-x-2 mb-6">
            <Input
                placeholder="Search releases..."
                name="search"
                defaultValue={initialSearch || ""}
                className="flex-1"
            />
            <Button type="submit">Search</Button>
        </form>
    );
}

// Update page component to use search parameters
export default async function DiscoverPage({ searchParams }: { searchParams?: { search?: string } }) {
    const search = searchParams?.search || "";
    const releases = await getReleases(search);

    return (
        <div className="container">
            <h1 className="text-2xl font-bold mb-6">Discover</h1>

            <SearchForm initialSearch={search} />

            {search && (
                <p className="mb-4">
                    {releases.length} results for "{search}"
                    {releases.length === 0 && (
                        <Button variant="link" asChild className="ml-2">
                            <Link href="/discover">Clear search</Link>
                        </Button>
                    )}
                </p>
            )}

            {releases.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {releases.map((release) => (
                        <Release key={release.id} {...release} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-lg text-gray-500">No releases found{search ? ` matching "${search}"` : ""}.</p>
                </div>
            )}
        </div>
    );
}
