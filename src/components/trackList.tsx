"use client";

import { useAudio, type Track } from "@/context/audio";
import { formatTime } from "@/lib/utils";
import { Play, Pause, Plus, Heart, HeartOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { addUserTrack, removeUserTrack } from "@/actions/track";
import { toast } from "sonner";

interface TrackListProps {
  tracks: Track[];
  title?: string;
  userTrackIds?: string[]; // Array of Track IDs that the user has in their library
}

export function TracksList({
  tracks,
  title = "Tracks",
  userTrackIds = [],
}: TrackListProps) {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    addToQueue,
    playTrackNext,
    playTrack,
    setQueue,
  } = useAudio();
  const [likedTracks, setLikedTracks] = useState<Set<string>>(
    new Set(userTrackIds)
  );
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  // Completely fixed playWithContinuation function
  const playWithContinuation = (selectedTrack: Track, index: number) => {
    // Create a properly ordered queue with the selected Track first
    const tracksStartingWithSelected = [
      selectedTrack, // First, the selected track
      ...tracks.slice(index + 1), // Then tracks after it
      ...tracks.slice(0, index), // Then tracks before it
    ];

    // Use setQueue which will play the first track and queue the rest
    setQueue(tracksStartingWithSelected);
  };

  const handleToggleLike = useCallback(
    async (trackId: string) => {
      // Prevent multiple clicks
      if (isUpdating[trackId]) return;

      setIsUpdating((prev) => ({ ...prev, [trackId]: true }));

      try {
        const isLiked = likedTracks.has(trackId);

        // Optimistically update UI
        const newLikedTracks = new Set(likedTracks);
        if (isLiked) {
          newLikedTracks.delete(trackId);
        } else {
          newLikedTracks.add(trackId);
        }
        setLikedTracks(newLikedTracks);

        // Call the appropriate server action
        const result = isLiked
          ? await removeUserTrack(trackId)
          : await addUserTrack(trackId);

        if (!result.success) {
          // Revert optimistic update if there was an error
          setLikedTracks(likedTracks);
          toast.error(result.error || "Failed to update library");
        } else {
          toast.success(result.message);
        }
      } catch (error) {
        console.error("Error toggling like status:", error);
        // Revert optimistic update if there was an error
        setLikedTracks(likedTracks);
        toast.error("Failed to update library");
      } finally {
        setIsUpdating((prev) => ({ ...prev, [trackId]: false }));
      }
    },
    [likedTracks, isUpdating]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Artist</TableHead>
          <TableHead>Album</TableHead>
          <TableHead className="w-12"></TableHead>
          <TableHead className="w-12"></TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          const isLiked = likedTracks.has(track.id);

          return (
            <TableRow
              key={track.id}
              className={isCurrentTrack ? "bg-muted/50" : ""}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium">{track.title}</TableCell>
              <TableCell>{track.artist?.name}</TableCell>
              <TableCell>{track.album?.title || "-"}</TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (isCurrentTrack) {
                      togglePlayPause();
                    } else {
                      playWithContinuation(track, index);
                    }
                  }}
                >
                  {isCurrentTrack && isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </Button>
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isUpdating[track.id]}
                  onClick={() => handleToggleLike(track.id)}
                >
                  {isLiked ? (
                    <Heart size={16} className="fill-current text-primary" />
                  ) : (
                    <Heart size={16} />
                  )}
                </Button>
              </TableCell>

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Plus size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => playWithContinuation(track, index)}
                    >
                      Play Now
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => playTrackNext(track)}>
                      Play Next
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addToQueue(track)}>
                      Add to Queue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
