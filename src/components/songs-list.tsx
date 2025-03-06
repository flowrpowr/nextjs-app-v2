"use client";

import { useAudio, type Song } from "@/context/audio";
import { formatTime } from "@/lib/utils";
import { Play, Pause, Plus, Heart, HeartOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { addUserSong, removeUserSong } from "@/actions/song";
import { toast } from "sonner";

interface SongListProps {
    songs: Song[];
    title?: string;
    userSongIds?: string[]; // Array of song IDs that the user has in their library
}

export function SongsList({ songs, title = "Songs", userSongIds = [] }: SongListProps) {
    const { currentSong, isPlaying, togglePlayPause, addToQueue, playSongNext, playSong, setQueue } = useAudio();
    const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set(userSongIds));
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

    // Completely fixed playWithContinuation function
    const playWithContinuation = (selectedSong: Song, index: number) => {
        // Create a properly ordered queue with the selected song first
        const songsStartingWithSelected = [
            selectedSong, // First, the selected song
            ...songs.slice(index + 1), // Then songs after it
            ...songs.slice(0, index), // Then songs before it
        ];

        // Use setQueue which will play the first song and queue the rest
        setQueue(songsStartingWithSelected);
    };

    const handleToggleLike = useCallback(
        async (songId: string) => {
            // Prevent multiple clicks
            if (isUpdating[songId]) return;

            setIsUpdating((prev) => ({ ...prev, [songId]: true }));

            try {
                const isLiked = likedSongs.has(songId);

                // Optimistically update UI
                const newLikedSongs = new Set(likedSongs);
                if (isLiked) {
                    newLikedSongs.delete(songId);
                } else {
                    newLikedSongs.add(songId);
                }
                setLikedSongs(newLikedSongs);

                // Call the appropriate server action
                const result = isLiked ? await removeUserSong(songId) : await addUserSong(songId);

                if (!result.success) {
                    // Revert optimistic update if there was an error
                    setLikedSongs(likedSongs);
                    toast.error(result.error || "Failed to update library");
                } else {
                    toast.success(result.message);
                }
            } catch (error) {
                console.error("Error toggling like status:", error);
                // Revert optimistic update if there was an error
                setLikedSongs(likedSongs);
                toast.error("Failed to update library");
            } finally {
                setIsUpdating((prev) => ({ ...prev, [songId]: false }));
            }
        },
        [likedSongs, isUpdating]
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
                {songs.map((song, index) => {
                    const isCurrentSong = currentSong?.id === song.id;
                    const isLiked = likedSongs.has(song.id);

                    return (
                        <TableRow key={song.id} className={isCurrentSong ? "bg-muted/50" : ""}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">{song.title}</TableCell>
                            <TableCell>{song.artist?.name}</TableCell>
                            <TableCell>{song.album?.title || "-"}</TableCell>

                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                        if (isCurrentSong) {
                                            togglePlayPause();
                                        } else {
                                            playWithContinuation(song, index);
                                        }
                                    }}
                                >
                                    {isCurrentSong && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                </Button>
                            </TableCell>

                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={isUpdating[song.id]}
                                    onClick={() => handleToggleLike(song.id)}
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
                                        <DropdownMenuItem onClick={() => playWithContinuation(song, index)}>
                                            Play Now
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => playSongNext(song)}>
                                            Play Next
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => addToQueue(song)}>
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
