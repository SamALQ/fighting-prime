import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPresignedUploadUrl, getPresignedViewUrl, buildAssignmentKey } from "@/lib/s3";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const episodeId = searchParams.get("episodeId");

  if (episodeId) {
    const { data: submission } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("user_id", user.id)
      .eq("episode_id", episodeId)
      .maybeSingle();

    if (!submission) {
      return NextResponse.json({ submission: null });
    }

    const videoUrl = submission.video_key
      ? await getPresignedViewUrl(submission.video_key, 3600).catch(() => null)
      : null;

    return NextResponse.json({
      submission: { ...submission, video_url: videoUrl },
    });
  }

  const { data: submissions } = await supabase
    .from("assignment_submissions")
    .select("id, episode_id, status, points_awarded, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ submissions: submissions ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
  }

  const body = await request.json();
  const { episodeId, notes, contentType, fileSize } = body;

  if (!episodeId) {
    return NextResponse.json({ error: "episodeId required" }, { status: 400 });
  }

  const { data: episode } = await supabase
    .from("episodes")
    .select("id, has_assignment")
    .eq("id", episodeId)
    .maybeSingle();

  if (!episode || !episode.has_assignment) {
    return NextResponse.json({ error: "This episode does not have an assignment" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("assignment_submissions")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("episode_id", episodeId)
    .maybeSingle();

  if (existing && existing.status === "approved") {
    return NextResponse.json({ error: "Assignment already approved" }, { status: 400 });
  }

  const maxSize = 500 * 1024 * 1024;
  if (fileSize && fileSize > maxSize) {
    return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
  }

  const timestamp = Date.now();
  const videoKey = buildAssignmentKey(user.id, episodeId, timestamp);

  if (existing) {
    const { error: updateError } = await supabase
      .from("assignment_submissions")
      .update({
        video_key: videoKey,
        video_content_type: contentType || "video/mp4",
        video_size_bytes: fileSize ?? 0,
        notes: notes?.trim() ?? "",
        status: "uploading",
        feedback: null,
        reviewed_by: null,
        reviewed_at: null,
        points_awarded: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      console.error("Failed to update assignment:", updateError);
      return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
    }

    const uploadUrl = await getPresignedUploadUrl(videoKey, contentType || "video/mp4", 3600);
    return NextResponse.json({ id: existing.id, uploadUrl, videoKey });
  }

  const submissionId = crypto.randomUUID();
  const { error: insertError } = await supabase.from("assignment_submissions").insert({
    id: submissionId,
    user_id: user.id,
    episode_id: episodeId,
    video_key: videoKey,
    video_content_type: contentType || "video/mp4",
    video_size_bytes: fileSize ?? 0,
    notes: notes?.trim() ?? "",
    status: "uploading",
  });

  if (insertError) {
    console.error("Failed to create assignment:", insertError);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }

  const uploadUrl = await getPresignedUploadUrl(videoKey, contentType || "video/mp4", 3600);
  return NextResponse.json({ id: submissionId, uploadUrl, videoKey });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const { submissionId, action } = body;

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  if (action === "confirm_upload") {
    const { error } = await supabase
      .from("assignment_submissions")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", submissionId)
      .eq("user_id", user.id)
      .eq("status", "uploading");

    if (error) {
      return NextResponse.json({ error: "Failed to confirm upload" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
