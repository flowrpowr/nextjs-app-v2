"use server";

import { prisma } from "@/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addUserSong(songId: string) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return { success: false, error: "You must be logged in to add songs to your library" };
        }

        const userId = session.user.id!;

        // Check if the relationship already exists
        const existingUserSong = await prisma.userSong.findUnique({
            where: {
                userId_songId: {
                    userId,
                    songId,
                },
            },
        });

        if (existingUserSong) {
            // If it exists, we can return early or optionally remove it
            return { success: true, message: "Song is already in your library" };
        }

        // Create the UserSong relationship
        await prisma.userSong.create({
            data: {
                userId,
                songId,
            },
        });

        // Revalidate any paths that show the user's library
        revalidatePath("/library");
        revalidatePath("/");

        return { success: true, message: "Song added to your library" };
    } catch (error) {
        console.error("Error adding song to library:", error);
        return { success: false, error: "Failed to add song to your library" };
    }
}

export async function removeUserSong(songId: string) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return { success: false, error: "You must be logged in to remove songs from your library" };
        }

        const userId = session.user.id!;

        // Delete the UserSong relationship
        await prisma.userSong.delete({
            where: {
                userId_songId: {
                    userId,
                    songId,
                },
            },
        });

        // Revalidate any paths that show the user's library
        revalidatePath("/library");
        revalidatePath("/");

        return { success: true, message: "Song removed from your library" };
    } catch (error) {
        console.error("Error removing song from library:", error);
        return { success: false, error: "Failed to remove song from your library" };
    }
}
