import { fetchCourses, fetchEpisodes } from "@/lib/db";
import { CoursesClient } from "./courses-client";

export default async function CoursesPage() {
  const [courses, episodes] = await Promise.all([
    fetchCourses(),
    fetchEpisodes(),
  ]);

  return <CoursesClient courses={courses} episodes={episodes} />;
}
