// app/dashboard/layout.jsx
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import DashboardLayoutClient from "./dashboard-layout-client";

async function getPlaylists() {
    const session = await auth();

    if (!session?.user?.id) {
        return [];
    }

    try {
        const playlists = await prisma.playlist.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return playlists;
    } catch (error) {
        console.error("Failed to fetch playlists:", error);
        return [];
    }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const playlists = await getPlaylists();

    return <DashboardLayoutClient playlists={playlists}>{children}</DashboardLayoutClient>;
}
