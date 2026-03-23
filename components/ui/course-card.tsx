"use client";

import Link from "next/link";
import Image from "next/image";
import { ProgressRing } from "./progress-ring";
import { useProgress } from "@/lib/hooks/use-progress";
import type { Course } from "@/data/courses";
import type { Episode } from "@/data/episodes";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface CourseCardProps {
  course: Course;
  episodes: Episode[];
  className?: string;
}

export function CourseCard({ course, episodes, className }: CourseCardProps) {
  const { getCourseProgress } = useProgress();
  const progress = getCourseProgress(episodes);

  return (
    <Link href={`/courses/${course.slug}`}>
      <div
        className={cn(
          "group rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col",
          className
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden">
          {course.posterImage ? (
            <Image
              src={course.posterImage}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-background" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-foreground/[0.06]">
                  {course.title.charAt(0)}
                </span>
              </div>
            </>
          )}
          {course.difficultyMeterImage && (
            <div className="absolute top-4 right-4 z-10">
              <Image
                src={course.difficultyMeterImage}
                alt={`${course.difficulty} difficulty`}
                width={80}
                height={20}
                className="h-5 w-auto object-contain"
                unoptimized
              />
            </div>
          )}
          {progress > 0 && (
            <div className="absolute bottom-4 left-4 z-10">
              <ProgressRing progress={progress} size={40} strokeWidth={3} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors leading-tight">
            {course.title}
          </h3>
          <p className="text-sm text-foreground/50 mb-4 line-clamp-2">{course.tagline}</p>
          <div className="flex items-center gap-4 text-xs text-foreground/40 mt-auto">
            <span>{course.durationWeeks} weeks</span>
            <span>&bull;</span>
            <span>{episodes.length} episodes</span>
          </div>
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-foreground/[0.08] text-xs font-bold uppercase tracking-wider text-foreground/50 group-hover:border-primary/30 group-hover:text-primary transition-all">
            View Course
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
