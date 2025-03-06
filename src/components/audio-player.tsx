"use client";

import React from "react";
import { useAudio } from "@/context/audio";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useEffect } from "react";

export function AudioPlayer() {
    const { currentSong, isPlaying, volume, currentTime, duration, togglePlayPause, next, previous, setVolume, seek } =
        useAudio();

    const handleVolumeChange = (value: number[]) => {
        setVolume(value[0]);
    };

    const handleSeek = (value: number[]) => {
        seek(value[0]);
    };

    return (
        <div className="flex items-center justify-between w-full bg-background">
            {/* Track info */}
            <div className="flex items-center space-x-3 w-1/3">
                {currentSong ? (
                    <>
                        {currentSong.album?.image ? (
                            <Image
                                src={currentSong.album.image || "/placeholder.svg"}
                                alt={currentSong.title}
                                width="100"
                                height="100"
                                className="h-12 w-12 rounded-md object-cover"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                                <Music className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium truncate">{currentSong.title}</span>
                            <span className="text-xs text-muted-foreground truncate">{currentSong.artist?.name}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="flex flex-col space-y-1 overflow-hidden">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </>
                )}
            </div>

            {/* Controls container */}
            <div className="flex items-center space-x-4 w-2/3 justify-end">
                {/* Player controls */}
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={previous} className="h-8 w-8" disabled={!currentSong}>
                        <SkipBack className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlayPause}
                        className="h-8 w-8"
                        disabled={!currentSong}
                    >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={next} className="h-8 w-8" disabled={!currentSong}>
                        <SkipForward className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                    </Button>
                </div>

                {/* Progress slider */}
                <div className="flex items-center space-x-2 w-1/2 max-w-xs">
                    <span className="text-xs text-muted-foreground w-8 text-right">
                        {currentSong ? formatTime(currentTime) : "0:00"}
                    </span>
                    {currentSong ? (
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="w-full"
                        />
                    ) : (
                        <Skeleton className="h-2 w-full rounded-full" />
                    )}
                    <span className="text-xs text-muted-foreground w-8">
                        {currentSong ? formatTime(duration) : "0:00"}
                    </span>
                </div>

                {/* Volume control */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!currentSong}
                        onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                    >
                        {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    {currentSong ? (
                        <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="w-20"
                        />
                    ) : (
                        <Skeleton className="h-2 w-20 rounded-full" />
                    )}
                </div>
            </div>
        </div>
    );
}
