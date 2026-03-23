"use client";

import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { CourseCard } from "@/components/ui/course-card";
import type { Course, Difficulty } from "@/data/courses";
import type { Episode } from "@/data/episodes";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

  return (
    <MainLayout>
      <Section>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">All Courses</h1>
          <p className="text-muted-foreground">
            Master Muay Thai with structured courses from beginner to advanced
          </p>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {(["All", "Beginner", "Intermediate", "Advanced", "Professional"] as const).map((difficulty) => (
            <Badge
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </Badge>
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}
