export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL || "http://localhost:11111";

/**
 * Route handler for streaming a track
 * This endpoint forwards the request to the backend stream service
 * and returns a signed URL for the client to use for playback
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Authenticate user - uncomment when ready to implement authentication

    // Get trackId and listenerAddress from query params
    const { searchParams } = new URL(request.url);
    const trackId = searchParams.get("trackId");
    const listenerAddress = searchParams.get("listenerAddress");

    if (!trackId || !listenerAddress) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Forward to backend stream service
    const response = await fetch(
      `${backendUrl}/stream?trackId=${trackId}&listenerAddress=${listenerAddress}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Error streaming track",
        },
        { status: response.status }
      );
    }

    // Return the stream data with signed URL
    const streamData = await response.json();
    return NextResponse.json(streamData);
  } catch (error) {
    console.error("Stream error:", error);
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
