"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useProgress } from "@/lib/hooks/use-progress";
import type { Episode } from "@/data/episodes";
import {
  Play,
  Pause,
  Lock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "./button";
import { useSubscription } from "@/lib/hooks/use-subscription";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  episode: Episode;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VideoPlayer({ episode, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPercent, setCurrentPercent] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);

  const hasTriggeredConfetti = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSeeking = useRef(false);
  const lastNaturalTime = useRef(0);

  const { isActive } = useSubscription();
  const { updateProgress, updateWatchTime, getProgress, flush } = useProgress();

  const locked = !episode.isFree && !isActive;

  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    setShowControls(true);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || locked) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      const saved = getProgress(episode.id);
      if (saved > 5 && saved < 95 && video.duration) {
        const time = (saved / 100) * video.duration;
        setResumeTime(time);
        setShowResumePrompt(true);
      }
    };

    const handleTimeUpdate = () => {
      if (!video.duration || isScrubbing) return;

      const seconds = video.currentTime;
      const percent = (seconds / video.duration) * 100;
      setCurrentSeconds(seconds);
      setCurrentPercent(percent);

      if (isSeeking.current) return;

      const delta = Math.abs(seconds - lastNaturalTime.current);
      if (delta > 2 && lastNaturalTime.current > 0) {
        lastNaturalTime.current = seconds;
        return;
      }
      lastNaturalTime.current = seconds;

      const isComplete = updateProgress(episode.id, percent, episode.courseId);
      updateWatchTime(episode.id, seconds, episode.durationSeconds);

      if (isComplete && !hasTriggeredConfetti.current) {
        hasTriggeredConfetti.current = true;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D71212", "#FFFFFF"],
        });
      }
    };

    const handlePause = () => flush();
    const handleSeeking = () => {
      isSeeking.current = true;
    };
    const handleSeeked = () => {
      lastNaturalTime.current = video.currentTime;
      setTimeout(() => {
        isSeeking.current = false;
      }, 300);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("ended", handleEnded);
      flush();
    };
  }, [episode.id, episode.courseId, episode.durationSeconds, locked, isScrubbing, updateProgress, updateWatchTime, getProgress, flush]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const togglePlay = useCallback(() => {
    if (locked) return;
    const video = videoRef.current;
    if (!video) return;

    if (showResumePrompt) setShowResumePrompt(false);
    if (!hasStarted) setHasStarted(true);

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [locked, isPlaying, showResumePrompt, hasStarted]);

  const handleResume = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = resumeTime;
    setCurrentSeconds(resumeTime);
    setCurrentPercent((resumeTime / (video.duration || 1)) * 100);
    setShowResumePrompt(false);
    setHasStarted(true);
    video.play();
    setIsPlaying(true);
  };

  const handleStartOver = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentSeconds(0);
    setCurrentPercent(0);
    setShowResumePrompt(false);
    setHasStarted(true);
    video.play();
    setIsPlaying(true);
  };

  const handleScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      const bar = scrubBarRef.current;
      const video = videoRef.current;
      if (!bar || !video || !video.duration) return;
      const rect = bar.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const pct = x / rect.width;
      video.currentTime = pct * video.duration;
      setCurrentSeconds(pct * video.duration);
      setCurrentPercent(pct * 100);
    },
    []
  );

  const handleScrubStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsScrubbing(true);
      handleScrub(e);

      const handleMove = (me: MouseEvent) => handleScrub(me);
      const handleUp = () => {
        setIsScrubbing(false);
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [handleScrub]
  );

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) videoRef.current.volume = val;
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume || 0.5;
      setVolume(volume || 0.5);
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await container.requestFullscreen();
    }
  };

  if (locked) {
    return (
      <div className={cn("relative aspect-video bg-black rounded-xl overflow-hidden", className)}>
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 to-background/40">
          <div className="text-center space-y-4">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Members Only</h3>
              <p className="text-muted-foreground mb-4">
                This episode is available for premium members only.
              </p>
              <Button asChild>
                <a href="/pricing">View Pricing</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video bg-black rounded-xl overflow-hidden group/player select-none",
        isFullscreen && "rounded-none",
        className
      )}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={episode.videoUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Thumbnail overlay (before first play) */}
      {!hasStarted && !showResumePrompt && (
        <div className="absolute inset-0">
          {episode.thumbnail ? (
            <Image
              src={episode.thumbnail}
              alt={episode.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background flex items-center justify-center">
              <div className="text-6xl font-bold text-primary/30">
                {episode.title.charAt(0)}
              </div>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              className="h-16 w-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              onClick={togglePlay}
            >
              <Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
            </button>
          </div>
        </div>
      )}

      {/* Resume prompt overlay */}
      {showResumePrompt && (
        <div className="absolute inset-0 z-20">
          {episode.thumbnail ? (
            <Image
              src={episode.thumbnail}
              alt={episode.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center space-y-4 px-6">
              <p className="text-white/80 text-sm">
                You left off at {formatTime(resumeTime)}
              </p>
              <div className="flex items-center gap-3 justify-center">
                <Button
                  onClick={handleResume}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStartOver}
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center play/pause on click feedback (while playing) */}
      {hasStarted && !showResumePrompt && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <button
            className="h-16 w-16 rounded-full bg-white/90 hover:bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            onClick={togglePlay}
          >
            <Play className="h-7 w-7 text-black ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Controls bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 transition-opacity duration-300",
          showControls || !isPlaying || isScrubbing
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Gradient fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        <div className="relative px-3 pb-2.5 pt-8">
          {/* Scrub bar */}
          <div
            ref={scrubBarRef}
            className="group/scrub h-5 flex items-center cursor-pointer mb-1.5"
            onMouseDown={handleScrubStart}
          >
            <div className="relative w-full h-1 group-hover/scrub:h-1.5 transition-all rounded-full bg-white/20">
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                style={{ width: `${currentPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-primary opacity-0 group-hover/scrub:opacity-100 transition-opacity shadow"
                style={{ left: `${currentPercent}%` }}
              />
            </div>
          </div>

          {/* Bottom row: play, time, volume, fullscreen */}
          <div className="flex items-center gap-2 text-white">
            <button
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" fill="currentColor" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" fill="currentColor" />
              )}
            </button>

            <span className="text-xs tabular-nums text-white/80 min-w-[72px]">
              {formatTime(currentSeconds)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Volume */}
            <div
              className="relative flex items-center"
              onMouseEnter={() => setVolumeOpen(true)}
              onMouseLeave={() => setVolumeOpen(false)}
            >
              <button
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  volumeOpen ? "w-20 opacity-100 ml-1" : "w-0 opacity-0"
                )}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </div>

            {/* Fullscreen */}
            <button
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
