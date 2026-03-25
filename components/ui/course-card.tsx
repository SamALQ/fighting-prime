"use client";

import Link from "next/link";
import Image from "next/image";
import { useProgress } from "@/lib/hooks/use-progress";
import type { Course, Difficulty } from "@/data/courses";
import type { Episode } from "@/data/episodes";
import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";
import { useMemo } from "react";

interface CourseCardProps {
  course: Course;
  episodes: Episode[];
  className?: string;
}

const difficultyConfig: Record<Difficulty, { label: string; color: string; dots: number }> = {
  Beginner: { label: "Beginner", color: "bg-green-500", dots: 1 },
  Intermediate: { label: "Intermediate", color: "bg-yellow-500", dots: 2 },
  Advanced: { label: "Advanced", color: "bg-red-500", dots: 3 },
  Professional: { label: "Pro", color: "bg-purple-500", dots: 4 },
};

function formatTotalDuration(episodes: Episode[]): string {
  const totalSec = episodes.reduce((s, e) => s + e.durationSeconds, 0);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours} HR, ${minutes} MIN` : `${hours} HR`;
  return `${minutes} MIN`;
}

function isNewRelease(releaseDate?: string): boolean {
  if (!releaseDate) return false;
  const diff = Date.now() - new Date(releaseDate).getTime();
  return diff >= 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

export function CourseCard({ course, episodes, className }: CourseCardProps) {
  const { getCourseProgress } = useProgress();
  const progress = getCourseProgress(episodes);
  const diff = difficultyConfig[course.difficulty];
  const duration = useMemo(() => formatTotalDuration(episodes), [episodes]);
  const newRelease = isNewRelease(course.releaseDate);

  const badgeLabel = newRelease
    ? "NEW RELEASE"
    : course.releaseDate
      ? new Date(course.releaseDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }).toUpperCase()
      : null;

  return (
    <Link href={`/courses/${course.slug}`} className={cn("group", className)}>
      <div className="rounded-2xl border border-foreground/[0.06] bg-[#111111] overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Poster image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {course.posterImage ? (
            <Image
              src={course.posterImage}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : course.coverImage ? (
            <Image
              src={course.coverImage}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.08] to-background flex items-center justify-center">
              <span className="text-5xl font-black text-foreground/[0.06] uppercase">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent" />

          {/* Difficulty — top of poster so it reads clearly above the title */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-end gap-2">
            {course.difficultyMeterImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- inline layout asset; Next Image wrapper breaks vertical align with label
              <img
                src={course.difficultyMeterImage}
                alt={`${course.difficulty} difficulty`}
                width={80}
                height={20}
                className="block h-[22px] w-auto shrink-0 object-contain object-bottom drop-shadow-md"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="flex gap-0.5 items-end pb-px">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full shrink-0",
                      i < diff.dots ? diff.color : "bg-foreground/[0.1]"
                    )}
                  />
                ))}
              </span>
            )}
            <span className="text-[11px] font-bold uppercase tracking-wide text-white/80 leading-none drop-shadow-md">
              {course.difficulty}
            </span>
          </div>

          {/* Badge overlay */}
          {badgeLabel && (
            <div className="absolute bottom-4 left-4 z-10">
              <span
                className={cn(
                  "inline-block px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md border",
                  newRelease
                    ? "bg-green-500/20 text-green-400 border-green-500/40"
                    : "bg-foreground/10 text-foreground/70 border-foreground/20"
                )}
              >
                {badgeLabel}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-2 flex-1 flex flex-col">
          <h3 className="font-black text-xl uppercase tracking-tight leading-tight mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-foreground/45 leading-relaxed mb-4 line-clamp-2">
            {course.tagline}
          </p>

          {/* Primary divider */}
          <div className="w-16 h-[2px] bg-primary/60 mb-4" />

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4">
            {course.instructor.image ? (
              <Image
                src={course.instructor.image}
                alt={course.instructor.name}
                width={22}
                height={22}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="h-[22px] w-[22px] rounded-full bg-foreground/[0.08] flex items-center justify-center">
                <User className="h-3 w-3 text-foreground/40" />
              </div>
            )}
            <span className="text-xs text-foreground/40">{course.instructor.name}</span>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center rounded-md border border-foreground/[0.1] bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">
              {episodes.length} {episodes.length === 1 ? "EPISODE" : "EPISODES"}
            </span>
            <span className="inline-flex items-center rounded-md border border-foreground/[0.1] bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">
              {duration}
            </span>
            {(course.totalPoints ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md border border-foreground/[0.1] bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground/50">
                <Sparkles className="h-3 w-3 text-primary/60" />
                {course.totalPoints} POINTS
              </span>
            )}
          </div>

          {/* Progress bar (only when started) */}
          {progress > 0 && (
            <div className="mb-4 mt-auto">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-bold text-foreground/40 uppercase tracking-wide">Progress</span>
                <span className="font-black text-primary/70">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-foreground/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* CTA button */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-center py-3 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-wider group-hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
            {progress > 0 ? "Continue" : "Watch Now"}
          </div>
        </div>
      </div>
    </Link>
  );
}
