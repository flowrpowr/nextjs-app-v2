"use client";
import Image from "next/image";
import { Play, Pause, Heart } from "lucide-react";
import { useAudio, type Track } from "@/context/audio";
import { formatTime } from "@/lib/utils";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { likeTrack, unlikeTrack } from "@/actions/track";
import { toast } from "sonner";

interface TracksProps {
    tracks: Track[];
    showCover?: boolean;
    showArtist?: boolean;
    className?: string;
}

export function Tracks({ tracks, showCover = true, showArtist = true, className = "" }: TracksProps) {
    const { queue, queueIndex, isPlaying, play, pause, togglePlayPause, setQueue } = useAudio();
    // Track loading states for like buttons
    const [loadingLikes, setLoadingLikes] = useState<Record<string, boolean>>({});

    // Check if a track is currently playing
    const isTrackPlaying = (track: Track) => {
        if (queue.length === 0 || queueIndex < 0 || queueIndex >= queue.length) {
            return false;
        }

        // Check if this track is the current track in the queue
        return queue[queueIndex].audioUrl === track.audioUrl;
    };

    // Handle track selection
    const handleTrackClick = (track: Track, index: number) => {
        // If this track is already playing, toggle play/pause
        if (isTrackPlaying(track)) {
            togglePlayPause();
            return;
        }

        // Set the queue to the current list of tracks and start playing from the selected index
        setQueue(tracks, index);

        // We don't need to call play() separately, as setQueue will handle that
    };

    // Handle like/unlike
    const handleLikeToggle = async (e: React.MouseEvent, track: Track) => {
        e.stopPropagation(); // Prevent the track click event from firing

        if (!track.id) {
            toast.error("Unable to like this track");
            return;
        }

        // Set loading state for this track
        setLoadingLikes((prev) => ({ ...prev, [track.id]: true }));

        try {
            if (track.liked) {
                // Unlike the track
                const result = await unlikeTrack(track.id);
                if (result.success) {
                    // Update the track in the local state
                    track.liked = false;
                    toast.success(result.message || "Track removed from your library");
                } else {
                    toast.error(result.error || "Failed to remove track from your library");
                }
            } else {
                // Like the track
                const result = await likeTrack(track.id);
                if (result.success) {
                    // Update the track in the local state
                    track.liked = true;
                    toast.success(result.message || "Track added to your library");
                } else {
                    toast.error(result.error || "Failed to add track to your library");
                }
            }
        } catch (error) {
            toast.error("An error occurred while updating your library");
            console.error(error);
        } finally {
            // Clear loading state for this track
            setLoadingLikes((prev) => ({ ...prev, [track.id]: false }));
        }
    };

    return (
        <div>
            <Table>
                <TableCaption>Track List</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        {showCover && <TableHead>Cover</TableHead>}
                        <TableHead>Title</TableHead>
                        {showArtist && <TableHead>Artist</TableHead>}
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead className="text-right">Like</TableHead>
                        <TableHead className="text-right">Play</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tracks.map((track, index) => (
                        <TableRow key={`${track.audioUrl}-${index}`} onClick={() => handleTrackClick(track, index)}>
                            <TableCell>
                                <span>{index + 1}</span>
                            </TableCell>

                            {showCover && (
                                <TableCell>
                                    <Image
                                        src={track.coverUrl || "/placeholder.svg?height=48&width=48"}
                                        alt={track.title}
                                        width={48}
                                        height={48}
                                        className="rounded-sm"
                                    />
                                </TableCell>
                            )}

                            <TableCell>{track.title}</TableCell>

                            {showArtist && <TableCell>{track.artistName}</TableCell>}

                            <TableCell className="text-right">{formatTime(track.duration)}</TableCell>

                            <TableCell className="text-right">
                                <button
                                    onClick={(e) => handleLikeToggle(e, track)}
                                    disabled={loadingLikes[track.id]}
                                    aria-label={track.liked ? "Unlike track" : "Like track"}
                                    className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Heart
                                        className={`w-4 h-4 ${
                                            track.liked ? "fill-red-500 text-red-500" : "text-gray-500"
                                        }`}
                                    />
                                </button>
                            </TableCell>

                            <TableCell className="text-right">
                                {isTrackPlaying(track) && isPlaying ? (
                                    <Pause className="ml-auto w-4" />
                                ) : (
                                    <Play className="ml-auto w-4" />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
