// actions/playlist.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const createPlaylistSchema = z.object({
    name: z.string().min(1, "Playlist name is required"),
});

export async function createPlaylist(formData: FormData) {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    // Validate form input
    const result = createPlaylistSchema.safeParse({
        name: formData.get("name"),
    });

    if (!result.success) {
        return { error: result.error.format() };
    }

    try {
        // Create the playlist in the database
        const newPlaylist = await prisma.playlist.create({
            data: {
                name: result.data.name,
                userId: session.user.id!,
            },
        });

        // Revalidate the dashboard layout to refresh the sidebar with playlists
        revalidatePath("/dashboard");

        return { success: true, playlist: newPlaylist };
    } catch (error) {
        console.error("Failed to create playlist:", error);
        return { error: "Failed to create playlist" };
    }
}
