"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { CourseCard } from "@/components/ui/course-card";
import type { Course, Difficulty } from "@/data/courses";
import type { Episode } from "@/data/episodes";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CoursesClientProps {
  courses: Course[];
  episodes: Episode[];
}

export function CoursesClient({ courses, episodes }: CoursesClientProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const episodesByCourse = useMemo(() => {
    const map: Record<string, Episode[]> = {};
    for (const ep of episodes) {
      if (!map[ep.courseId]) map[ep.courseId] = [];
      map[ep.courseId].push(ep);
    }
    return map;
  }, [episodes]);

  const filteredCourses = courses.filter((course) => {
    const matchesDifficulty = selectedDifficulty === "All" || course.difficulty === selectedDifficulty;
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced", "Professional"] as const;

  return (
    <MainLayout>
      <Section>
        <div className="mb-12">
          <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
            Training Library
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Courses</h1>
          <p className="text-foreground/50 text-lg">
            Master Muay Thai with structured courses from beginner to advanced
          </p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md h-11"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                selectedDifficulty === difficulty
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border border-foreground/[0.08] text-foreground/50 hover:text-foreground hover:border-foreground/20"
              )}
            >
              {difficulty}
            </button>
          ))}
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                episodes={episodesByCourse[course.id] ?? []}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-foreground/[0.08] rounded-2xl">
            <p className="text-foreground/40">No courses found matching your criteria.</p>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}
