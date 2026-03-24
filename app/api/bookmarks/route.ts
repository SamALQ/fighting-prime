import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ bookmarks: [] });

  const episodeId = request.nextUrl.searchParams.get("episodeId");

  let query = supabase
    .from("video_bookmarks")
    .select("id, episode_id, timestamp_seconds, note, created_at")
    .eq("user_id", user.id)
    .order("timestamp_seconds", { ascending: true });

  if (episodeId) query = query.eq("episode_id", episodeId);

  const { data } = await query;
  return NextResponse.json({ bookmarks: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { episodeId, timestampSeconds, note } = await request.json();
  if (!episodeId || timestampSeconds == null) {
    return NextResponse.json({ error: "episodeId and timestampSeconds required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("video_bookmarks")
    .upsert({
      user_id: user.id,
      episode_id: episodeId,
      timestamp_seconds: Math.round(timestampSeconds),
      note: (note ?? "").slice(0, 500),
    }, { onConflict: "user_id,episode_id,timestamp_seconds" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmark: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarkId = request.nextUrl.searchParams.get("id");
  if (!bookmarkId) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase
    .from("video_bookmarks")
    .delete()
    .eq("id", bookmarkId)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
