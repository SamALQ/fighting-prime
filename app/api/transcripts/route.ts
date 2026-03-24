import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const episodeId = request.nextUrl.searchParams.get("episodeId");
  if (!episodeId) return NextResponse.json({ transcript: null });

  const { data } = await supabase
    .from("episode_transcripts")
    .select("episode_id, content, segments, language")
    .eq("episode_id", episodeId)
    .maybeSingle();

  return NextResponse.json({ transcript: data });
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

  const { episodeId, content, segments, language } = await request.json();
  if (!episodeId || !content) {
    return NextResponse.json({ error: "episodeId and content required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("episode_transcripts")
    .upsert({
      episode_id: episodeId,
      content,
      segments: segments ?? [],
      language: language ?? "en",
      updated_at: new Date().toISOString(),
    }, { onConflict: "episode_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ transcript: data });
}
