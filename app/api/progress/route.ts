import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ episodes: {}, stats: defaultStats() });
  }

  const { data: progressRows } = await supabase
    .from("user_progress")
    .select("episode_id, percent_watched, watch_time_seconds, completed")
    .eq("user_id", user.id);

  const episodes: Record<
    string,
    { percent: number; watchTime: number; completed: boolean }
  > = {};
  let totalWatchTime = 0;
  let completedCount = 0;

  for (const row of progressRows ?? []) {
    episodes[row.episode_id] = {
      percent: row.percent_watched ?? 0,
      watchTime: row.watch_time_seconds ?? 0,
      completed: row.completed ?? false,
    };
    totalWatchTime += row.watch_time_seconds ?? 0;
    if (row.completed) completedCount++;
  }

  const watchPoints = Math.floor(totalWatchTime * 0.5);
  const completionPoints = completedCount * 100;
  const totalPoints = watchPoints + completionPoints;

  const { data: courseProgressRows } = await supabase
    .from("user_course_progress")
    .select("course_id")
    .eq("user_id", user.id);

  const coursesStarted = (courseProgressRows ?? []).map((r) => r.course_id);

  return NextResponse.json({
    episodes,
    stats: {
      totalPoints,
      level: Math.floor(totalPoints / 1000) + 1,
      totalWatchTime,
      completedCount,
      coursesStarted,
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { episodeId, percent, watchTimeSeconds, courseId } = body;

  if (!episodeId) {
    return NextResponse.json(
      { error: "episodeId is required" },
      { status: 400 }
    );
  }

  const completed = (percent ?? 0) >= 95;

  const { data: existing } = await supabase
    .from("user_progress")
    .select("percent_watched, watch_time_seconds, completed")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .maybeSingle();

  const bestPercent = Math.max(percent ?? 0, existing?.percent_watched ?? 0);
  const bestWatch = Math.max(
    watchTimeSeconds ?? 0,
    existing?.watch_time_seconds ?? 0
  );
  const wasCompleted = existing?.completed ?? false;
  const nowCompleted = completed || wasCompleted;

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      episode_id: episodeId,
      percent_watched: bestPercent,
      watch_time_seconds: bestWatch,
      completed: nowCompleted,
      completed_at:
        nowCompleted && !wasCompleted ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,episode_id" }
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to save progress", detail: error.message },
      { status: 500 }
    );
  }

  if (courseId) {
    const { data: existingCourse } = await supabase
      .from("user_course_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!existingCourse) {
      await supabase.from("user_course_progress").insert({
        user_id: user.id,
        course_id: courseId,
        started_at: new Date().toISOString(),
        status: "in_progress",
      });
    }
  }

  return NextResponse.json({ success: true });
}

function defaultStats() {
  return {
    totalPoints: 0,
    level: 1,
    totalWatchTime: 0,
    completedCount: 0,
    coursesStarted: [] as string[],
  };
}
