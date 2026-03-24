import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";

const VALID_CATEGORIES = ["general", "technique", "training", "nutrition", "mindset", "gear"];

async function notifyMentions(content: string, authorId: string, link: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const mentionPattern = /@([\w.-]+)/g;
  const mentions = [...content.matchAll(mentionPattern)].map((m) => m[1]);
  if (mentions.length === 0) return;

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("display_name", mentions);

  for (const u of users ?? []) {
    if (u.id === authorId) continue;
    createNotification({
      userId: u.id,
      type: "mention",
      title: "You were mentioned in a discussion",
      body: content.slice(0, 100),
      link,
    }).catch(() => {});
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const postId = searchParams.get("postId");
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  if (postId) {
    const { data: post } = await supabase
      .from("discussion_posts")
      .select("*")
      .eq("id", postId)
      .eq("is_deleted", false)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: replies } = await supabase
      .from("discussion_replies")
      .select("*")
      .eq("post_id", postId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    const userIds = [
      post.user_id,
      ...new Set((replies ?? []).map((r) => r.user_id)),
    ];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { name: p.full_name, role: p.role }])
    );

    const authorProfile = profileMap.get(post.user_id);
    return NextResponse.json({
      post: {
        ...post,
        authorName: authorProfile?.name || "Fighter",
        authorRole: authorProfile?.role || "user",
      },
      replies: (replies ?? []).map((r) => {
        const rp = profileMap.get(r.user_id);
        return {
          ...r,
          authorName: rp?.name || "Fighter",
          authorRole: rp?.role || "user",
        };
      }),
    });
  }

  let query = supabase
    .from("discussion_posts")
    .select("id, user_id, title, category, reply_count, is_pinned, created_at, updated_at")
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category && VALID_CATEGORIES.includes(category)) {
    query = query.eq("category", category);
  }

  const { data: posts, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const userIds = [...new Set((posts ?? []).map((p) => p.user_id))];
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { name: p.full_name, role: p.role }])
    );

    const result = (posts ?? []).map((post) => {
      const profile = profileMap.get(post.user_id);
      return {
        ...post,
        authorName: profile?.name || "Fighter",
        authorRole: profile?.role || "user",
      };
    });

    return NextResponse.json({ posts: result, hasMore: (posts ?? []).length === limit });
  }

  return NextResponse.json({ posts: [], hasMore: false });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "reply") {
    const { postId, content } = body;
    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: "postId and content required" }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Content too long (max 2000 chars)" }, { status: 400 });
    }

    const { data: reply, error } = await supabase
      .from("discussion_replies")
      .insert({ post_id: postId, user_id: user.id, content: content.trim() })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to reply" }, { status: 500 });
    }

    const { data: post } = await supabase
      .from("discussion_posts")
      .select("user_id, title")
      .eq("id", postId)
      .single();

    if (post && post.user_id !== user.id) {
      createNotification({
        userId: post.user_id,
        type: "discussion_reply",
        title: `New reply on "${post.title.slice(0, 50)}"`,
        body: content.trim().slice(0, 100),
        link: `/community`,
      }).catch(() => {});
    }

    notifyMentions(content.trim(), user.id, "/community", supabase);

    return NextResponse.json(reply);
  }

  const { title, content, category } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }
  if (title.length > 200) {
    return NextResponse.json({ error: "Title too long (max 200 chars)" }, { status: 400 });
  }
  if (content.length > 5000) {
    return NextResponse.json({ error: "Content too long (max 5000 chars)" }, { status: 400 });
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const { data: post, error } = await supabase
    .from("discussion_posts")
    .insert({
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      category: category || "general",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }

  notifyMentions(content.trim(), user.id, "/community", supabase);

  return NextResponse.json(post, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const postId = searchParams.get("postId");
  const replyId = searchParams.get("replyId");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  if (replyId) {
    const condition = isAdmin ? {} : { user_id: user.id };
    const { error } = await supabase
      .from("discussion_replies")
      .update({ is_deleted: true })
      .eq("id", replyId)
      .match(condition);

    if (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (postId) {
    const condition = isAdmin ? {} : { user_id: user.id };
    const { error } = await supabase
      .from("discussion_posts")
      .update({ is_deleted: true })
      .eq("id", postId)
      .match(condition);

    if (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "postId or replyId required" }, { status: 400 });
}
