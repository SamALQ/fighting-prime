import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin")
    return { supabase: null, error: "Forbidden" };

  return { supabase, error: null };
}

export async function GET(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const courseId = request.nextUrl.searchParams.get("courseId");

  let query = supabase
    .from("episodes")
    .select("*")
    .order("episode_order");

  if (courseId) query = query.eq("course_id", courseId);

  const { data } = await query;
  return NextResponse.json({ episodes: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();

  const { data, error: dbError } = await supabase
    .from("episodes")
    .insert({
      slug: body.slug,
      course_id: body.courseId,
      title: body.title,
      episode_order: body.order ?? 0,
      is_free: body.isFree ?? false,
      premium: body.premium ?? false,
      video_url: body.videoUrl ?? "",
      duration_seconds: body.durationSeconds ?? 0,
      key_takeaways: body.keyTakeaways ?? [],
      release_date: body.releaseDate ?? null,
      has_assignment: body.hasAssignment ?? false,
      assignment_points: body.assignmentPoints ?? 0,
      thumbnail: body.thumbnail ?? "",
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ episode: data });
}

export async function PATCH(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (fields.slug !== undefined) updates.slug = fields.slug;
  if (fields.courseId !== undefined) updates.course_id = fields.courseId;
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.order !== undefined) updates.episode_order = fields.order;
  if (fields.isFree !== undefined) updates.is_free = fields.isFree;
  if (fields.premium !== undefined) updates.premium = fields.premium;
  if (fields.videoUrl !== undefined) updates.video_url = fields.videoUrl;
  if (fields.durationSeconds !== undefined) updates.duration_seconds = fields.durationSeconds;
  if (fields.keyTakeaways !== undefined) updates.key_takeaways = fields.keyTakeaways;
  if (fields.releaseDate !== undefined) updates.release_date = fields.releaseDate;
  if (fields.hasAssignment !== undefined) updates.has_assignment = fields.hasAssignment;
  if (fields.assignmentPoints !== undefined) updates.assignment_points = fields.assignmentPoints;
  if (fields.thumbnail !== undefined) updates.thumbnail = fields.thumbnail;

  const { data, error: dbError } = await supabase
    .from("episodes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ episode: data });
}

export async function DELETE(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error: dbError } = await supabase
    .from("episodes")
    .delete()
    .eq("id", body.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
