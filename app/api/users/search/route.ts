import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json({ users: [] });

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .ilike("display_name", `%${q}%`)
    .limit(8);

  return NextResponse.json({
    users: (data ?? []).map((u) => ({
      id: u.id,
      displayName: u.display_name || "Fighter",
      role: u.role,
    })),
  });
}
