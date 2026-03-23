import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!instructor) {
    return NextResponse.json({ error: "Not an instructor" }, { status: 403 });
  }

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title")
    .eq("instructor_id", instructor.id);

  const courseIds = (courses ?? []).map((c) => c.id);
  if (courseIds.length === 0) {
    return NextResponse.json({ comments: [], episodeMap: {}, courseMap: {} });
  }

  const { data: episodes } = await supabase
    .from("episodes")
    .select("id, title, course_id")
    .in("course_id", courseIds);

  const episodeIds = (episodes ?? []).map((e) => e.id);

  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50");
  const offset = parseInt(request.nextUrl.searchParams.get("offset") ?? "0");

  const { data: comments, error } = await supabase
    .from("comments")
    .select("id, user_id, content, parent_id, commentable_type, commentable_id, created_at, updated_at")
    .eq("is_deleted", false)
    .eq("commentable_type", "episode")
    .in("commentable_id", episodeIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((comments ?? []).map((c) => c.user_id))];
  let profileMap: Record<string, { full_name: string | null; role: string }> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profileMap[p.id] = { full_name: p.full_name, role: p.role };
    }
  }

  const episodeMap: Record<string, string> = {};
  for (const ep of episodes ?? []) {
    episodeMap[ep.id] = ep.title;
  }

  const courseMap: Record<string, string> = {};
  for (const c of courses ?? []) {
    courseMap[c.id] = c.title;
  }

  const episodeCourseMap: Record<string, string> = {};
  for (const ep of episodes ?? []) {
    episodeCourseMap[ep.id] = ep.course_id;
  }

  const mapped = (comments ?? []).map((c) => ({
    id: c.id,
    userId: c.user_id,
    content: c.content,
    parentId: c.parent_id,
    commentableType: c.commentable_type,
    commentableId: c.commentable_id,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    userName: profileMap[c.user_id]?.full_name ?? "Anonymous",
    userRole: profileMap[c.user_id]?.role ?? "user",
    episodeName: episodeMap[c.commentable_id] ?? "",
    courseName: courseMap[episodeCourseMap[c.commentable_id] ?? ""] ?? "",
  }));

  return NextResponse.json({ comments: mapped, episodeMap, courseMap });
}
