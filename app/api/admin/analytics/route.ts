import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function GET() {
  const supabase = await createClient();
  const admin = await requireAdmin(supabase);

  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const [
    usersResult,
    subsResult,
    progressResult,
    assignmentsResult,
    eliteResult,
    postsResult,
    repliesResult,
  ] = await Promise.all([
    supabase.from("profiles").select("id, role, created_at"),
    supabase.from("subscriptions").select("id, plan, status, created_at"),
    supabase.from("user_progress").select("user_id, watch_time_seconds, completed, episode_id"),
    supabase.from("assignment_submissions").select("id, status, created_at"),
    supabase.from("elite_submissions").select("id, status, created_at"),
    supabase.from("discussion_posts").select("id, created_at").eq("is_deleted", false),
    supabase.from("discussion_replies").select("id, created_at").eq("is_deleted", false),
  ]);

  const users = usersResult.data ?? [];
  const subs = subsResult.data ?? [];
  const progress = progressResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const elite = eliteResult.data ?? [];
  const posts = postsResult.data ?? [];
  const replies = repliesResult.data ?? [];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  const activeSubs = subs.filter((s) => s.status === "active" || s.status === "trialing");
  const athleteProSubs = activeSubs.filter((s) => s.plan === "athlete_pro").length;
  const fighterEliteSubs = activeSubs.filter((s) => s.plan === "fighter_elite").length;

  const uniqueWatchers = new Set(progress.map((p) => p.user_id));
  const totalWatchTime = progress.reduce((sum, p) => sum + (p.watch_time_seconds ?? 0), 0);
  const totalCompletions = progress.filter((p) => p.completed).length;
  const uniqueEpisodesWatched = new Set(progress.map((p) => p.episode_id)).size;

  const recentUsers = users.filter((u) => u.created_at >= thirtyDaysAgo).length;
  const weeklyUsers = users.filter((u) => u.created_at >= sevenDaysAgo).length;

  const assignmentsByStatus: Record<string, number> = {};
  for (const a of assignments) {
    assignmentsByStatus[a.status] = (assignmentsByStatus[a.status] ?? 0) + 1;
  }

  const eliteByStatus: Record<string, number> = {};
  for (const e of elite) {
    eliteByStatus[e.status] = (eliteByStatus[e.status] ?? 0) + 1;
  }

  const recentPosts = posts.filter((p) => p.created_at >= thirtyDaysAgo).length;
  const recentReplies = replies.filter((r) => r.created_at >= thirtyDaysAgo).length;

  return NextResponse.json({
    users: {
      total: users.length,
      instructors: users.filter((u) => u.role === "instructor").length,
      admins: users.filter((u) => u.role === "admin").length,
      newLast30Days: recentUsers,
      newLast7Days: weeklyUsers,
    },
    subscriptions: {
      totalActive: activeSubs.length,
      athletePro: athleteProSubs,
      fighterElite: fighterEliteSubs,
      total: subs.length,
    },
    engagement: {
      uniqueWatchers: uniqueWatchers.size,
      totalWatchTimeHours: Math.round(totalWatchTime / 3600),
      episodesCompleted: totalCompletions,
      uniqueEpisodesWatched,
    },
    assignments: {
      total: assignments.length,
      byStatus: assignmentsByStatus,
    },
    eliteSubmissions: {
      total: elite.length,
      byStatus: eliteByStatus,
    },
    community: {
      totalPosts: posts.length,
      totalReplies: replies.length,
      postsLast30Days: recentPosts,
      repliesLast30Days: recentReplies,
    },
  });
}
