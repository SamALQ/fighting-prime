import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPresignedViewUrl } from "@/lib/s3";
import { createNotification } from "@/lib/notifications";

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
  const statusFilter = searchParams.get("status") ?? "pending";

  if (submissionId) {
    const { data: submission } = await supabase
      .from("assignment_submissions")
      .select("*, episodes(title, slug, course_id, assignment_points, courses(title, slug))")
      .eq("id", submissionId)
      .maybeSingle();

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const videoUrl = submission.video_key
      ? await getPresignedViewUrl(submission.video_key, 3600).catch(() => null)
      : null;

    return NextResponse.json({ ...submission, video_url: videoUrl });
  }

  const { data: submissions, error } = await supabase
    .from("assignment_submissions")
    .select("id, user_id, episode_id, status, notes, points_awarded, created_at, updated_at, episodes(title, slug, assignment_points, courses(title, slug))")
    .eq("status", statusFilter)
    .order("created_at", { ascending: statusFilter === "pending" });

  if (error) {
    console.error("Failed to fetch assignments:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
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
  const { submissionId, action, feedback } = body;

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId required" }, { status: 400 });
  }

  const { data: submission } = await supabase
    .from("assignment_submissions")
    .select("*, episodes(assignment_points)")
    .eq("id", submissionId)
    .maybeSingle();

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "approve") {
    const ep = submission.episodes as unknown as { assignment_points: number } | null;
    const points = ep?.assignment_points ?? 0;

    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        status: "approved",
        feedback: feedback?.trim() || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        points_awarded: points,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (error) {
      return NextResponse.json({ error: "Failed to approve" }, { status: 500 });
    }

    createNotification({
      userId: submission.user_id,
      type: "assignment_approved",
      title: `Assignment approved! +${points} pts`,
      body: feedback?.trim() || "Great work on your submission!",
      link: "/dashboard",
    }).catch(() => {});

    return NextResponse.json({ success: true, points_awarded: points });
  }

  if (action === "request_revision") {
    if (!feedback?.trim()) {
      return NextResponse.json({ error: "Feedback required when requesting revision" }, { status: 400 });
    }

    const { error } = await supabase
      .from("assignment_submissions")
      .update({
        status: "needs_revision",
        feedback: feedback.trim(),
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (error) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    createNotification({
      userId: submission.user_id,
      type: "assignment_revision",
      title: "Revision requested on your assignment",
      body: feedback.trim(),
      link: "/dashboard",
    }).catch(() => {});

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
