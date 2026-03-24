import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPresignedViewUrl } from "@/lib/s3";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const episodeId = searchParams.get("episodeId");
  const breakdownId = searchParams.get("breakdownId");
  const resolution = searchParams.get("resolution");

  if (!episodeId && !breakdownId) {
    return NextResponse.json(
      { error: "episodeId or breakdownId required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (episodeId) {
    return handleEpisode(supabase, user, episodeId, resolution);
  }

  if (breakdownId) {
    return handleBreakdown(supabase, user, breakdownId);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleEpisode(supabase: any, user: any, episodeId: string, resolution: string | null) {
  const { data: episode } = await supabase
    .from("episodes")
    .select("id, is_free, premium, video_url, video_resolutions, course_id")
    .eq("id", episodeId)
    .maybeSingle();

  if (!episode) {
    return NextResponse.json({ error: "Episode not found" }, { status: 404 });
  }

  if (!episode.is_free && episode.premium) {
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .maybeSingle();

    if (!sub) {
      return NextResponse.json({ error: "Subscription required" }, { status: 403 });
    }
  }

  const resolutions: { label: string; key: string }[] = episode.video_resolutions ?? [];

  if (resolutions.length === 0) {
    return NextResponse.json({
      url: episode.video_url || null,
      source: "direct",
      resolutions: [],
    });
  }

  let chosen = resolutions[0];
  if (resolution) {
    const match = resolutions.find((r: { label: string }) =>
      r.label.toLowerCase() === resolution.toLowerCase()
    );
    if (match) chosen = match;
  }

  try {
    const url = await getPresignedViewUrl(chosen.key, 3600);
    return NextResponse.json(
      {
        url,
        source: "presigned",
        resolution: chosen.label,
        resolutions: resolutions.map((r: { label: string }) => r.label),
        expiresIn: 3600,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=3000",
        },
      }
    );
  } catch (err) {
    console.error("Failed to generate presigned URL:", err);
    return NextResponse.json({
      url: episode.video_url || null,
      source: "fallback",
      resolutions: [],
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleBreakdown(supabase: any, user: any, breakdownId: string) {
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (!sub) {
    return NextResponse.json({ error: "Subscription required" }, { status: 403 });
  }

  const { data: breakdown } = await supabase
    .from("breakdowns")
    .select("id, video_url")
    .eq("id", breakdownId)
    .maybeSingle();

  if (!breakdown) {
    return NextResponse.json({ error: "Breakdown not found" }, { status: 404 });
  }

  return NextResponse.json({
    url: breakdown.video_url || null,
    source: "direct",
    resolutions: [],
  });
}
