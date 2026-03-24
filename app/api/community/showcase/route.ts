import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPresignedViewUrl } from "@/lib/s3";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const { data: submissions, error } = await supabase
    .from("assignment_submissions")
    .select(
      "id, user_id, episode_id, video_key, notes, feedback, points_awarded, created_at, episodes(title, slug, courses(title, slug))"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  if (!submissions || submissions.length === 0) {
    return NextResponse.json({ items: [], hasMore: false });
  }

  const userIds = [...new Set(submissions.map((s) => s.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, { name: p.full_name, role: p.role }])
  );

  const items = await Promise.all(
    submissions.map(async (sub) => {
      const videoUrl = sub.video_key
        ? await getPresignedViewUrl(sub.video_key, 3600).catch(() => null)
        : null;

      const profile = profileMap.get(sub.user_id);
      const ep = sub.episodes as unknown as { title: string; slug: string; courses: { title: string; slug: string } } | null;
      return {
        id: sub.id,
        userId: sub.user_id,
        displayName: profile?.name || "Fighter",
        role: profile?.role || "user",
        episodeTitle: ep?.title ?? "Unknown",
        courseTitle: ep?.courses?.title ?? "",
        courseSlug: ep?.courses?.slug ?? "",
        episodeSlug: ep?.slug ?? "",
        notes: sub.notes,
        feedback: sub.feedback,
        pointsAwarded: sub.points_awarded,
        videoUrl,
        createdAt: sub.created_at,
      };
    })
  );

  return NextResponse.json({
    items,
    hasMore: submissions.length === limit,
  });
}
