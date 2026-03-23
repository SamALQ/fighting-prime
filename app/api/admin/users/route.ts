import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = request.nextUrl.searchParams.get("q") ?? "";

  const { data: users } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .or(`email.ilike.%${q}%,full_name.ilike.%${q}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ users: users ?? [] });
}
