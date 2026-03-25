import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLevelFromPoints } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, display_name, bio, role, avatar_url, created_at")
    .eq("id", userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [progressResult, assignmentResult, streakResult, courseProgressResult] =
    await Promise.all([
      supabase
        .from("user_progress")
        .select("episode_id, watch_time_seconds, completed")
        .eq("user_id", userId),
      supabase
        .from("assignment_submissions")
        .select("id, episode_id, status, points_awarded, created_at")
        .eq("user_id", userId),
      supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_active_date")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_course_progress")
        .select("course_id")
        .eq("user_id", userId),
    ]);

  const progressRows = progressResult.data ?? [];
  let totalWatchTime = 0;
  let completedEpisodes = 0;
  for (const row of progressRows) {
    totalWatchTime += row.watch_time_seconds ?? 0;
    if (row.completed) completedEpisodes++;
  }

  const assignments = assignmentResult.data ?? [];
  const assignmentsSubmitted = assignments.filter(
    (a) => a.status !== "uploading"
  ).length;
  const assignmentsApproved = assignments.filter(
    (a) => a.status === "approved"
  ).length;
  const assignmentPoints = assignments.reduce(
    (sum, a) => sum + (a.points_awarded ?? 0),
    0
  );

  const watchPoints = Math.floor(totalWatchTime * 0.5);
  const completionPoints = completedEpisodes * 100;
  const totalPoints = watchPoints + completionPoints + assignmentPoints;
  const level = getLevelFromPoints(totalPoints);

  const streak = streakResult.data;
  const coursesStarted = (courseProgressResult.data ?? []).length;

  return NextResponse.json({
    profile: {
      id: profile.id,
      displayName: profile.display_name || profile.full_name || "Fighter",
      bio: profile.bio || "",
      role: profile.role,
      avatarUrl: profile.avatar_url,
      joinedAt: profile.created_at,
    },
    stats: {
      totalPoints,
      level,
      totalWatchTime,
      completedEpisodes,
      coursesStarted,
      assignmentsSubmitted,
      assignmentsApproved,
      assignmentPoints,
      currentStreak: streak?.current_streak ?? 0,
      longestStreak: streak?.longest_streak ?? 0,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (typeof body.displayName === "string")
    updates.display_name = body.displayName.trim().slice(0, 50);
  if (typeof body.bio === "string")
    updates.bio = body.bio.trim().slice(0, 300);
  if (typeof body.experienceLevel === "string")
    updates.experience_level = body.experienceLevel;
  if (Array.isArray(body.trainingGoals))
    updates.training_goals = body.trainingGoals;
  if (body.onboardingCompleted === true)
    updates.onboarding_completed = true;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
