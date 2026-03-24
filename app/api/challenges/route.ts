import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .order("start_date", { ascending: false });

  if (!user || !challenges?.length) {
    return NextResponse.json({ challenges: challenges ?? [] });
  }

  const { data: progress } = await supabase
    .from("user_challenge_progress")
    .select("challenge_id, completed, completed_at")
    .eq("user_id", user.id);

  const progressMap = new Map((progress ?? []).map((p) => [p.challenge_id, p]));

  const enriched = (challenges ?? []).map((c) => ({
    ...c,
    userProgress: progressMap.get(c.id) ?? null,
  }));

  return NextResponse.json({ challenges: enriched });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId, action } = await request.json();

  if (action === "join") {
    const { error } = await supabase
      .from("user_challenge_progress")
      .upsert({
        user_id: user.id,
        challenge_id: challengeId,
        progress: {},
        completed: false,
      }, { onConflict: "user_id,challenge_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
