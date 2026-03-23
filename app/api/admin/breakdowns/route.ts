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

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const { data } = await supabase
    .from("breakdowns")
    .select("*")
    .order("release_date", { ascending: false });

  return NextResponse.json({ breakdowns: data ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();

  const { data, error: dbError } = await supabase
    .from("breakdowns")
    .insert({
      slug: body.slug,
      title: body.title,
      description: body.description ?? "",
      video_url: body.videoUrl ?? "",
      thumbnail: body.thumbnail ?? "",
      release_date: body.releaseDate ?? new Date().toISOString().slice(0, 10),
      author: body.author ?? "",
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ breakdown: data });
}

export async function PATCH(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (fields.slug !== undefined) updates.slug = fields.slug;
  if (fields.title !== undefined) updates.title = fields.title;
  if (fields.description !== undefined) updates.description = fields.description;
  if (fields.videoUrl !== undefined) updates.video_url = fields.videoUrl;
  if (fields.thumbnail !== undefined) updates.thumbnail = fields.thumbnail;
  if (fields.releaseDate !== undefined) updates.release_date = fields.releaseDate;
  if (fields.author !== undefined) updates.author = fields.author;

  const { data, error: dbError } = await supabase
    .from("breakdowns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ breakdown: data });
}

export async function DELETE(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error: dbError } = await supabase
    .from("breakdowns")
    .delete()
    .eq("id", body.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
