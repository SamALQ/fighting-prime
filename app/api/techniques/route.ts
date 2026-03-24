import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const category = request.nextUrl.searchParams.get("category");
  const q = request.nextUrl.searchParams.get("q");

  let query = supabase
    .from("techniques")
    .select("*")
    .order("name", { ascending: true });

  if (category) query = query.eq("category", category);
  if (q) query = query.ilike("name", `%${q}%`);

  const { data } = await query.limit(100);

  return NextResponse.json({ techniques: data ?? [] });
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

  const body = await request.json();
  const { name, category, description, keyPoints, relatedEpisodeIds, videoClipUrl } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const { data, error } = await supabase
    .from("techniques")
    .insert({
      name: name.trim(),
      category: category || "general",
      description: (description ?? "").slice(0, 2000),
      key_points: keyPoints ?? [],
      related_episode_ids: relatedEpisodeIds ?? [],
      video_clip_url: videoClipUrl ?? "",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ technique: data });
}
