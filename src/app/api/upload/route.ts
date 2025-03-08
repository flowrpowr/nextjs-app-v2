import { NextRequest, NextResponse } from "next/server";
//import { auth } from "@/auth";

/**
 *
 * Accepts multipart form data with:
 * - title: string
 * - release_type: "SINGLE" | "EP" | "LP" | "MIXTAPE" | "COMPILATION"
 * - genre: string
 * - uploader_sui_address: string (optional, will use user's wallet address if not provided)
 * - audio: File
 * - cover_art: File
 * - duration: number (in seconds)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    /*const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }*/

    // Parse the FormData
    const formData = await request.formData();

    // Extract form fields
    const title = formData.get("title") as string;
    const releaseType = formData.get("release_type") as string;
    const genre = formData.get("genre") as string;
    const uploaderSuiAddress = formData.get("uploader_sui_address") as string; //TODO: session.user.walletAddress
    const audioFile = formData.get("audio") as File;
    const coverArtFile = formData.get("cover_art") as File;
    const duration = Number(formData.get("duration")) || 0;

    // Validate required fields
    if (!title || !releaseType || !genre || !audioFile || !coverArtFile) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields for an upload",
        },
        { status: 400 }
      );
    }

    // Validate release type
    const validReleaseTypes = ["SINGLE", "EP", "LP", "MIXTAPE", "COMPILATION"];
    if (!validReleaseTypes.includes(releaseType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid release_type. Must be one of: ${validReleaseTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Convert files to buffers for backend processing
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const coverArtBuffer = Buffer.from(await coverArtFile.arrayBuffer());

    // Create metadata object
    const metadata = {
      audioMimeType: audioFile.type,
      audioFileSize: audioFile.size,
      audioDuration: duration,
      coverMimeType: coverArtFile.type,
      coverFileSize: coverArtFile.size,
    };

    // Prepare data for backend
    const uploadData = {
      title,
      release_type: releaseType,
      genre,
      uploader_sui_address: uploaderSuiAddress,
      audio: audioBuffer.toString("base64"), // Convert to base64 for JSON transport
      cover_art: coverArtBuffer.toString("base64"), // Convert to base64 for JSON transport
      metadata,
    };

    // TODO: Replace with your actual backend API endpoint
    const backendUrl = process.env.BACKEND_URL || "http://localhost:11111";

    // TEST
    console.log("made it to fetch!\n", uploadData);
    // Send to backend service
    const response = await fetch(`${backendUrl}/upload`, {
      method: "POST",
      // TODO: authenticate first...?
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(uploadData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Error uploading to backend",
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Upload successful",
      data: result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler to return upload form configuration (max file size, accepted formats, etc.)
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      maxAudioSize: 20 * 1024 * 1024, // 20MB
      maxCoverArtSize: 5 * 1024 * 1024, // 5MB
      acceptedAudioFormats: [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/flac",
      ],
      acceptedImageFormats: ["image/jpeg", "image/png", "image/webp"],
    },
  });
}
