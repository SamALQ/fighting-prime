import { NextRequest, NextResponse } from "next/server";
import { fetchCourses, fetchEpisodes } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ courses: [], episodes: [], discussions: [] });
  }

  const lower = q.toLowerCase();

  const [allCourses, allEpisodes] = await Promise.all([
    fetchCourses(),
    fetchEpisodes(),
  ]);

  const courses = allCourses
    .filter((c) => c.title.toLowerCase().includes(lower) || c.tagline.toLowerCase().includes(lower))
    .slice(0, 5)
    .map((c) => ({ id: c.id, title: c.title, slug: c.slug, thumbnail: c.coverImage }));

  const episodes = allEpisodes
    .filter((e) =>
      e.title.toLowerCase().includes(lower) ||
      e.description.toLowerCase().includes(lower) ||
      e.keyTakeaways.some((k) => k.toLowerCase().includes(lower))
    )
    .slice(0, 8)
    .map((e) => ({ id: e.id, title: e.title, slug: e.slug, courseId: e.courseId }));

  const courseMap = new Map(allCourses.map((c) => [c.id, c.slug]));
  const episodesWithCourse = episodes.map((e) => ({
    ...e,
    courseSlug: courseMap.get(e.courseId) ?? "",
  }));

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("discussion_posts")
    .select("id, title, category, created_at")
    .eq("is_deleted", false)
    .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    courses,
    episodes: episodesWithCourse,
    discussions: posts ?? [],
  });
}
