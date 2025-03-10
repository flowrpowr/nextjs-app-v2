"use client";

import React from "react";
import { useAudio } from "@/context/audio";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

export function AudioPlayer() {
  const {
    queue,
    queueIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    currentTransactionDigest,
    togglePlayPause,
    next,
    previous,
    setVolume,
    seek,
  } = useAudio();

  // Get current track from queue based on queueIndex
  const currentTrack =
    queueIndex >= 0 && queueIndex < queue.length ? queue[queueIndex] : null;

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  // Safe formatter for transaction digest
  const formatTransactionId = (digest: string | undefined) => {
    if (!digest) return "Not available";
    return `${digest.charAt(0)}...${digest.slice(-3)}`;
  };

  // Safe formatter for Sui object ID
  const formatSuiId = (suiId: string | undefined) => {
    if (!suiId) return "Not available";
    return `${suiId.charAt(0)}...${suiId.slice(-3)}`;
  };

  return (
    <div className="flex items-center justify-between w-full bg-background pt-2">
      {/* Track info */}
      <div className="flex items-center space-x-3 w-1/3">
        {currentTrack ? (
          <>
            {currentTrack.coverUrl ? (
              <Image
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
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
              <span className="text-sm font-medium truncate">
                {currentTrack.title}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {currentTrack.artistName}
              </span>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={previous}
            className="h-8 w-8"
            disabled={!currentTrack}
          >
            <SkipBack className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            className="h-8 w-8"
            disabled={!currentTrack}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            className="h-8 w-8"
            disabled={!currentTrack}
          >
            <SkipForward className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        {/* Progress slider */}
        <div className="flex items-center space-x-2 w-1/2 max-w-xs">
          <span className="text-xs text-muted-foreground w-8 text-right">
            {currentTrack ? formatTime(currentTime) : "0:00"}
          </span>
          {currentTrack ? (
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
            {currentTrack ? formatTime(duration) : "0:00"}
          </span>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!currentTrack}
            onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          {currentTrack ? (
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

        {/* Blockchain info button with hover tooltip */}
        <div className="ml-2">
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!currentTrack}
                >
                  <Image
                    src="/sui_logo.png"
                    alt={"Sui"}
                    width={16}
                    height={16}
                    className="h-4 w-4"
                  />
                  <span className="sr-only">Track Information</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="w-64 p-4">
                {currentTrack ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div>
                        <h4 className="font-medium items-center">
                          Sui blockchain info
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          flowr is all about data and payment transparency. see
                          for yourself!
                        </p>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="font-medium">
                          your stream's transaction:
                        </span>{" "}
                        {currentTransactionDigest ? (
                          <Link
                            href={`https://testnet.suivision.xyz/txblock/${currentTransactionDigest}`}
                            title={`transaction digest: ${currentTransactionDigest}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#4a90e2" }}
                          >
                            {formatTransactionId(currentTransactionDigest)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">
                            Processing...
                          </span>
                        )}
                      </p>
                      <p>
                        <span className="font-medium">this track's data:</span>{" "}
                        {currentTrack.suiId ? (
                          <Link
                            href={`https://testnet.suivision.xyz/object/${currentTrack.suiId}`}
                            title={`Sui object ID: ${currentTrack.suiId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#4a90e2" }}
                          >
                            {formatSuiId(currentTrack.suiId)}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">
                            Not available
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p>No track currently playing</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
