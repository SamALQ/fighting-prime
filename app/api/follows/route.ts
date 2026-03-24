import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) return NextResponse.json({ followers: 0, following: 0 });

  const [followersResult, followingResult] = await Promise.all([
    supabase.from("user_follows").select("id", { count: "exact" }).eq("following_id", userId),
    supabase.from("user_follows").select("id", { count: "exact" }).eq("follower_id", userId),
  ]);

  let isFollowing = false;
  if (user && user.id !== userId) {
    const { data } = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle();
    isFollowing = !!data;
  }

  return NextResponse.json({
    followers: followersResult.count ?? 0,
    following: followingResult.count ?? 0,
    isFollowing,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId, action } = await request.json();
  if (!targetUserId || targetUserId === user.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  if (action === "follow") {
    const { error } = await supabase.from("user_follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
    });
    if (error && !error.message.includes("duplicate")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    createNotification({
      userId: targetUserId,
      type: "new_follower",
      title: `${profile?.display_name || "Someone"} started following you`,
      body: "Check out their profile!",
      link: `/profile/${user.id}`,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  }

  if (action === "unfollow") {
    await supabase.from("user_follows").delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
