import { NextRequest, NextResponse } from "next/server";
import { ReleaseUploadData } from "@/app/dashboard/upload/page";
//import { auth } from "@/auth";

const backendUrl = process.env.BACKEND_URL || "http://localhost:11111";

/**
 * Route handler for creating a release
 */
export async function POST(request: NextRequest) {
  console.log("--------------REACHED THE ROUTE.TS----------------");
  try {
    // TODO: authenticate
    // Authenticate user
    /*const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }*/

    // Parse the JSON body
    const releaseData: ReleaseUploadData = await request.json();

    // Forward to backend
    const response = await fetch(`${backendUrl}/upload/release`, {
      method: "POST",
      body: JSON.stringify(releaseData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || "Error creating release",
        },
        { status: response.status }
      );
    }

    // Return the release data
    const responseData = await response.json();
    return NextResponse.json({
      success: true,
      message: "Release created successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Release upload error:", error);
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
      maxCoverArtSize: 5 * 1024 * 1024, // 5MB
      acceptedImageFormats: ["image/jpeg", "image/png", "image/webp"],
    },
  });
}
