import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const type = request.nextUrl.searchParams.get("type");
  const id = request.nextUrl.searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json(
      { error: "Missing type or id parameter" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, user_id, content, parent_id, commentable_type, commentable_id, created_at, updated_at")
    .eq("commentable_type", type)
    .eq("commentable_id", id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((data ?? []).map((c) => c.user_id))];

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

  const comments = (data ?? []).map((c) => ({
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
  }));

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, commentableType, commentableId, parentId } = body;

  if (!content?.trim() || !commentableType || !commentableId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: "Comment too long (max 2000 chars)" }, { status: 400 });
  }

  if (!["episode", "breakdown"].includes(commentableType)) {
    return NextResponse.json({ error: "Invalid commentable type" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      user_id: user.id,
      content: content.trim(),
      commentable_type: commentableType,
      commentable_id: commentableId,
      parent_id: parentId ?? null,
    })
    .select("id, user_id, content, parent_id, commentable_type, commentable_id, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    comment: {
      id: data.id,
      userId: data.user_id,
      content: data.content,
      parentId: data.parent_id,
      commentableType: data.commentable_type,
      commentableId: data.commentable_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userName: profile?.full_name ?? "Anonymous",
      userRole: profile?.role ?? "user",
    },
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { commentId, content } = body;

  if (!commentId || !content?.trim()) {
    return NextResponse.json({ error: "Missing commentId or content" }, { status: 400 });
  }

  if (content.length > 2000) {
    return NextResponse.json({ error: "Comment too long (max 2000 chars)" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .update({
      content: content.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .eq("user_id", user.id)
    .select("id, content, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { commentId } = body;

  if (!commentId) {
    return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
  }

  // Check if user owns the comment or is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const query = supabase
    .from("comments")
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (!isAdmin) {
    query.eq("user_id", user.id);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
