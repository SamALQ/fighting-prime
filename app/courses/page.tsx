import { fetchCourses, fetchEpisodes } from "@/lib/db";
import { CoursesClient } from "./courses-client";
import type { Course } from "@/data/courses";
import type { Episode } from "@/data/episodes";

export const dynamic = "force-dynamic";

function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default async function CoursesPage() {
  const [courses, episodes] = await Promise.all([
    withTimeout<Course[]>(fetchCourses(), []),
    withTimeout<Episode[]>(fetchEpisodes(), []),
  ]);

  return <CoursesClient courses={courses} episodes={episodes} />;
}
