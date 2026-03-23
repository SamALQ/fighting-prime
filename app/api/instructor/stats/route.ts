import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id, display_name, approved")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!instructor) {
    return NextResponse.json({ error: "Not an instructor" }, { status: 403 });
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, cover_image")
    .eq("instructor_id", instructor.id)
    .order("sort_order");

  const courseIds = (courses ?? []).map((c) => c.id);

  const { data: episodes } = courseIds.length > 0
    ? await supabase
        .from("episodes")
        .select("id, title, slug, course_id, duration_seconds, episode_order")
        .in("course_id", courseIds)
        .order("episode_order")
    : { data: [] };

  // Aggregated watch time from watch_time_daily
  const { data: dailyStats } = courseIds.length > 0
    ? await supabase
        .from("watch_time_daily")
        .select("date, course_id, episode_id, unique_viewers, total_seconds")
        .eq("instructor_id", instructor.id)
        .order("date", { ascending: false })
        .limit(500)
    : { data: [] };

  // Real-time totals from watch_events (for today + not-yet-aggregated data)
  const { data: realtimeTotals } = courseIds.length > 0
    ? await supabase
        .from("watch_events")
        .select("course_id, episode_id, watch_seconds")
        .eq("instructor_id", instructor.id)
    : { data: [] };

  // Compute totals
  let totalWatchSeconds = 0;
  let totalViews = 0;
  const courseStats: Record<string, { watchSeconds: number; viewers: number }> = {};
  const episodeStats: Record<string, { watchSeconds: number; viewers: number }> = {};

  for (const row of dailyStats ?? []) {
    const seconds = Number(row.total_seconds);
    const viewers = row.unique_viewers;
    totalWatchSeconds += seconds;
    totalViews += viewers;

    if (!courseStats[row.course_id]) courseStats[row.course_id] = { watchSeconds: 0, viewers: 0 };
    courseStats[row.course_id].watchSeconds += seconds;
    courseStats[row.course_id].viewers += viewers;

    if (!episodeStats[row.episode_id]) episodeStats[row.episode_id] = { watchSeconds: 0, viewers: 0 };
    episodeStats[row.episode_id].watchSeconds += seconds;
    episodeStats[row.episode_id].viewers += viewers;
  }

  // Add real-time watch events not yet in daily aggregation
  for (const row of realtimeTotals ?? []) {
    const seconds = Number(row.watch_seconds);
    if (!courseStats[row.course_id]) courseStats[row.course_id] = { watchSeconds: 0, viewers: 0 };
    if (!episodeStats[row.episode_id]) episodeStats[row.episode_id] = { watchSeconds: 0, viewers: 0 };
  }

  // Build the last 30 days timeline from daily stats
  const timeline: { date: string; seconds: number; viewers: number }[] = [];
  const byDate: Record<string, { seconds: number; viewers: number }> = {};
  for (const row of dailyStats ?? []) {
    if (!byDate[row.date]) byDate[row.date] = { seconds: 0, viewers: 0 };
    byDate[row.date].seconds += Number(row.total_seconds);
    byDate[row.date].viewers += row.unique_viewers;
  }
  const sortedDates = Object.keys(byDate).sort();
  for (const date of sortedDates.slice(-30)) {
    timeline.push({ date, ...byDate[date] });
  }

  return NextResponse.json({
    instructor,
    courses: courses ?? [],
    episodes: episodes ?? [],
    totals: {
      watchSeconds: totalWatchSeconds,
      views: totalViews,
      courses: courseIds.length,
      episodes: (episodes ?? []).length,
    },
    courseStats,
    episodeStats,
    timeline,
  });
}
