"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
export type ReleaseUploadData = {
  releaseType: string;
  release_title: string;
  artistId: string;
  cover_art: string; // Base64 encoded image string
  genre: string;
  description: string;
  release_date: string; // ISO format date string
  image_metadata: {
    mimeType: string;
    fileSize: number;
  };
};

export type TrackUploadData = {
  releaseId: string;
  coverUrl: string;
  title: string;
  trackNumber: number;
  genre: string;
  artistId: string;
  audio: string; // Base64 encoded
  audioMetadata: {
    mimeType: string;
    fileSize: number;
    duration: number;
  };
};

type TrackData = {
  title: string;
  audioFile: File | null;
  duration: number;
};

type UploadStatus = {
  type: "release" | "track";
  trackNumber?: number;
  status: "pending" | "uploading" | "success" | "error";
  message?: string;
  progress: number;
};

export default function UploadPage() {
  //userid
  const { data: session } = useSession();
  console.log("session:\n", session);
  const artistId = session?.user?.id || "";
  // Release form state
  const [releaseTitle, setReleaseTitle] = useState("");
  const [releaseType, setReleaseType] = useState("SINGLE");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);

  // Tracks state
  const [tracks, setTracks] = useState<TrackData[]>([
    { title: "", audioFile: null, duration: 0 },
  ]);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  // Response and error state
  const [response, setResponse] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverArtFile(file);
  };
  //get session user ID for artist
  const handleAudioChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a new copy of tracks with the updated track
    const newTracks = [...tracks];
    newTracks[index] = {
      ...newTracks[index],
      audioFile: file,
    };
    setTracks(newTracks);

    // Get audio duration
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);

    audio.onloadedmetadata = () => {
      // It's important to use the latest state here
      setTracks((currentTracks) => {
        const updatedTracks = [...currentTracks];
        updatedTracks[index] = {
          ...updatedTracks[index],
          duration: audio.duration,
          audioFile: file, // Make sure file is still referenced here
        };
        return updatedTracks;
      });
      URL.revokeObjectURL(audioUrl);
    };
  };

  const addTrack = () => {
    setTracks([...tracks, { title: "", audioFile: null, duration: 0 }]);
  };

  const removeTrack = (index: number) => {
    if (tracks.length === 1) {
      // Don't remove the last track, just reset it
      setTracks([{ title: "", audioFile: null, duration: 0 }]);
      return;
    }

    const newTracks = [...tracks];
    newTracks.splice(index, 1);
    setTracks(newTracks);
  };

  const updateTrackTitle = (index: number, title: string) => {
    const newTracks = [...tracks];
    newTracks[index] = { ...newTracks[index], title };
    setTracks(newTracks);
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          // Remove the prefix (e.g., "data:image/jpeg;base64,")
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const validateForm = () => {
    // Debug log
    console.log("Validating form with tracks:", tracks);

    if (
      !releaseTitle ||
      !releaseType ||
      !genre ||
      !artistId ||
      !releaseDate ||
      !coverArtFile
    ) {
      setError("Please fill all required release fields");
      return false;
    }

    // Validate each track
    for (let i = 0; i < tracks.length; i++) {
      if (!tracks[i].title || !tracks[i].audioFile) {
        setError(`Please fill all required fields for Track ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const uploadRelease = async (): Promise<{
    success: boolean;
    releaseId?: string;
    coverUrl?: string;
  }> => {
    try {
      // Update status
      setUploadStatuses((prev) => [
        ...prev,
        {
          type: "release",
          status: "uploading",
          progress: 0,
        },
      ]);

      // Convert cover art to base64
      const coverArtBase64 = await fileToBase64(coverArtFile!);

      // Prepare release data
      const releaseData: ReleaseUploadData = {
        releaseType,
        release_title: releaseTitle,
        artistId,
        cover_art: coverArtBase64,
        genre,
        description,
        release_date: new Date(releaseDate).toISOString(),
        image_metadata: {
          mimeType: coverArtFile!.type,
          fileSize: coverArtFile!.size,
        },
      };

      // Update progress
      updateReleaseStatus("uploading", 50);

      // Send request
      const response = await fetch("/api/upload/release", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(releaseData),
      });

      // Handle response
      const result = await response.json();

      if (!response.ok) {
        updateReleaseStatus(
          "error",
          100,
          result.error || "Failed to upload release"
        );
        return { success: false };
      }

      updateReleaseStatus("success", 100, "Release created successfully");

      // Return success with release ID and cover URL
      return {
        success: true,
        releaseId: result.data.releaseId || result.data.id,
        coverUrl: result.data.coverUrl,
      };
    } catch (error) {
      updateReleaseStatus(
        "error",
        100,
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      return { success: false };
    }
  };

  const uploadTrack = async (
    trackData: TrackData,
    trackNumber: number,
    releaseId: string,
    coverUrl: string
  ): Promise<boolean> => {
    try {
      // Debug log
      console.log(`Uploading track ${trackNumber}:`, trackData);

      if (!trackData.audioFile) {
        console.error(`Track ${trackNumber} has no audio file`);
        updateTrackStatus(
          trackNumber,
          "error",
          100,
          `Track ${trackNumber} has no audio file`
        );
        return false;
      }

      // Update status
      setUploadStatuses((prev) => [
        ...prev,
        {
          type: "track",
          trackNumber,
          status: "uploading",
          progress: 0,
        },
      ]);

      // Convert audio to base64
      const audioBase64 = await fileToBase64(trackData.audioFile);

      // Prepare track data
      const trackUploadData: TrackUploadData = {
        releaseId,
        coverUrl,
        title: trackData.title,
        trackNumber,
        genre,
        artistId,
        audio: audioBase64,
        audioMetadata: {
          mimeType: trackData.audioFile.type,
          fileSize: trackData.audioFile.size,
          duration: trackData.duration,
        },
      };

      // Update progress
      updateTrackStatus(trackNumber, "uploading", 50);

      // Send request
      const response = await fetch("/api/upload/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackUploadData),
      });

      // Handle response
      const result = await response.json();

      if (!response.ok) {
        updateTrackStatus(
          trackNumber,
          "error",
          100,
          result.error || `Failed to upload track ${trackNumber}`
        );
        return false;
      }

      updateTrackStatus(
        trackNumber,
        "success",
        100,
        `Track ${trackNumber} uploaded successfully`
      );
      return result.data;
    } catch (error) {
      updateTrackStatus(
        trackNumber,
        "error",
        100,
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      return false;
    }
  };

  const updateReleaseStatus = (
    status: "pending" | "uploading" | "success" | "error",
    progress: number,
    message?: string
  ) => {
    setUploadStatuses((prev) => {
      const index = prev.findIndex((s) => s.type === "release");
      if (index >= 0) {
        const newStatuses = [...prev];
        newStatuses[index] = {
          ...newStatuses[index],
          status,
          progress,
          message,
        };
        return newStatuses;
      }
      return prev;
    });
  };

  const updateTrackStatus = (
    trackNumber: number,
    status: "pending" | "uploading" | "success" | "error",
    progress: number,
    message?: string
  ) => {
    setUploadStatuses((prev) => {
      const index = prev.findIndex(
        (s) => s.type === "track" && s.trackNumber === trackNumber
      );
      if (index >= 0) {
        const newStatuses = [...prev];
        newStatuses[index] = {
          ...newStatuses[index],
          status,
          progress,
          message,
        };
        return newStatuses;
      }
      return prev;
    });
  };

  const calculateOverallProgress = () => {
    if (uploadStatuses.length === 0) return 0;

    const totalItems = tracks.length + 1; // Tracks + Release
    const completedItems = uploadStatuses.filter(
      (s) => s.progress === 100
    ).length;
    const inProgressItems = uploadStatuses.filter(
      (s) => s.progress > 0 && s.progress < 100
    );

    const completedPercentage = (completedItems / totalItems) * 100;
    const progressPercentage = inProgressItems.reduce(
      (sum, item) => sum + item.progress / totalItems,
      0
    );

    return Math.min(Math.round(completedPercentage + progressPercentage), 99);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setUploadStatuses([]);

    if (!validateForm()) {
      return;
    }

    try {
      setIsUploading(true);

      // Debug log before upload
      console.log("Tracks to upload:", tracks);

      // Step 1: Upload the release
      const releaseResult = await uploadRelease();

      if (
        !releaseResult.success ||
        !releaseResult.releaseId ||
        !releaseResult.coverUrl
      ) {
        setError("Failed to create release");
        setIsUploading(false);
        return;
      }

      // Step 2: Upload each track
      const trackResults = [];
      for (let i = 0; i < tracks.length; i++) {
        const trackResult = await uploadTrack(
          tracks[i],
          i + 1,
          releaseResult.releaseId as string,
          releaseResult.coverUrl as string
        );
        trackResults.push(trackResult);

        // Update overall progress
        setOverallProgress(calculateOverallProgress());
      }

      // All uploads completed
      setOverallProgress(100);
      setResponse({
        success: true,
        releaseId: releaseResult.releaseId,
        tracksUploaded: trackResults,
        totalTracks: tracks.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Release</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Release Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Release Information</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="release-title">Release Title *</Label>
                    <Input
                      id="release-title"
                      value={releaseTitle}
                      onChange={(e) => setReleaseTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="release-type">Release Type *</Label>
                    <Select value={releaseType} onValueChange={setReleaseType}>
                      <SelectTrigger id="release-type">
                        <SelectValue placeholder="Select release type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="EP">EP</SelectItem>
                        <SelectItem value="LP">LP</SelectItem>
                        <SelectItem value="MIXTAPE">Mixtape</SelectItem>
                        <SelectItem value="COMPILATION">Compilation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="genre">Genre *</Label>
                    <Input
                      id="genre"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="release-date">Release Date *</Label>
                    <Input
                      id="release-date"
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cover-art">Cover Art *</Label>
                    <Input
                      id="cover-art"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverArtChange}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {coverArtFile && (
                    <div className="sm:col-span-2 flex justify-start mt-2">
                      <img
                        src={URL.createObjectURL(coverArtFile)}
                        alt="Cover preview"
                        className="h-40 w-40 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tracks Section */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Tracks</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTrack}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Track
                  </Button>
                </div>

                {tracks.map((track, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Track {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTrack(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor={`track-title-${index}`}>
                          Track Title *
                        </Label>
                        <Input
                          id={`track-title-${index}`}
                          value={track.title}
                          onChange={(e) =>
                            updateTrackTitle(index, e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor={`audio-file-${index}`}>
                          Audio File *
                        </Label>
                        <Input
                          id={`audio-file-${index}`}
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioChange(index, e)}
                          required={!track.audioFile}
                        />
                        {track.audioFile && (
                          <div className="text-sm mt-1">
                            <div className="text-green-600 font-medium">
                              File selected: {track.audioFile.name}
                            </div>
                            {track.duration > 0 && (
                              <div className="text-muted-foreground">
                                Duration: {Math.floor(track.duration / 60)}:
                                {Math.floor(track.duration % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Overall Progress</Label>
                      <span className="text-sm text-muted-foreground">
                        {overallProgress}%
                      </span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    {uploadStatuses.map((status, index) => (
                      <div key={index} className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>
                            {status.type === "release"
                              ? "Release"
                              : `Track ${status.trackNumber}`}
                            :
                            <span
                              className={
                                status.status === "success"
                                  ? "text-green-600 ml-2"
                                  : status.status === "error"
                                  ? "text-red-600 ml-2"
                                  : "text-blue-600 ml-2"
                              }
                            >
                              {status.status === "uploading"
                                ? "Uploading..."
                                : status.status}
                            </span>
                          </span>
                          <span>{status.progress}%</span>
                        </div>
                        {status.message && (
                          <p
                            className={
                              status.status === "error"
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }
                          >
                            {status.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <span className="flex items-center">
                    Uploading <Upload className="ml-2 h-4 w-4 animate-pulse" />
                  </span>
                ) : (
                  <span className="flex items-center">
                    Upload Release <Upload className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {response && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
              <p className="font-medium mb-2">Upload Complete!</p>
              <pre className="bg-slate-100 p-4 rounded-md overflow-auto text-sm text-slate-800">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
