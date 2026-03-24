import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const myOnly = request.nextUrl.searchParams.get("my") === "true";

  if (myOnly && user) {
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id, role, training_groups(id, name, description, created_by, is_public, created_at)")
      .eq("user_id", user.id);

    const groups = (memberships ?? []).map((m) => {
      const g = m.training_groups as unknown as { id: string; name: string; description: string; created_by: string; is_public: boolean; created_at: string } | null;
      return { ...g, memberRole: m.role };
    });

    return NextResponse.json({ groups });
  }

  const { data: groups } = await supabase
    .from("training_groups")
    .select("*, group_members(count)")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const enriched = (groups ?? []).map((g) => ({
    ...g,
    memberCount: (g.group_members as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ groups: enriched });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const { name, description } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const { data: group, error } = await supabase
      .from("training_groups")
      .insert({ name: name.trim().slice(0, 100), description: (description ?? "").slice(0, 500), created_by: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json({ group });
  }

  if (action === "join") {
    const { groupId } = body;
    const { error } = await supabase.from("group_members").upsert({
      group_id: groupId,
      user_id: user.id,
      role: "member",
    }, { onConflict: "group_id,user_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "leave") {
    const { groupId } = body;
    await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
