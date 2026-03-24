"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageCircle,
  Send,
  Loader2,
  ChevronLeft,
  Clock,
  Trash2,
  Pin,
  Plus,
  X,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface Post {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  category: string;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
  authorName: string;
  authorRole: string;
}

interface Reply {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  authorName: string;
  authorRole: string;
}

interface PostDetail extends Post {
  content: string;
}

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "general", label: "General" },
  { key: "technique", label: "Technique" },
  { key: "training", label: "Training" },
  { key: "nutrition", label: "Nutrition" },
  { key: "mindset", label: "Mindset" },
  { key: "gear", label: "Gear" },
];

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-foreground/[0.06] text-foreground/50",
  technique: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  training: "bg-green-500/10 text-green-400 border-green-500/20",
  nutrition: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  mindset: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  gear: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  const mins = Math.floor(diff / 60000);
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

export function DiscussionsTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostDetail | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loadingPost, setLoadingPost] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const catParam = category !== "all" ? `&category=${category}` : "";
      const res = await fetch(`/api/community/discussions?limit=30${catParam}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openPost = async (postId: string) => {
    setLoadingPost(true);
    try {
      const res = await fetch(`/api/community/discussions?postId=${postId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data.post);
        setReplies(data.replies ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingPost(false);
    }
  };

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/community/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim(), category: newCategory }),
      });
      if (res.ok) {
        setShowNewPost(false);
        setNewTitle("");
        setNewContent("");
        setNewCategory("general");
        fetchPosts();
      }
    } catch {
      /* ignore */
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReply = async () => {
    if (!selectedPost || !replyContent.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch("/api/community/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", postId: selectedPost.id, content: replyContent.trim() }),
      });
      if (res.ok) {
        setReplyContent("");
        openPost(selectedPost.id);
      }
    } catch {
      /* ignore */
    } finally {
      setIsReplying(false);
    }
  };

  const deletePost = async (postId: string) => {
    const res = await fetch(`/api/community/discussions?postId=${postId}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedPost(null);
      fetchPosts();
    }
  };

  const deleteReply = async (replyId: string) => {
    if (!selectedPost) return;
    const res = await fetch(`/api/community/discussions?replyId=${replyId}`, { method: "DELETE" });
    if (res.ok) openPost(selectedPost.id);
  };

  if (selectedPost) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-1.5 text-sm text-foreground/40 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to discussions
        </button>

        <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
          {loadingPost ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-foreground/[0.06]">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center text-sm font-bold text-foreground/50 shrink-0">
                    {getInitials(selectedPost.authorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{selectedPost.authorName}</span>
                      {selectedPost.authorRole === "instructor" && (
                        <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Coach</Badge>
                      )}
                      {selectedPost.authorRole === "admin" && (
                        <Badge className="text-[10px] h-4 px-1.5 bg-red-500/10 text-red-400 border-red-500/20">Admin</Badge>
                      )}
                      <span className="text-xs text-foreground/25">{timeAgo(selectedPost.created_at)}</span>
                      {user?.id === selectedPost.user_id && (
                        <button onClick={() => deletePost(selectedPost.id)} className="ml-auto text-foreground/20 hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mt-1">{selectedPost.title}</h2>
                    <Badge className={cn("text-[10px] h-5 mt-2 border", CATEGORY_COLORS[selectedPost.category] ?? CATEGORY_COLORS.general)}>
                      {selectedPost.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-foreground/60 mt-4 whitespace-pre-wrap text-sm leading-relaxed">{selectedPost.content}</p>
              </div>

              <div className="p-6 space-y-5">
                <h3 className="text-sm font-bold text-foreground/40 uppercase tracking-wider">
                  {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </h3>

                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3 group">
                    <div className="h-8 w-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center text-[11px] font-bold text-foreground/50 shrink-0">
                      {getInitials(reply.authorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{reply.authorName}</span>
                        {reply.authorRole === "instructor" && (
                          <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Coach</Badge>
                        )}
                        <span className="text-[11px] text-foreground/25">{timeAgo(reply.created_at)}</span>
                        {user?.id === reply.user_id && (
                          <button onClick={() => deleteReply(reply.id)} className="opacity-0 group-hover:opacity-100 text-foreground/20 hover:text-red-400 transition-all ml-auto">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-foreground/60 mt-1 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}

                {user && (
                  <div className="flex gap-3 pt-4 border-t border-foreground/[0.06]">
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                      {getInitials(user.email || "U")}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors resize-none"
                        disabled={isReplying}
                      />
                      <Button
                        onClick={submitReply}
                        disabled={!replyContent.trim() || isReplying}
                        size="sm"
                        className="self-end h-9 gap-1.5"
                      >
                        {isReplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Category filter + new post */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                category === cat.key
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "text-foreground/40 border-foreground/[0.06] hover:text-foreground hover:border-foreground/[0.12]"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {user && (
          <Button
            onClick={() => setShowNewPost(!showNewPost)}
            size="sm"
            className="gap-1.5"
          >
            {showNewPost ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showNewPost ? "Cancel" : "New Post"}
          </Button>
        )}
      </div>

      {/* New post form */}
      {showNewPost && (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-5 space-y-4">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Post title..."
            maxLength={200}
            className="w-full px-4 py-2.5 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors text-sm font-medium"
            disabled={isSubmitting}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors resize-none text-sm"
            disabled={isSubmitting}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-foreground/30" />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="text-sm bg-foreground/[0.04] border border-foreground/[0.08] rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:border-primary/40"
                disabled={isSubmitting}
              >
                {CATEGORIES.filter((c) => c.key !== "all").map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={createPost} disabled={!newTitle.trim() || !newContent.trim() || isSubmitting} className="gap-1.5">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post
            </Button>
          </div>
        </div>
      )}

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 border border-foreground/[0.06] rounded-2xl bg-foreground/[0.02]">
          <MessageCircle className="h-12 w-12 text-foreground/10 mx-auto mb-4" />
          <p className="text-foreground/40 text-lg font-medium">
            {category === "all" ? "No discussions yet" : `No ${category} discussions yet`}
          </p>
          <p className="text-foreground/25 text-sm mt-1">Be the first to start a conversation</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-foreground/[0.06] divide-y divide-foreground/[0.04] overflow-hidden">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => openPost(post.id)}
              className="w-full text-left px-5 py-4 hover:bg-foreground/[0.02] transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center text-xs font-bold text-foreground/50 shrink-0">
                  {getInitials(post.authorName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {post.is_pinned && <Pin className="h-3.5 w-3.5 text-primary rotate-45" />}
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-foreground/40">{post.authorName}</span>
                    {post.authorRole === "instructor" && (
                      <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Coach</Badge>
                    )}
                    <Badge className={cn("text-[10px] h-4 px-1.5 border", CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.general)}>
                      {post.category}
                    </Badge>
                    <span className="text-[11px] text-foreground/25 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(post.created_at)}
                    </span>
                    <span className="text-[11px] text-foreground/25 flex items-center gap-1 ml-auto">
                      <MessageCircle className="h-3 w-3" />
                      {post.reply_count}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
