import { NextRequest, NextResponse } from "next/server";
import { TrackUploadData } from "@/app/dashboard/upload/page";
//import { auth } from "@/auth";

const backendUrl = process.env.BACKEND_URL || "http://localhost:11111";

/**
 * Route handler for uploading a track
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: authenticate
    // Authenticate user

    // Parse the JSON body
    const trackData: TrackUploadData = await request.json();

    // Forward to backend
    const response = await fetch(`${backendUrl}/upload/track`, {
      method: "POST",
      body: JSON.stringify(trackData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.message ||
            `Error creating track ${trackData.trackNumber}: ${trackData.title}`,
        },
        { status: response.status }
      );
    }

    // Return the track data
    const responseData = await response.json();
    return NextResponse.json({
      success: true,
      message: `Track${trackData.trackNumber} created successfully`,
      data: responseData,
    });
  } catch (error) {
    console.error("Track upload error:", error);
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
 * GET handler to return upload form configuration
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      maxAudioSize: 20 * 1024 * 1024, // 20MB
      acceptedAudioFormats: [
        "audio/mpeg",
        "audio/wav",
        "audio/ogg",
        "audio/flac",
      ],
    },
  });
}
