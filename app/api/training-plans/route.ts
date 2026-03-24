import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const type = request.nextUrl.searchParams.get("type");

  if (type === "templates") {
    const { data } = await supabase
      .from("training_plans")
      .select("*")
      .eq("is_template", true)
      .eq("is_public", true)
      .order("created_at", { ascending: false });
    return NextResponse.json({ plans: data ?? [] });
  }

  if (!user) return NextResponse.json({ plans: [] });

  const { data } = await supabase
    .from("training_plans")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ plans: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const { title, description, schedule } = body;
    if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });

    const { data, error } = await supabase
      .from("training_plans")
      .insert({
        title: title.trim().slice(0, 100),
        description: (description ?? "").slice(0, 500),
        schedule: schedule ?? [],
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plan: data });
  }

  if (action === "adopt") {
    const { planId } = body;
    const { data: template } = await supabase
      .from("training_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!template) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const { data, error } = await supabase
      .from("training_plans")
      .insert({
        title: template.title,
        description: template.description,
        schedule: template.schedule,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ plan: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await supabase.from("training_plans").delete().eq("id", id).eq("created_by", user.id);
  return NextResponse.json({ success: true });
}
