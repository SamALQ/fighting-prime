import { fetchCourses, fetchEpisodes } from "@/lib/db";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const [courses, episodes] = await Promise.all([
    fetchCourses(),
    fetchEpisodes(),
  ]);

  return <DashboardClient courses={courses} episodes={episodes} />;
}
