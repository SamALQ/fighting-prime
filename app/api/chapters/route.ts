import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  if (!episodeId) return NextResponse.json({ chapters: [] });

  const { data } = await supabase
    .from("episode_chapters")
    .select("id, episode_id, title, timestamp_seconds, sort_order")
    .eq("episode_id", episodeId)
    .order("sort_order", { ascending: true });

  return NextResponse.json({ chapters: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "instructor"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { episodeId, title, timestampSeconds, sortOrder } = await request.json();
  if (!episodeId || !title || timestampSeconds == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("episode_chapters")
    .insert({
      episode_id: episodeId,
      title,
      timestamp_seconds: Math.round(timestampSeconds),
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chapter: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "instructor"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const chapterId = request.nextUrl.searchParams.get("id");
  if (!chapterId) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase.from("episode_chapters").delete().eq("id", chapterId);
  return NextResponse.json({ success: true });
}
