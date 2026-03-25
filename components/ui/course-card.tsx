"use client";

import Link from "next/link";
import Image from "next/image";
import { useProgress } from "@/lib/hooks/use-progress";
import type { Course, Difficulty } from "@/data/courses";
import type { Episode } from "@/data/episodes";
import { cn } from "@/lib/utils";
import { Sparkles, User, Play } from "lucide-react";
import { useMemo } from "react";

interface CourseCardProps {
  course: Course;
  episodes: Episode[];
  className?: string;
}

const difficultyConfig: Record<Difficulty, { color: string; glow: string; dots: number }> = {
  Beginner: { color: "bg-green-500", glow: "shadow-green-500/30", dots: 1 },
  Intermediate: { color: "bg-yellow-500", glow: "shadow-yellow-500/30", dots: 2 },
  Advanced: { color: "bg-red-500", glow: "shadow-red-500/30", dots: 3 },
  Professional: { color: "bg-purple-500", glow: "shadow-purple-500/30", dots: 4 },
};

function formatTotalDuration(episodes: Episode[]): string {
  const totalSec = episodes.reduce((s, e) => s + e.durationSeconds, 0);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  return `${minutes}m`;
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

  return (
    <Link href={`/courses/${course.slug}`} className={cn("group block", className)}>
      <div className="relative rounded-2xl overflow-hidden h-full bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-500">
        {/* Full-bleed poster — cinematic ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          {(course.posterImage || course.coverImage) ? (
            <Image
              src={course.posterImage || course.coverImage}
              alt={course.title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-110"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[#0a0a0a] to-[#0a0a0a]" />
          )}

          {/* Cinematic gradient overlay — heavier at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

          {/* Subtle vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />

          {/* Accent glow on hover — emanates from bottom */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/0 group-hover:bg-primary/20 rounded-full blur-3xl transition-all duration-700" />

          {/* Top badge row */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-start justify-between">
            {newRelease && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 text-[10px] font-black uppercase tracking-wider text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                New
              </span>
            )}
            {(course.totalPoints ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/70 ml-auto">
                <Sparkles className="h-3 w-3 text-primary" />
                {course.totalPoints}
              </span>
            )}
          </div>

          {/* Play icon on hover */}
          <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="h-14 w-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-2xl shadow-primary/40 scale-75 group-hover:scale-100 transition-transform duration-500">
              <Play className="h-6 w-6 text-white fill-white ml-0.5" />
            </div>
          </div>

          {/* Bottom content zone — sits on the gradient */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-5 pb-4">
            {/* Difficulty */}
            <div className="flex items-end gap-2 mb-2.5">
              {course.difficultyMeterImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.difficultyMeterImage}
                  alt={`${course.difficulty} difficulty`}
                  width={80}
                  height={20}
                  className="block h-5 w-auto shrink-0 object-contain object-bottom drop-shadow-lg"
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
                        i < diff.dots ? diff.color : "bg-white/[0.15]"
                      )}
                    />
                  ))}
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 leading-none">
                {course.difficulty}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-black text-[22px] uppercase tracking-tight leading-[1.1] text-white mb-2 drop-shadow-lg group-hover:text-primary transition-colors duration-300">
              {course.title}
            </h3>

            {/* Tagline */}
            <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2 mb-3">
              {course.tagline}
            </p>

            {/* Divider */}
            <div className="w-10 h-[2px] bg-primary mb-3 group-hover:w-16 transition-all duration-500" />

            {/* Meta row */}
            <div className="flex items-center gap-3 text-[11px] text-white/35">
              {/* Instructor */}
              <div className="flex items-center gap-1.5">
                {course.instructor.image ? (
                  <Image
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    width={18}
                    height={18}
                    className="rounded-full object-cover ring-1 ring-white/10"
                    unoptimized
                  />
                ) : (
                  <div className="h-[18px] w-[18px] rounded-full bg-white/[0.08] flex items-center justify-center ring-1 ring-white/10">
                    <User className="h-2.5 w-2.5 text-white/40" />
                  </div>
                )}
                <span className="font-medium">{course.instructor.name}</span>
              </div>

              <span className="text-white/15">|</span>
              <span className="font-semibold">{episodes.length} ep</span>
              <span className="text-white/15">|</span>
              <span className="font-semibold">{duration}</span>
            </div>
          </div>
        </div>

        {/* Progress strip — sits flush below the poster */}
        {progress > 0 ? (
          <div className="px-4 py-3 bg-[#0a0a0a]">
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="font-bold uppercase tracking-widest text-white/30">Progress</span>
              <span className="font-black text-primary tabular-nums">{progress}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
      </div>
    </Link>
  );
}
