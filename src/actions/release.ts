"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { UTApi } from "uploadthing/server";

// Initialize the Uploadthing API
const utapi = new UTApi();

export async function createRelease(formData: FormData) {
  try {
    // Get user session
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Get form values
    const releaseTitle = formData.get("releaseTitle") as string;
    const releaseType = formData.get("releaseType") as
      | "SINGLE"
      | "EP"
      | "LP"
      | "COMPILATION"
      | "MIXTAPE";
    const genre = formData.get("genre") as string;
    const coverImage = formData.get("coverUrl") as File;
    const trackCount = parseInt(formData.get("trackCount") as string);

    // Check if required data is present
    if (
      !releaseTitle ||
      !releaseType ||
      !genre ||
      !coverImage ||
      trackCount <= 0
    ) {
      throw new Error("Missing required release information");
    }

    // Validate file type for cover image
    if (!coverImage.type.startsWith("image/")) {
      throw new Error("Cover image must be an image file");
    }

    // Upload cover image using Uploadthing
    const coverImageUpload = await utapi.uploadFiles([coverImage]);
    if (!coverImageUpload[0]?.data?.url) {
      throw new Error("Failed to upload cover image");
    }

    // Create release record in database
    const release = await prisma.release.create({
      data: {
        id: crypto.randomUUID(), // Generate a unique ID
        title: releaseTitle,
        type: releaseType,
        description: "", // Optional field
        artistId: userId,
        coverUrl: coverImageUpload[0].data.url,
        releaseDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Process each track
    for (let i = 0; i < trackCount; i++) {
      const trackTitle = formData.get(`trackTitle${i}`) as string;
      const trackFile = formData.get(`trackFile${i}`) as File;

      if (!trackTitle || !trackFile) {
        console.warn(`Missing data for track ${i}`);
        continue;
      }

      // Validate file type for track
      if (!trackFile.type.startsWith("audio/")) {
        console.warn(`File for track ${i} is not an audio file`);
        continue;
      }

      // Upload track file using Uploadthing
      const trackUpload = await utapi.uploadFiles([trackFile]);
      if (!trackUpload[0]?.data?.url) {
        console.warn(`Failed to upload track file ${i}`);
        continue;
      }

      // Create track record
      await prisma.track.create({
        data: {
          id: crypto.randomUUID(), // Generate a unique ID
          title: trackTitle,
          artistId: userId,
          genre: genre,
          coverUrl: release.coverUrl, // Use the release cover
          mimeType: trackFile.type,
          fileSize: trackFile.size,
          duration: 0, // This should be calculated from the audio file
          releaseId: release.id,
          trackNumber: i + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Revalidate the discography page
    revalidatePath("/dashboard/discography");

    // Return success
    return { success: true };
  } catch (error) {
    console.error("Error creating release:", error);
    throw new Error("Failed to create release. Please try again.");
  }
}
