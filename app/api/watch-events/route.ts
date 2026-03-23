import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const events: { episodeId: string; courseId: string; watchSeconds: number }[] =
    body.events;

  if (!Array.isArray(events) || events.length === 0) {
    return NextResponse.json({ error: "No events" }, { status: 400 });
  }

  const courseIds = [...new Set(events.map((e) => e.courseId))];
  const { data: courseRows } = await supabase
    .from("courses")
    .select("id, instructor_id")
    .in("id", courseIds);

  const instructorMap: Record<string, string | null> = {};
  for (const row of courseRows ?? []) {
    instructorMap[row.id] = row.instructor_id ?? null;
  }

  const rows = events
    .filter((e) => e.watchSeconds > 0)
    .map((e) => ({
      user_id: user.id,
      episode_id: e.episodeId,
      course_id: e.courseId,
      instructor_id: instructorMap[e.courseId] ?? null,
      watch_seconds: Math.round(e.watchSeconds * 100) / 100,
    }));

  if (rows.length > 0) {
    await supabase.from("watch_events").insert(rows);
  }

  return NextResponse.json({ success: true, count: rows.length });
}
