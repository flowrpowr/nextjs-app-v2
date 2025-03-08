"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

// Song interface aligned with Prisma schema
export interface Song {
  id: string;
  title: string;
  duration: number | null;
  artistId: string;
  audioUrl: string | null;
  artist?: {
    id: string;
    name: string;
  };
  releaseId?: string | null;
  Release?: {
    id: string;
    title: string;
    coverUrl: string | null;
  } | null;
  streamCount: number;
}

interface AudioContextType {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: (song?: Song) => void;
  pause: () => void;
  togglePlayPause: () => void;
  next: () => void;
  previous: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  setQueue: (songs: Song[]) => void;
  playSong: (song: Song) => void;
  playSongNext: (song: Song) => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  incrementStreams: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Update audio source when current song changes
  useEffect(() => {
    if (audioRef.current && currentSong) {
      // Use the song ID to construct the URL
      audioRef.current.src = currentSong.audioUrl || "";
      setHasStartedPlaying(false);

      if (isPlaying) {
        audioRef.current
          .play()
          .catch((err) => console.error("Error playing song:", err));
      }
    }
  }, [currentSong]);

  // Update audio playback state when isPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((err) => console.error("Error playing song:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

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
    // Increment stream count only once per song play session
    if (!hasStartedPlaying && currentSong) {
      setHasStartedPlaying(true);
      incrementStreams();
    }
  };

  const handleTrackEnded = () => {
    next();
  };

  // Function to increment streams - this would need to call your API
  const incrementStreams = async () => {
    if (currentSong) {
      try {
        // Call your API to increment the streams count
        await fetch(`/api/songs/${currentSong.id}/stream`, {
          method: "POST",
        });

        // Update local state to reflect the change
        setCurrentSong((prev) =>
          prev ? { ...prev, streamCount: prev.streamCount + 1 } : null
        );
      } catch (error) {
        console.error("Failed to increment stream count:", error);
      }
    }
  };

  // Play a song or resume current song
  const play = (song?: Song) => {
    if (song) {
      setCurrentSong(song);
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
    if (queue.length > 0) {
      const nextSong = queue[0];
      const newQueue = queue.slice(1);
      setCurrentSong(nextSong);
      setQueue(newQueue);
      setIsPlaying(true);
    } else {
      // No more songs in queue
      setIsPlaying(false);
    }
  };

  const previous = () => {
    // This is simplified - a real implementation might keep a history
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If current song has played for more than 3 seconds, restart it
      audioRef.current.currentTime = 0;
    } else if (currentSong) {
      // Otherwise go to previous song if there was one
      // This would require keeping track of play history
      // For now, just restart the current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  const addToQueue = (song: Song) => {
    setQueue([...queue, song]);
  };

  const removeFromQueue = (songId: string) => {
    setQueue(queue.filter((song) => song.id !== songId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const setQueueAndPlay = (songs: Song[]) => {
    if (songs.length > 0) {
      const [firstSong, ...restSongs] = songs;
      setCurrentSong(firstSong);
      setQueue(restSongs);
      setIsPlaying(true);
    }
  };

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const playSongNext = (song: Song) => {
    setQueue([song, ...queue]);
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const value = {
    currentSong,
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
    removeFromQueue,
    clearQueue,
    setQueue: setQueueAndPlay,
    playSong,
    playSongNext,
    setVolume,
    seek: seekTo,
    incrementStreams,
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
