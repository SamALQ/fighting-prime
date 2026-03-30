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
  Settings,
  Check,
  Loader2,
  PictureInPicture2,
  Gauge,
  Keyboard,
  Bookmark,
} from "lucide-react";
import { Button } from "./button";
import { useSubscription } from "@/lib/hooks/use-subscription";

import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  episode: Episode;
  className?: string;
}

interface VideoSource {
  url: string;
  source: "presigned" | "direct" | "fallback";
  resolution?: string;
  resolutions: string[];
  expiresIn?: number;
}

const PREFERRED_RESOLUTION_KEY = "fpa-preferred-resolution";

function getPreferredResolution(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PREFERRED_RESOLUTION_KEY);
}

function setPreferredResolution(res: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFERRED_RESOLUTION_KEY, res);
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

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [availableResolutions, setAvailableResolutions] = useState<string[]>([]);
  const [activeResolution, setActiveResolution] = useState<string | null>(null);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [bookmarks, setBookmarks] = useState<{ id: string; timestamp_seconds: number; note: string }[]>([]);
  const [chapters, setChapters] = useState<{ id: string; title: string; timestamp_seconds: number }[]>([]);

  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrubBarRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSeeking = useRef(false);
  const lastNaturalTime = useRef(0);
  const presignedExpiresAt = useRef(0);

  const { isActive } = useSubscription();
  const { updateProgress, updateWatchTime, trackWatchEvent, getProgress, flush } = useProgress();
  const lastTickMs = useRef(0);

  const locked = !episode.isFree && !isActive;

  const fetchVideoSource = useCallback(
    async (resolution?: string): Promise<VideoSource | null> => {
      try {
        const params = new URLSearchParams({ episodeId: episode.id });
        if (resolution) params.set("resolution", resolution);
        const res = await fetch(`/api/video?${params}`);
        if (!res.ok) {
          console.warn(`[VideoPlayer] /api/video responded ${res.status} for episode ${episode.id}`);
          return null;
        }
        return await res.json();
      } catch (err) {
        console.warn("[VideoPlayer] Failed to fetch video source:", err);
        return null;
      }
    },
    [episode.id]
  );

  useEffect(() => {
    if (locked) return;

    const hasS3Resolutions = episode.videoResolutions && episode.videoResolutions.length > 0;

    if (!hasS3Resolutions) {
      setVideoSrc(episode.videoUrl);
      setAvailableResolutions([]);
      setActiveResolution(null);
      return;
    }

    setIsLoadingSource(true);
    const preferred = getPreferredResolution();
    fetchVideoSource(preferred ?? undefined).then((source) => {
      if (source?.url) {
        setVideoSrc(source.url);
        setAvailableResolutions(source.resolutions);
        setActiveResolution(source.resolution ?? null);
        if (source.expiresIn) {
          presignedExpiresAt.current = Date.now() + source.expiresIn * 1000;
        }
      } else {
        setVideoSrc(episode.videoUrl);
        setAvailableResolutions([]);
      }
      setIsLoadingSource(false);
    });
  }, [episode.id, episode.videoUrl, episode.videoResolutions, locked, fetchVideoSource]);

  useEffect(() => {
    if (locked) return;
    fetch(`/api/bookmarks?episodeId=${episode.id}`)
      .then((r) => r.json())
      .then((d) => setBookmarks(d.bookmarks ?? []))
      .catch(() => {});
    fetch(`/api/chapters?episodeId=${episode.id}`)
      .then((r) => r.json())
      .then((d) => setChapters(d.chapters ?? []))
      .catch(() => {});
  }, [episode.id, locked]);

  const addBookmark = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    const ts = Math.round(video.currentTime);
    const note = "";
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId: episode.id, timestampSeconds: ts, note }),
    });
    if (res.ok) {
      const { bookmark } = await res.json();
      setBookmarks((prev) => [...prev.filter((b) => b.timestamp_seconds !== ts), bookmark].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds));
    }
  }, [episode.id]);

  const switchResolution = useCallback(
    async (resolution: string) => {
      const video = videoRef.current;
      const savedTime = video?.currentTime ?? 0;
      const wasPlaying = isPlaying;

      if (video) video.pause();
      setIsLoadingSource(true);
      setShowResolutionMenu(false);

      const source = await fetchVideoSource(resolution);
      if (source?.url) {
        setVideoSrc(source.url);
        setActiveResolution(source.resolution ?? resolution);
        setPreferredResolution(resolution);
        if (source.expiresIn) {
          presignedExpiresAt.current = Date.now() + source.expiresIn * 1000;
        }

        await new Promise<void>((resolve) => {
          const checkVideo = () => {
            const v = videoRef.current;
            if (v) {
              const onCanPlay = () => {
                v.removeEventListener("canplay", onCanPlay);
                resolve();
              };
              v.addEventListener("canplay", onCanPlay);
              v.load();
            } else {
              resolve();
            }
          };
          requestAnimationFrame(checkVideo);
        });

        if (videoRef.current) {
          videoRef.current.currentTime = savedTime;
          if (wasPlaying) videoRef.current.play();
        }
      }
      setIsLoadingSource(false);
    },
    [fetchVideoSource, isPlaying]
  );

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

      const now = performance.now();
      if (lastTickMs.current > 0) {
        const elapsed = (now - lastTickMs.current) / 1000;
        trackWatchEvent(episode.id, episode.courseId, elapsed);
      }
      lastTickMs.current = now;

      
    };

    const handlePause = () => {
      lastTickMs.current = 0;
      flush();
    };
    const handlePlay = () => {
      lastTickMs.current = 0;
    };
    const handleSeeking = () => {
      isSeeking.current = true;
      lastTickMs.current = 0;
    };
    const handleSeeked = () => {
      lastNaturalTime.current = video.currentTime;
      lastTickMs.current = 0;
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
    video.addEventListener("play", handlePlay);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("ended", handleEnded);
      flush();
    };
  }, [episode.id, episode.courseId, episode.durationSeconds, locked, isScrubbing, updateProgress, updateWatchTime, trackWatchEvent, getProgress, flush]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showResolutionMenu && !target.closest("[data-resolution-menu]")) {
        setShowResolutionMenu(false);
      }
      if (showSpeedMenu && !target.closest("[data-speed-menu]")) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showResolutionMenu, showSpeedMenu]);

  const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const changeSpeed = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, []);

  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {
      /* PiP not supported */
    }
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

  const seekTo = useCallback((time: number, fast?: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    if (fast && typeof video.fastSeek === "function") {
      video.fastSeek(time);
    } else {
      video.currentTime = time;
    }
  }, []);

  const handleScrub = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent, fast?: boolean) => {
      const bar = scrubBarRef.current;
      const video = videoRef.current;
      if (!bar || !video || !video.duration) return;
      const rect = bar.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const pct = x / rect.width;
      const time = pct * video.duration;
      seekTo(time, fast);
      setCurrentSeconds(time);
      setCurrentPercent(pct * 100);
    },
    [seekTo]
  );

  const handleScrubStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsScrubbing(true);
      handleScrub(e, true);

      const handleMove = (me: MouseEvent) => handleScrub(me, true);
      const handleUp = (me: MouseEvent) => {
        handleScrub(me, false);
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

  useEffect(() => {
    if (locked) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (videoRef.current) seekTo(Math.max(0, videoRef.current.currentTime - 5));
          break;
        case "ArrowRight":
          e.preventDefault();
          if (videoRef.current) seekTo(videoRef.current.currentTime + 5);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, videoRef.current.volume + 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            setIsMuted(false);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
            if (newVol === 0) setIsMuted(true);
          }
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "p":
          e.preventDefault();
          togglePiP();
          break;
        case "?":
          e.preventDefault();
          setShowShortcuts((s) => !s);
          break;
        case "<":
          e.preventDefault();
          { const idx = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
            if (idx > 0) changeSpeed(PLAYBACK_SPEEDS[idx - 1]); }
          break;
        case ">":
          e.preventDefault();
          { const idx = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
            if (idx < PLAYBACK_SPEEDS.length - 1) changeSpeed(PLAYBACK_SPEEDS[idx + 1]); }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [locked, togglePlay, seekTo, toggleFullscreen, toggleMute, togglePiP, changeSpeed, playbackSpeed, PLAYBACK_SPEEDS]);

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
      {videoSrc ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={videoSrc}
          preload="auto"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {isLoadingSource ? (
            <Loader2 className="h-8 w-8 text-white/50 animate-spin" />
          ) : (
            <div className="text-center space-y-2 px-6">
              <p className="text-white/50 text-sm">Video unavailable</p>
              <p className="text-white/30 text-xs">This episode&apos;s video could not be loaded.</p>
            </div>
          )}
        </div>
      )}

      {/* Loading overlay during resolution switch */}
      {isLoadingSource && hasStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
          <Loader2 className="h-10 w-10 text-white animate-spin" />
        </div>
      )}

      {/* Thumbnail overlay (before first play) */}
      {!hasStarted && !showResumePrompt && !isLoadingSource && (
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

      {/* Keyboard shortcuts overlay */}
      {showShortcuts && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div className="bg-black/90 border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
              {[
                ["Space / K", "Play / Pause"],
                ["\u2190", "Rewind 5s"],
                ["\u2192", "Forward 5s"],
                ["\u2191 / \u2193", "Volume"],
                ["F", "Fullscreen"],
                ["M", "Mute"],
                ["P", "Picture-in-Picture"],
                ["< / >", "Speed down / up"],
                ["?", "Toggle this panel"],
              ].map(([key, desc]) => (
                <div key={key} className="contents">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/90 font-mono text-center">{key}</kbd>
                  <span className="text-white/60">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Center play/pause on click feedback (while playing) */}
      {hasStarted && !showResumePrompt && !isPlaying && !isLoadingSource && (
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
              {/* Chapter markers */}
              {duration > 0 && chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-white/60 rounded-full z-10"
                  style={{ left: `${(ch.timestamp_seconds / duration) * 100}%` }}
                  title={ch.title}
                />
              ))}
              {/* Bookmark markers */}
              {duration > 0 && bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-full z-10 cursor-pointer"
                  style={{ left: `${(bm.timestamp_seconds / duration) * 100}%` }}
                  title={bm.note || `Bookmark at ${formatTime(bm.timestamp_seconds)}`}
                  onClick={(e) => { e.stopPropagation(); seekTo(bm.timestamp_seconds); }}
                />
              ))}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-primary opacity-0 group-hover/scrub:opacity-100 transition-opacity shadow"
                style={{ left: `${currentPercent}%` }}
              />
            </div>
          </div>

          {/* Bottom row: play, time, resolution, volume, fullscreen */}
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

            {/* Bookmark button */}
            <button
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              onClick={addBookmark}
              title="Add bookmark (current time)"
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>

            <div className="flex-1" />

            {/* Speed */}
            <div className="relative" data-speed-menu>
              <button
                className="h-8 px-2 flex items-center gap-1 rounded-md hover:bg-white/10 transition-colors text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSpeedMenu(!showSpeedMenu);
                }}
              >
                <Gauge className="h-3.5 w-3.5" />
                <span className="text-white/70">{playbackSpeed === 1 ? "" : `${playbackSpeed}x`}</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden min-w-[100px] shadow-xl z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
                    Speed
                  </div>
                  {PLAYBACK_SPEEDS.map((spd) => (
                    <button
                      key={spd}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/10 transition-colors text-left",
                        playbackSpeed === spd ? "text-primary" : "text-white/80"
                      )}
                      onClick={() => changeSpeed(spd)}
                    >
                      {playbackSpeed === spd && <Check className="h-3 w-3" />}
                      <span className={playbackSpeed !== spd ? "pl-5" : ""}>
                        {spd === 1 ? "Normal" : `${spd}x`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resolution picker */}
            {availableResolutions.length > 1 && (
              <div className="relative" data-resolution-menu>
                <button
                  className="h-8 px-2 flex items-center gap-1.5 rounded-md hover:bg-white/10 transition-colors text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowResolutionMenu(!showResolutionMenu);
                  }}
                >
                  <Settings className="h-3.5 w-3.5" />
                  {activeResolution && (
                    <span className="text-white/70">{activeResolution}</span>
                  )}
                </button>

                {showResolutionMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden min-w-[120px] shadow-xl z-50">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
                      Quality
                    </div>
                    {availableResolutions.map((res) => (
                      <button
                        key={res}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/10 transition-colors text-left",
                          activeResolution === res ? "text-primary" : "text-white/80"
                        )}
                        onClick={() => switchResolution(res)}
                      >
                        {activeResolution === res && <Check className="h-3 w-3" />}
                        <span className={activeResolution !== res ? "pl-5" : ""}>
                          {res}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PiP */}
            <button
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              onClick={togglePiP}
              title="Picture-in-Picture (P)"
            >
              <PictureInPicture2 className="h-4 w-4" />
            </button>

            {/* Shortcuts help */}
            <button
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
              onClick={() => setShowShortcuts((s) => !s)}
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-3.5 w-3.5" />
            </button>

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
