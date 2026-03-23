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

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order");

  return NextResponse.json({ courses: courses ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (!supabase) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json();

  const { data, error: dbError } = await supabase
    .from("courses")
    .insert({
      slug: body.slug,
      title: body.title,
      tagline: body.tagline ?? "",
      difficulty: body.difficulty ?? "Beginner",
      duration_weeks: body.durationWeeks ?? 0,
      featured: body.featured ?? false,
      trailer_url: body.trailerUrl ?? "",
      syllabus: body.syllabus ?? [],
      instructor_name: body.instructorName ?? "",
      instructor_title: body.instructorTitle ?? "",
      instructor_image: body.instructorImage ?? "",
      cover_image: body.coverImage ?? "",
      poster_image: body.posterImage ?? "",
      difficulty_meter_image: body.difficultyMeterImage ?? "",
      learning_outcomes: body.learningOutcomes ?? [],
      released: body.released ?? false,
      release_date: body.releaseDate ?? null,
      total_points: body.totalPoints ?? 0,
      sort_order: body.sortOrder ?? 0,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ course: data });
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
  if (fields.tagline !== undefined) updates.tagline = fields.tagline;
  if (fields.difficulty !== undefined) updates.difficulty = fields.difficulty;
  if (fields.durationWeeks !== undefined) updates.duration_weeks = fields.durationWeeks;
  if (fields.featured !== undefined) updates.featured = fields.featured;
  if (fields.trailerUrl !== undefined) updates.trailer_url = fields.trailerUrl;
  if (fields.syllabus !== undefined) updates.syllabus = fields.syllabus;
  if (fields.instructorName !== undefined) updates.instructor_name = fields.instructorName;
  if (fields.instructorTitle !== undefined) updates.instructor_title = fields.instructorTitle;
  if (fields.instructorImage !== undefined) updates.instructor_image = fields.instructorImage;
  if (fields.coverImage !== undefined) updates.cover_image = fields.coverImage;
  if (fields.posterImage !== undefined) updates.poster_image = fields.posterImage;
  if (fields.difficultyMeterImage !== undefined) updates.difficulty_meter_image = fields.difficultyMeterImage;
  if (fields.learningOutcomes !== undefined) updates.learning_outcomes = fields.learningOutcomes;
  if (fields.released !== undefined) updates.released = fields.released;
  if (fields.releaseDate !== undefined) updates.release_date = fields.releaseDate;
  if (fields.totalPoints !== undefined) updates.total_points = fields.totalPoints;
  if (fields.sortOrder !== undefined) updates.sort_order = fields.sortOrder;

  const { data, error: dbError } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ course: data });
}
