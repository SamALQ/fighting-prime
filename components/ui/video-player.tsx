"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useProgress } from "@/lib/hooks/use-progress";
import { Episode } from "@/data/episodes";
import { Play, Pause, Lock } from "lucide-react";
import { Button } from "./button";
import { useSubscription } from "@/lib/hooks/use-subscription";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  episode: Episode;
  className?: string;
}

export function VideoPlayer({ episode, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isActive } = useSubscription();
  const { updateProgress, updateWatchTime, getProgress } = useProgress();

  const progress = getProgress(episode.slug);
  const locked = !episode.isFree && !isActive;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || locked) return;

    // Restore previous progress when metadata is loaded
    const handleLoadedMetadata = () => {
      if (progress > 0 && video.duration) {
        video.currentTime = (progress / 100) * video.duration;
        setCurrentTime(progress);
      }
    };

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      
      const percent = (video.currentTime / video.duration) * 100;
      setCurrentTime(percent);
      
      // Update progress and track course as started
      const isComplete = updateProgress(episode.slug, percent, episode.courseId);
      
      // Update watch time
      updateWatchTime(episode.slug, video.currentTime, episode.durationSeconds);
      
      if (isComplete && !hasTriggeredConfetti) {
        setHasTriggeredConfetti(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D71212", "#FFFFFF"],
        });
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [episode.slug, episode.courseId, episode.durationSeconds, progress, updateProgress, updateWatchTime, hasTriggeredConfetti, locked]);

  const togglePlay = () => {
    if (locked) return;
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
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
    <div className={cn("relative aspect-video bg-black rounded-xl overflow-hidden", className)}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={episode.videoUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Thumbnail with play button - shown when video is not playing */}
      {!isPlaying && (
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
              <div className="text-6xl font-bold text-primary/30">{episode.title.charAt(0)}</div>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Button
              size="lg"
              variant="secondary"
              className="h-16 w-16 rounded-full hover:scale-110 transition-transform"
              onClick={togglePlay}
            >
              <Play className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}

      {/* Play/Pause button overlay - shown when video is playing */}
      {isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group">
          <Button
            size="lg"
            variant="secondary"
            className="h-16 w-16 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={togglePlay}
          >
            <Pause className="h-8 w-8" />
          </Button>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/20">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${currentTime}%` }}
        />
      </div>
    </div>
  );
}
