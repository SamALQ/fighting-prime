import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id, display_name, bio, avatar_url, payout_email, approved, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!instructor) return NextResponse.json({ error: "Not an instructor" }, { status: 403 });

  return NextResponse.json({ instructor, email: user.email });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!instructor) return NextResponse.json({ error: "Not an instructor" }, { status: 403 });

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.displayName !== undefined) updates.display_name = body.displayName;
  if (body.bio !== undefined) updates.bio = body.bio;
  if (body.avatarUrl !== undefined) updates.avatar_url = body.avatarUrl;
  if (body.payoutEmail !== undefined) updates.payout_email = body.payoutEmail;

  const { data, error } = await supabase
    .from("instructors")
    .update(updates)
    .eq("id", instructor.id)
    .select("id, display_name, bio, avatar_url, payout_email, approved, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ instructor: data });
}
