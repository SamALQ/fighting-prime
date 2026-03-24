"use client";

import { useProgress, type ContinueWatchingItem } from "@/lib/hooks/use-progress";
import type { Episode } from "@/data/episodes";
import type { Course } from "@/data/courses";
import { Play, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ContinueWatchingProps {
  episodes: Episode[];
  courses: Course[];
}

export function ContinueWatching({ episodes, courses }: ContinueWatchingProps) {
  const { continueWatching, isLoading } = useProgress();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Continue Watching</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-foreground/[0.03] animate-pulse rounded-xl border border-foreground/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (continueWatching.length === 0) return null;

  const episodeMap = new Map(episodes.map((e) => [e.id, e]));
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  const items = continueWatching
    .map((cw: ContinueWatchingItem) => {
      const episode = episodeMap.get(cw.episode_id);
      if (!episode) return null;
      const course = courseMap.get(episode.courseId);
      return { ...cw, episode, course };
    })
    .filter(Boolean) as { episode: Episode; course: Course | undefined; percent_watched: number; updated_at: string }[];

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Continue Watching</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.episode.id}
            href={`/courses/${item.course?.slug ?? "unknown"}/${item.episode.slug}`}
            className="group rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden hover:border-primary/20 transition-all"
          >
            <div className="relative aspect-video bg-black/50">
              {item.episode.thumbnail && (
                <Image
                  src={item.episode.thumbnail}
                  alt={item.episode.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                  <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                </div>
              </div>
              {/* Progress bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${item.percent_watched}%` }}
                />
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {item.episode.title}
              </p>
              {item.course && (
                <p className="text-xs text-foreground/30 truncate mt-0.5">
                  {item.course.title}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-foreground/25">
                <span className={cn("font-bold", item.percent_watched > 50 ? "text-primary/60" : "text-foreground/30")}>
                  {item.percent_watched}% watched
                </span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {Math.floor(item.episode.durationSeconds / 60)}m
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
