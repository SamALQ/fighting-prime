import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStreakMultiplier } from "@/lib/achievements";
import { getLevelFromPoints } from "@/lib/gamification";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ episodes: {}, stats: defaultStats(), achievements: [] });
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

  const [courseProgressResult, assignmentResult, streakResult, recentProgressResult, achievementsResult] = await Promise.all([
    supabase
      .from("user_course_progress")
      .select("course_id")
      .eq("user_id", user.id),
    supabase
      .from("assignment_submissions")
      .select("id, episode_id, status, points_awarded")
      .eq("user_id", user.id),
    supabase
      .from("user_streaks")
      .select("current_streak, longest_streak, last_active_date")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_progress")
      .select("episode_id, percent_watched, watch_time_seconds, updated_at")
      .eq("user_id", user.id)
      .lt("percent_watched", 95)
      .gt("percent_watched", 1)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", user.id),
  ]);

  const coursesStarted = (courseProgressResult.data ?? []).map((r) => r.course_id);

  const assignments = assignmentResult.data ?? [];
  const assignmentPoints = assignments.reduce((sum, a) => sum + (a.points_awarded ?? 0), 0);
  const assignmentsSubmitted = assignments.filter((a) => a.status !== "uploading").length;
  const assignmentsApproved = assignments.filter((a) => a.status === "approved").length;

  const currentStreak = streakResult.data?.current_streak ?? 0;
  const longestStreak = streakResult.data?.longest_streak ?? 0;
  const streakMultiplier = getStreakMultiplier(currentStreak);

  const today = new Date().toISOString().split("T")[0];
  const lastActive = streakResult.data?.last_active_date;
  const isFirstWatchToday = lastActive !== today;

  const totalPoints = watchPoints + completionPoints + assignmentPoints;

  const achievements = (achievementsResult.data ?? []).map((a) => a.achievement_id);

  return NextResponse.json({
    episodes,
    stats: {
      totalPoints,
      level: getLevelFromPoints(totalPoints),
      totalWatchTime,
      completedCount,
      coursesStarted,
      assignmentsSubmitted,
      assignmentsApproved,
      assignmentPoints,
      currentStreak,
      longestStreak,
      streakMultiplier,
      isFirstWatchToday,
    },
    achievements,
    continueWatching: recentProgressResult.data ?? [],
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

  const bestPercent = Math.max(
    Number(percent ?? 0),
    Number(existing?.percent_watched ?? 0)
  );
  const bestWatch = Math.round(
    Math.max(Number(watchTimeSeconds ?? 0), Number(existing?.watch_time_seconds ?? 0))
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
      .select("user_id")
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

  const today = new Date().toISOString().split("T")[0];
  const { data: existingStreak } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_active_date")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingStreak) {
    await supabase.from("user_streaks").insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_active_date: today,
    });
  } else if (existingStreak.last_active_date !== today) {
    const lastDate = new Date(existingStreak.last_active_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / 86400000
    );

    const newStreak = diffDays === 1 ? existingStreak.current_streak + 1 : 1;
    const newLongest = Math.max(newStreak, existingStreak.longest_streak);

    await supabase
      .from("user_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);
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
