"use server";

import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function likeTrack(trackId: string) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return {
                success: false,
                error: "You must be logged in to add tracks to your library",
            };
        }

        const userId = session.user.id!;

        // Add the track to user's liked tracks
        await prisma.user.update({
            where: { id: userId },
            data: {
                likedTracks: {
                    connect: { id: trackId },
                },
            },
        });

        // Revalidate any paths that show the user's library
        revalidatePath("/library");
        revalidatePath("/");

        return { success: true, message: "Track added to your library" };
    } catch (error) {
        console.error("Error adding track to library:", error);
        return { success: false, error: "Failed to add track to your library" };
    }
}

export async function unlikeTrack(trackId: string) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return {
                success: false,
                error: "You must be logged in to remove tracks from your library",
            };
        }

        const userId = session.user.id!;

        // Remove the track from user's liked tracks
        await prisma.user.update({
            where: { id: userId },
            data: {
                likedTracks: {
                    disconnect: { id: trackId },
                },
            },
        });

        // Revalidate any paths that show the user's library
        revalidatePath("/library");
        revalidatePath("/");

        return { success: true, message: "Track removed from your library" };
    } catch (error) {
        console.error("Error removing track from library:", error);
        return {
            success: false,
            error: "Failed to remove track from your library",
        };
    }
}
