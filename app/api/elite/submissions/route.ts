import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPresignedUploadUrl, getPresignedViewUrl, buildEliteUploadKey } from "@/lib/s3";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const submissionId = searchParams.get("id");

  if (submissionId) {
    const { data: submission, error } = await supabase
      .from("elite_submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();

    if (error || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const videoUrl = submission.video_key
      ? await getPresignedViewUrl(submission.video_key, 3600).catch(() => null)
      : null;

    const responseVideoUrl = submission.response_video_key
      ? await getPresignedViewUrl(submission.response_video_key, 3600).catch(() => null)
      : null;

    return NextResponse.json({
      ...submission,
      video_url: videoUrl,
      response_video_url: responseVideoUrl,
    });
  }

  const { data: submissions, error } = await supabase
    .from("elite_submissions")
    .select("id, title, status, created_at, responded_at, assigned_instructor_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }

  return NextResponse.json(submissions ?? []);
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
    .select("plan, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (!sub || sub.plan !== "fighter_elite") {
    return NextResponse.json({ error: "Fighter Elite subscription required" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, contentType, fileSize } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const maxSize = 500 * 1024 * 1024; // 500MB
  if (fileSize && fileSize > maxSize) {
    return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
  }

  const submissionId = crypto.randomUUID();
  const videoKey = buildEliteUploadKey(user.id, submissionId);

  const { error: insertError } = await supabase.from("elite_submissions").insert({
    id: submissionId,
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() ?? "",
    video_key: videoKey,
    video_content_type: contentType || "video/mp4",
    video_size_bytes: fileSize ?? 0,
    status: "uploading",
  });

  if (insertError) {
    console.error("Failed to create submission:", insertError);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }

  const uploadUrl = await getPresignedUploadUrl(
    videoKey,
    contentType || "video/mp4",
    3600
  );

  return NextResponse.json({
    id: submissionId,
    uploadUrl,
    videoKey,
  });
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
      .from("elite_submissions")
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
