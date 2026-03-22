"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "./progress-ring";
import { useProgress } from "@/lib/hooks/use-progress";
import { Course } from "@/data/courses";
import { getEpisodesByCourseId } from "@/data/episodes";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  const episodes = getEpisodesByCourseId(course.id);
  const { getCourseProgress } = useProgress();
  const progress = getCourseProgress(episodes);

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className={cn("group hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col", className)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          {course.posterImage ? (
            <Image
              src={course.posterImage}
              alt={course.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-muted-foreground/20">
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
        </div>
        <CardHeader>
          <CardTitle className="group-hover:text-primary transition-colors">
            {course.title}
          </CardTitle>
          <CardDescription>{course.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{course.durationWeeks} weeks</span>
            <span>•</span>
            <span>{episodes.length} episodes</span>
          </div>
        </CardContent>
        <CardFooter>
          <Badge variant="outline" className="w-full justify-center">
            View Course
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
