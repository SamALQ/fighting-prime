import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ sessions: [] });

  const { data } = await supabase
    .from("training_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(50);

  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { date, duration_minutes, notes, intensity, type } = body;

  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      user_id: user.id,
      date: date || new Date().toISOString().split("T")[0],
      duration_minutes: Math.max(1, Math.min(300, duration_minutes || 30)),
      notes: (notes ?? "").slice(0, 1000),
      intensity: Math.max(1, Math.min(5, intensity || 3)),
      type: type || "general",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase.from("training_sessions").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}
