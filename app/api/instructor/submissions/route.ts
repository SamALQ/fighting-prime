import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import { fireTransactionalEmail, emailEliteResponseReady } from "@/lib/email-events";
import {
  getPresignedViewUrl,
  getPresignedUploadUrl,
  buildEliteResponseKey,
} from "@/lib/s3";

async function requireInstructor(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["instructor", "admin"].includes(profile.role)) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await requireInstructor(supabase);

  if (!user) {
    return NextResponse.json({ error: "Instructor access required" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const submissionId = searchParams.get("id");
  const statusFilter = searchParams.get("status");

  if (submissionId) {
    const { data: submission } = await supabase
      .from("elite_submissions")
      .select("*, profiles!elite_submissions_user_id_fkey(id)")
      .eq("id", submissionId)
      .maybeSingle();

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const videoUrl = submission.video_key
      ? await getPresignedViewUrl(submission.video_key, 3600).catch(() => null)
      : null;

    const responseVideoUrl = submission.response_video_key
      ? await getPresignedViewUrl(submission.response_video_key, 3600).catch(() => null)
      : null;

    // Fetch user email
    const { data: userData } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", submission.user_id)
      .single();

    return NextResponse.json({
      ...submission,
      video_url: videoUrl,
      response_video_url: responseVideoUrl,
      user_email: userData ? undefined : undefined,
    });
  }

  let query = supabase
    .from("elite_submissions")
    .select("id, user_id, title, description, status, created_at, responded_at, assigned_instructor_id")
    .in("status", statusFilter ? [statusFilter] : ["pending", "in_review", "responded"])
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = supabase
      .from("elite_submissions")
      .select("id, user_id, title, description, status, created_at, responded_at, assigned_instructor_id")
      .eq("status", statusFilter)
      .order("created_at", { ascending: false });
  }

  const { data: submissions, error } = await query;

  if (error) {
    console.error("Failed to fetch submissions:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }

  return NextResponse.json(submissions ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await requireInstructor(supabase);

  if (!user) {
    return NextResponse.json({ error: "Instructor access required" }, { status: 403 });
  }

  const body = await request.json();
  const { submissionId, action, responseText, contentType } = body;

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  const { data: submission } = await supabase
    .from("elite_submissions")
    .select("*")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (action === "claim") {
    const { error } = await supabase
      .from("elite_submissions")
      .update({
        status: "in_review",
        assigned_instructor_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .in("status", ["pending", "in_review"]);

    if (error) {
      return NextResponse.json({ error: "Failed to claim submission" }, { status: 500 });
    }

    createNotification({
      userId: submission.user_id,
      type: "elite_claimed",
      title: "Your Elite submission is being reviewed",
      body: "An instructor has claimed your submission and will respond soon.",
      link: "/fighter-elite",
    }).catch(() => {});

    return NextResponse.json({ success: true });
  }

  if (action === "get_upload_url") {
    const responseKey = buildEliteResponseKey(submission.user_id, submissionId);
    const uploadUrl = await getPresignedUploadUrl(
      responseKey,
      contentType || "video/mp4",
      3600
    );
    return NextResponse.json({ uploadUrl, responseKey });
  }

  if (action === "respond") {
    const updates: Record<string, unknown> = {
      status: "responded",
      responded_at: new Date().toISOString(),
      assigned_instructor_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (responseText?.trim()) {
      updates.response_text = responseText.trim();
    }

    if (body.responseVideoKey) {
      updates.response_video_key = body.responseVideoKey;
    }

    const { error } = await supabase
      .from("elite_submissions")
      .update(updates)
      .eq("id", submissionId);

    if (error) {
      console.error("Failed to respond:", error);
      return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
    }

    createNotification({
      userId: submission.user_id,
      type: "elite_responded",
      title: "Your Elite submission has a response!",
      body: responseText?.trim() || "An instructor has reviewed your video.",
      link: "/fighter-elite",
    }).catch(() => {});

    fireTransactionalEmail(() => emailEliteResponseReady(submission.user_id));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
