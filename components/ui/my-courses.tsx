"use client";

import { useState, useMemo } from "react";
import type { Course } from "@/data/courses";
import type { Episode } from "@/data/episodes";
import { useProgress } from "@/lib/hooks/use-progress";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Tab = "in-progress" | "not-started" | "completed";

interface MyCoursesProps {
  courses: Course[];
  episodes: Episode[];
}

export function MyCourses({ courses, episodes }: MyCoursesProps) {
  const { userStats, getCourseProgress, isLoading } = useProgress();
  const [activeTab, setActiveTab] = useState<Tab>("in-progress");

  const episodesByCourse = useMemo(() => {
    const map: Record<string, Episode[]> = {};
    for (const ep of episodes) {
      if (!map[ep.courseId]) map[ep.courseId] = [];
      map[ep.courseId].push(ep);
    }
    return map;
  }, [episodes]);

  if (isLoading) return <div className="h-64 bg-foreground/[0.03] animate-pulse rounded-2xl border border-foreground/[0.06]" />;

  const userCourses = courses.map((course) => ({
    ...course,
    progress: getCourseProgress(episodesByCourse[course.id] ?? []),
    isStarted: userStats.coursesStarted.includes(course.id),
  }));

  const filteredCourses = userCourses.filter((course) => {
    if (activeTab === "in-progress") return course.isStarted && course.progress < 100;
    if (activeTab === "not-started") return !course.isStarted;
    if (activeTab === "completed") return course.progress === 100;
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex p-1 rounded-full border border-foreground/[0.08] bg-foreground/[0.02] w-fit">
        {[
          { id: "in-progress", label: "In Progress" },
          { id: "not-started", label: "Not Started" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "text-foreground/40 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const courseEpisodes = episodesByCourse[course.id] ?? [];
            return (
              <div
                key={course.id}
                className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden group hover:border-primary/20 transition-all"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-64 aspect-video md:aspect-square overflow-hidden">
                    <Image
                      src={course.posterImage || course.difficultyMeterImage || course.coverImage}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold uppercase tracking-tight leading-none mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-foreground/40">by Jake Peacock</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-foreground/30">
                            {courseEpisodes.length} episodes
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Progress</span>
                          <span className="font-bold">{course.progress}%</span>
                        </div>
                        <div className="relative h-3 w-full bg-foreground/[0.06] rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Link href={`/courses/${course.slug}`}>
                        <Button className="w-full md:w-fit gap-2 h-12 px-8 text-base font-bold shadow-lg shadow-primary/25">
                          <Play className="h-5 w-5 fill-current" />
                          {course.progress === 0 ? "Start Course" : "Continue Course"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 border border-dashed border-foreground/[0.08] rounded-2xl">
            <p className="text-foreground/40">No courses found in this category.</p>
            {activeTab === "not-started" ? null : (
              <Link href="/courses" className="mt-4 inline-block">
                <Button variant="outline" className="border-foreground/[0.08]">Browse Courses</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
