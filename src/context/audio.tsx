"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

// Track interface aligned with Prisma schema
export interface Track {
    id: string;
    coverUrl: string;
    title: string;
    artistName: string;
    artistId: string;
    audioUrl: string;
    duration: number;
    liked: boolean;
}

interface AudioContextType {
    queueIndex: number;
    queue: Track[];

    isPlaying: boolean;
    volume: number;

    currentTime: number;
    duration: number;

    play: (track: Track) => void;
    pause: () => void;
    togglePlayPause: () => void;

    next: () => void;
    previous: () => void;

    addToQueue: (track: Track) => void;
    clearQueue: () => void;

    setQueue: (tracks: Track[], startIndex?: number) => void; // Add optional startIndex parameter
    setVolume: (volume: number) => void;
    seek: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [queueIndex, setQueueIndex] = useState<number>(-1);
    const [queue, setQueue] = useState<Track[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Get current track based on queue index
    const currentTrack = queueIndex >= 0 && queueIndex < queue.length ? queue[queueIndex] : null;

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;

        // Set initial volume
        audio.volume = volume;

        // Add event listeners
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleTrackEnded);
        audio.addEventListener("play", handlePlay);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleTrackEnded);
            audio.removeEventListener("play", handlePlay);
            audio.pause();
        };
    }, []);

    // Update audio source when current track changes
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.audioUrl || "";
            setHasStartedPlaying(false);

            if (isPlaying) {
                audioRef.current.play().catch((err) => console.error("Error playing track:", err));
            }
        }
    }, [queueIndex, queue]);

    // Update audio playback state when isPlaying changes
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying && currentTrack) {
                audioRef.current.play().catch((err) => console.error("Error playing track:", err));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    // Update volume when it changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handlePlay = () => {
        // Increment stream count only once per track play session
        if (!hasStartedPlaying && currentTrack) {
            setHasStartedPlaying(true);
        }
    };

    const handleTrackEnded = () => {
        next();
    };

    // Play a specific track or the current track
    const play = (track?: Track) => {
        if (track) {
            // Find if track is already in queue
            const trackIndex = queue.findIndex((t) => t.audioUrl === track.audioUrl);

            if (trackIndex >= 0) {
                // If track is in queue, set index to it
                setQueueIndex(trackIndex);
            }
        }
        setIsPlaying(true);
    };

    const pause = () => {
        setIsPlaying(false);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const next = () => {
        console.log(queue, queueIndex);
        if (queueIndex < queue.length - 1) {
            // Move to next track if available
            setQueueIndex(queueIndex + 1);
            setIsPlaying(true);
        } else if (queue.length > 0) {
            // Loop back to the first track if at the end
            setQueueIndex(0);
            setIsPlaying(true);
        } else {
            // No tracks in queue
            setIsPlaying(false);
        }
    };

    const previous = () => {
        if (audioRef.current && audioRef.current.currentTime > 3) {
            // If current track has played for more than 3 seconds, restart it
            audioRef.current.currentTime = 0;
        } else if (queueIndex > 0) {
            // Go to previous track
            setQueueIndex(queueIndex - 1);
        } else if (queue.length > 0) {
            // If at the first track, restart it
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
        }
    };

    const addToQueue = (track: Track) => {
        const newQueue = [...queue, track];
        setQueue(newQueue);

        // If nothing is currently playing, start playing the added track
        if (queueIndex === -1) {
            setQueueIndex(newQueue.length - 1);
            setIsPlaying(true);
        }
    };

    const clearQueue = () => {
        setQueue([]);
        setQueueIndex(-1);
        setIsPlaying(false);
    };

    const setQueueAndPlay = (tracks: Track[], startIndex: number = 0) => {
        if (tracks.length > 0) {
            setQueue(tracks);
            setQueueIndex(startIndex); // Use the provided index instead of always 0
            setIsPlaying(true);
        } else {
            clearQueue();
        }
    };

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const value = {
        queueIndex,
        queue,
        isPlaying,
        volume,
        currentTime,
        duration,
        play,
        pause,
        togglePlayPause,
        next,
        previous,
        addToQueue,
        clearQueue,
        setQueue: setQueueAndPlay,
        setVolume,
        seek,
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error("useAudio must be used within an AudioProvider");
    }
    return context;
}
