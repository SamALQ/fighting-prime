"use client";

import { useState } from "react";
import { courses } from "@/data/courses";
import { episodes } from "@/data/episodes";
import { useProgress } from "@/lib/hooks/use-progress";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Tab = "in-progress" | "not-started" | "completed";

export function MyCourses() {
  const { userStats, getCourseProgress, isLoading } = useProgress();
  const [activeTab, setActiveTab] = useState<Tab>("in-progress");

  if (isLoading) return <div className="h-64 bg-muted/50 animate-pulse rounded-2xl" />;

  const userCourses = courses.map(course => ({
    ...course,
    progress: getCourseProgress(episodes.filter(e => e.courseId === course.id)),
    isStarted: userStats.coursesStarted.includes(course.id)
  }));

  const filteredCourses = userCourses.filter(course => {
    if (activeTab === "in-progress") return course.isStarted && course.progress < 100;
    if (activeTab === "not-started") return !course.isStarted;
    if (activeTab === "completed") return course.progress === 100;
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex bg-muted/50 p-1 rounded-xl w-fit">
        {[
          { id: "in-progress", label: "In Progress" },
          { id: "not-started", label: "Not Started" },
          { id: "completed", label: "Completed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-primary/50 transition-all"
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
                        <p className="text-sm text-muted-foreground">by Jake Peacock</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-muted-foreground">
                          {episodes.filter(e => e.courseId === course.id).length} episodes
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{course.progress}%</span>
                      </div>
                      <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link href={`/courses/${course.slug}`}>
                      <Button className="w-full md:w-fit gap-2 h-12 px-8 text-base font-bold bg-primary hover:bg-primary/90">
                        <Play className="h-5 w-5 fill-current" />
                        {course.progress === 0 ? "Start Course" : "Continue Course"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No courses found in this category.</p>
            {activeTab === "not-started" ? null : (
              <Link href="/courses" className="mt-4 inline-block">
                <Button variant="outline">Browse Courses</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




