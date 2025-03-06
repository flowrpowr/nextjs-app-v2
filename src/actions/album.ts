"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { UTApi } from "uploadthing/server";

// Initialize the Uploadthing API
const utapi = new UTApi();

export async function createAlbum(formData: FormData) {
    try {
        // Get user session
        const session = await auth();
        if (!session || !session.user || !session.user.id) {
            throw new Error("Unauthorized");
        }

        const userId = session.user.id;

        // Get form values
        const albumTitle = formData.get("albumTitle") as string;
        const genre = formData.get("genre") as string;
        const albumCover = formData.get("albumCover") as File;
        const songCount = parseInt(formData.get("songCount") as string);

        // Check if required data is present
        if (!albumTitle || !genre || !albumCover || songCount <= 0) {
            throw new Error("Missing required album information");
        }

        // Validate file type for album cover
        if (!albumCover.type.startsWith("image/")) {
            throw new Error("Album cover must be an image file");
        }

        // Upload album cover using Uploadthing
        const albumCoverUpload = await utapi.uploadFiles([albumCover]);
        if (!albumCoverUpload[0]?.data?.ufsUrl) {
            throw new Error("Failed to upload album cover");
        }

        // Create album record in database
        const album = await prisma.album.create({
            data: {
                title: albumTitle,
                artistId: userId,
                image: albumCoverUpload[0]?.data?.ufsUrl,
                releaseDate: new Date(),
            },
        });

        // Process each song
        for (let i = 0; i < songCount; i++) {
            const songTitle = formData.get(`songTitle${i}`) as string;
            const songFile = formData.get(`songFile${i}`) as File;

            if (!songTitle || !songFile) {
                console.warn(`Missing data for song ${i}`);
                continue;
            }

            // Validate file type for song
            if (!songFile.type.startsWith("audio/")) {
                console.warn(`File for song ${i} is not an audio file`);
                continue;
            }

            // Upload song file using Uploadthing
            const songUpload = await utapi.uploadFiles([songFile]);
            if (!songUpload[0]?.data?.ufsUrl) {
                console.warn(`Failed to upload song file ${i}`);
                continue;
            }

            // Create song record
            await prisma.song.create({
                data: {
                    title: songTitle,
                    duration: 180, // Default duration
                    albumId: album.id,
                    artistId: userId,
                    url: songUpload[0].data.ufsUrl,
                },
            });
        }

        // Revalidate the discography page
        revalidatePath("/dashboard/discography");

        // Return success
        return { success: true };
    } catch (error) {
        console.error("Error creating album:", error);
        throw new Error("Failed to create album. Please try again.");
    }
}
