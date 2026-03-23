"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import type { Episode } from "@/data/episodes";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { useProgress } from "@/lib/hooks/use-progress";
import { Lock, CheckCircle2, PlayCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressRing } from "./progress-ring";
import { Button } from "./button";

interface EpisodeListProps {
  episodes: Episode[];
  courseSlug: string;
  className?: string;
}

export function EpisodeList({ episodes, courseSlug, className }: EpisodeListProps) {
  const pathname = usePathname();
  const { isActive: hasSubscription } = useSubscription();
  const { getProgress, progress: progressData } = useProgress();
  const [animatingEpisodes, setAnimatingEpisodes] = useState<Set<string>>(new Set());
  const prevProgressRef = useRef<Record<string, number>>({});

  const isLocked = (episode: Episode) => {
    if (episode.isFree) return false;
    return !hasSubscription;
  };

  useEffect(() => {
    episodes.forEach((episode) => {
      const progress = getProgress(episode.id);
      const prevProgress = prevProgressRef.current[episode.id] || 0;
      const wasComplete = prevProgress >= 95;
      const isComplete = progress >= 95;

      if (!wasComplete && isComplete && progress > 0) {
        setAnimatingEpisodes((prev) => new Set(prev).add(episode.id));

        setTimeout(() => {
          setAnimatingEpisodes((prev) => {
            const next = new Set(prev);
            next.delete(episode.id);
            return next;
          });
        }, 2000);
      }

      prevProgressRef.current[episode.id] = progress;
    });
  }, [episodes, progressData, getProgress]);

  return (
    <div className={cn("space-y-2", className)}>
      {episodes.map((episode) => {
        const locked = isLocked(episode);
        const progress = getProgress(episode.id);
        const isActive = pathname === `/courses/${courseSlug}/${episode.slug}`;
        const isComplete = progress >= 95;
        const isAnimating = animatingEpisodes.has(episode.id);

        return (
          <Link
            key={episode.slug}
            href={locked ? "#" : `/courses/${courseSlug}/${episode.slug}`}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-lg border transition-all overflow-hidden",
              isComplete
                ? isActive
                  ? "border-green-500/50 bg-green-500/15 hover:border-green-500/60"
                  : "border-green-500/30 bg-green-500/10 hover:border-green-500/50"
                : isActive
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-card",
              locked && "opacity-60 cursor-not-allowed",
              isAnimating && "animate-lightning"
            )}
            onClick={(e) => {
              if (locked) {
                e.preventDefault();
              }
            }}
          >
            {isAnimating && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent animate-shimmer" />
                <div className="absolute top-0 left-1/4 w-1 h-full bg-yellow-400 animate-lightning-bolt" />
                <div className="absolute top-0 left-1/2 w-1 h-full bg-yellow-400 animate-lightning-bolt-delayed" />
                <div className="absolute top-0 left-3/4 w-1 h-full bg-yellow-400 animate-lightning-bolt-delayed-2" />
              </div>
            )}

            <div className="flex-shrink-0 relative z-10">
              {locked ? (
                <Lock className="h-5 w-5 text-muted-foreground" />
              ) : isComplete ? (
                <div className="relative">
                  {isAnimating && (
                    <Zap className="absolute h-5 w-5 text-yellow-400 animate-ping" />
                  )}
                  <CheckCircle2 className={cn(
                    "h-5 w-5 transition-colors",
                    isComplete ? "text-green-500" : "text-primary"
                  )} />
                </div>
              ) : (
                <PlayCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Episode {episode.order}
                </span>
                {episode.premium && (
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                    Premium
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm truncate">{episode.title}</h4>
              <p className="text-xs text-muted-foreground">
                {Math.floor(episode.durationSeconds / 60)} min
              </p>
            </div>

            {!locked && progress > 0 && (
              <div className="flex-shrink-0 relative z-10">
                <ProgressRing
                  progress={progress}
                  size={36}
                  strokeWidth={3}
                  color={isComplete ? "text-green-500" : "text-primary"}
                />
              </div>
            )}

            {locked && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 relative z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Lock className="h-4 w-4" />
              </Button>
            )}
          </Link>
        );
      })}
    </div>
  );
}
