import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { supabase, user: null, error: "Forbidden" };

  return { supabase, user, error: null };
}

export async function GET() {
  const { supabase, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 403 });

  const { data: instructors } = await supabase
    .from("instructors")
    .select("*, profiles!instructors_user_id_fkey(email, full_name)")
    .order("created_at", { ascending: false });

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, instructor_id")
    .order("sort_order");

  return NextResponse.json({ instructors: instructors ?? [], courses: courses ?? [] });
}

export async function POST(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 403 });

  const body = await request.json();
  const { userId, displayName, bio, payoutEmail } = body;

  if (!userId || !displayName) {
    return NextResponse.json({ error: "userId and displayName are required" }, { status: 400 });
  }

  const { data, error: insertError } = await supabase
    .from("instructors")
    .insert({
      user_id: userId,
      display_name: displayName,
      bio: bio ?? null,
      payout_email: payoutEmail ?? null,
      approved: true,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("profiles").update({ role: "instructor" }).eq("id", userId);

  return NextResponse.json({ instructor: data });
}

export async function PATCH(request: NextRequest) {
  const { supabase, error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: error === "Unauthorized" ? 401 : 403 });

  const body = await request.json();
  const { id, approved, displayName, bio, payoutEmail, courseId, action } = body;

  if (action === "assign-course" && courseId && id) {
    await supabase.from("courses").update({ instructor_id: id }).eq("id", courseId);
    return NextResponse.json({ success: true });
  }

  if (action === "unassign-course" && courseId) {
    await supabase.from("courses").update({ instructor_id: null }).eq("id", courseId);
    return NextResponse.json({ success: true });
  }

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof approved === "boolean") updates.approved = approved;
  if (displayName) updates.display_name = displayName;
  if (bio !== undefined) updates.bio = bio;
  if (payoutEmail !== undefined) updates.payout_email = payoutEmail;

  const { data, error: updateError } = await supabase
    .from("instructors")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ instructor: data });
}
