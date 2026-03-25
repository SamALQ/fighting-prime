import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAchievements, type UserProgressSnapshot } from "@/lib/achievements";
import { createNotification } from "@/lib/notifications";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { getLevelFromPoints } from "@/lib/gamification";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ achievements: [] });
  }

  const { data: rows } = await supabase
    .from("user_achievements")
    .select("achievement_id, unlocked_at")
    .eq("user_id", user.id);

  return NextResponse.json({
    achievements: (rows ?? []).map((r) => ({
      id: r.achievement_id,
      unlockedAt: r.unlocked_at,
    })),
  });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    progressResult,
    assignmentResult,
    streakResult,
    courseResult,
    discussionResult,
    eliteResult,
    existingAchievements,
  ] = await Promise.all([
    supabase
      .from("user_progress")
      .select("episode_id, percent_watched, watch_time_seconds, completed")
      .eq("user_id", user.id),
    supabase
      .from("assignment_submissions")
      .select("id, status")
      .eq("user_id", user.id),
    supabase
      .from("user_streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_course_progress")
      .select("course_id")
      .eq("user_id", user.id),
    supabase
      .from("discussion_posts")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .limit(1),
    supabase
      .from("elite_submissions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "responded")
      .limit(1),
    supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user.id),
  ]);

  const progress = progressResult.data ?? [];
  const completedEpisodes = progress.filter((p) => p.completed).length;
  const totalWatch = progress.reduce((s, p) => s + (p.watch_time_seconds ?? 0), 0);
  const assignments = assignmentResult.data ?? [];
  const submitted = assignments.filter((a) => a.status !== "uploading").length;
  const approved = assignments.filter((a) => a.status === "approved").length;

  const watchPoints = Math.floor(totalWatch * 0.5);
  const completionPoints = completedEpisodes * 100;
  const assignmentPoints = assignments.reduce(
    (s, a) => s + ((a as Record<string, unknown>).points_awarded as number ?? 0), 0
  );
  const totalPoints = watchPoints + completionPoints + assignmentPoints;

  const snapshot: UserProgressSnapshot = {
    completedEpisodes,
    totalWatchTimeSeconds: totalWatch,
    currentStreak: streakResult.data?.current_streak ?? 0,
    longestStreak: streakResult.data?.longest_streak ?? 0,
    assignmentsSubmitted: submitted,
    assignmentsApproved: approved,
    discussionPosts: (discussionResult.data ?? []).length,
    eliteFeedbackReceived: (eliteResult.data ?? []).length,
    coursesStarted: (courseResult.data ?? []).length,
    totalPoints,
    level: getLevelFromPoints(totalPoints),
  };

  const alreadyUnlocked = new Set(
    (existingAchievements.data ?? []).map((a) => a.achievement_id)
  );

  const newlyUnlocked = checkAchievements(snapshot, alreadyUnlocked);

  if (newlyUnlocked.length > 0) {
    await supabase.from("user_achievements").insert(
      newlyUnlocked.map((achievementId) => ({
        user_id: user.id,
        achievement_id: achievementId,
      }))
    );

    for (const id of newlyUnlocked) {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) {
        createNotification({
          userId: user.id,
          type: "achievement_unlocked",
          title: `Achievement unlocked: ${def.title}!`,
          body: def.description,
          link: "/dashboard",
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({
    newlyUnlocked,
    allUnlocked: [...alreadyUnlocked, ...newlyUnlocked],
    snapshot,
  });
}
