"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

import { useZkLogin } from "@mysten/enoki/react";
import { toast } from "sonner";
// Track interface aligned with Prisma schema
export interface Track {
  id: string;
  coverUrl: string;
  title: string;
  artistName: string;
  artistId: string;
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

  play: (track?: Track) => void;
  pause: () => void;
  togglePlayPause: () => void;

  next: () => void;
  previous: () => void;

  addToQueue: (track: Track) => void;
  clearQueue: () => void;

  setQueue: (tracks: Track[], startIndex?: number) => void;
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
  const zkLogin = useZkLogin();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get current track based on queue index
  const currentTrack =
    queueIndex >= 0 && queueIndex < queue.length ? queue[queueIndex] : null;

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

  // This effect handles track changes - when currentTrack changes
  // It sets up the audio source and fetches the signed URL
  useEffect(() => {
    const setupTrack = async () => {
      if (audioRef.current && currentTrack) {
        // Only fetch signed URL if the track has an ID
        if (currentTrack.id) {
          try {
            // Get listener's wallet address
            const listenerAddress = zkLogin.address;
            console.log(
              `Fetching signed URL for track ${currentTrack.id}, listener: ${listenerAddress}`
            );

            // Call API to get signed URL
            const response = await fetch(
              `/api/stream?trackId=${currentTrack.id}&listenerAddress=${listenerAddress}`
            );

            if (!response.ok) {
              throw new Error(`Failed to get stream URL: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.signedUrl) {
              console.log(`Received signed URL for track`);
              audioRef.current.src = data.signedUrl;
              setHasStartedPlaying(false);

              // If already playing, start the new track
              if (isPlaying) {
                audioRef.current
                  .play()
                  .catch((err) => console.error("Error playing track:", err));
              }
            } else {
              throw new Error(`Failed to get stream URL: ${data}`);

              // Optional: Set some error state here
              setIsPlaying(false);
            }
          } catch (error) {
            toast.error(`Unable to stream ${currentTrack.title} </3`, {
              description: error as string,
            });
            // Set playing state to false since we couldn't load the track
            setIsPlaying(false);
          }
        }
      }
    };

    setupTrack();
  }, [currentTrack]);

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
      const trackIndex = queue.findIndex((t) => t.id === track.id);

      if (trackIndex >= 0) {
        // If track is in queue, set index to it
        setQueueIndex(trackIndex);
      } else {
        // If track is not in queue, add it and play
        addToQueue(track);
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
      setQueueIndex(startIndex);
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

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
