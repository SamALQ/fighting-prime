import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  if (!episodeId) return NextResponse.json({ average: 0, count: 0 });

  const { data: { user } } = await supabase.auth.getUser();

  const { data: ratings } = await supabase
    .from("episode_ratings")
    .select("rating, user_id")
    .eq("episode_id", episodeId);

  const all = ratings ?? [];
  const avg = all.length > 0 ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
  const userRating = user ? all.find((r) => r.user_id === user.id)?.rating ?? null : null;

  return NextResponse.json({
    average: Math.round(avg * 10) / 10,
    count: all.length,
    userRating,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { episodeId, rating } = await request.json();
  if (!episodeId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "episodeId and rating (1-5) required" }, { status: 400 });
  }

  const { error } = await supabase.from("episode_ratings").upsert({
    user_id: user.id,
    episode_id: episodeId,
    rating: Math.round(rating),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,episode_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
