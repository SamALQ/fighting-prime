import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const { data: progressRows } = await supabase
    .from("user_progress")
    .select("user_id, watch_time_seconds, completed");

  const userMap = new Map<
    string,
    { watchTime: number; completedEpisodes: number }
  >();

  for (const row of progressRows ?? []) {
    const entry = userMap.get(row.user_id) ?? { watchTime: 0, completedEpisodes: 0 };
    entry.watchTime += row.watch_time_seconds ?? 0;
    if (row.completed) entry.completedEpisodes++;
    userMap.set(row.user_id, entry);
  }

  const { data: assignmentRows } = await supabase
    .from("assignment_submissions")
    .select("user_id, points_awarded, status")
    .eq("status", "approved");

  const assignmentMap = new Map<string, { points: number; count: number }>();
  for (const row of assignmentRows ?? []) {
    const entry = assignmentMap.get(row.user_id) ?? { points: 0, count: 0 };
    entry.points += row.points_awarded ?? 0;
    entry.count++;
    assignmentMap.set(row.user_id, entry);
  }

  const allUserIds = new Set([...userMap.keys(), ...assignmentMap.keys()]);
  const leaderboard: {
    userId: string;
    totalPoints: number;
    level: number;
    watchTime: number;
    completedEpisodes: number;
    assignmentsApproved: number;
  }[] = [];

  for (const userId of allUserIds) {
    const progress = userMap.get(userId) ?? { watchTime: 0, completedEpisodes: 0 };
    const assignments = assignmentMap.get(userId) ?? { points: 0, count: 0 };

    const watchPoints = Math.floor(progress.watchTime * 0.5);
    const completionPoints = progress.completedEpisodes * 100;
    const totalPoints = watchPoints + completionPoints + assignments.points;

    if (totalPoints > 0) {
      leaderboard.push({
        userId,
        totalPoints,
        level: Math.floor(totalPoints / 1000) + 1,
        watchTime: progress.watchTime,
        completedEpisodes: progress.completedEpisodes,
        assignmentsApproved: assignments.count,
      });
    }
  }

  leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
  const top = leaderboard.slice(0, limit);

  if (top.length > 0) {
    const ids = top.map((u) => u.userId);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", ids);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { name: p.full_name, role: p.role }])
    );

    const result = top.map((entry, i) => {
      const profile = profileMap.get(entry.userId);
      return {
        rank: i + 1,
        displayName: profile?.name || "Fighter",
        role: profile?.role || "user",
        ...entry,
      };
    });

    return NextResponse.json(result);
  }

  return NextResponse.json([]);
}
