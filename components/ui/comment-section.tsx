"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import {
  MessageSquare,
  Send,
  Reply,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Shield,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Comment {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  commentableType: string;
  commentableId: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userRole: string;
}

interface CommentSectionProps {
  commentableType: "episode" | "breakdown";
  commentableId: string;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CommentForm({
  onSubmit,
  placeholder,
  autoFocus,
  onCancel,
  initialValue = "",
  submitLabel = "Post",
}: {
  onSubmit: (content: string) => Promise<void>;
  placeholder: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  initialValue?: string;
  submitLabel?: string;
}) {
  const [content, setContent] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60"
      />
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {content.length}/2000
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || submitting}
            className="h-8 text-xs gap-1.5"
          >
            {submitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function CommentCard({
  comment,
  replies,
  currentUserId,
  isAdmin,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}: {
  comment: Comment;
  replies: Comment[];
  currentUserId: string | null;
  isAdmin: boolean;
  onReply: (parentId: string, content: string) => Promise<void>;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const isOwner = currentUserId === comment.userId;
  const canModify = isOwner || isAdmin;
  const isInstructor =
    comment.userRole === "instructor" || comment.userRole === "admin";
  const wasEdited = comment.updatedAt !== comment.createdAt;

  const handleReply = async (content: string) => {
    await onReply(comment.id, content);
    setShowReply(false);
  };

  const handleEdit = async (content: string) => {
    await onEdit(comment.id, content);
    setEditing(false);
  };

  return (
    <div className={cn(depth > 0 && "ml-8 pl-4 border-l-2 border-border/50")}>
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback
            className={cn(
              "text-xs",
              isInstructor
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {getInitials(comment.userName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{comment.userName}</span>
            {isInstructor && (
              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                <Shield className="h-2.5 w-2.5" />
                Instructor
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
            {wasEdited && (
              <span className="text-[10px] text-muted-foreground italic">
                (edited)
              </span>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleEdit}
                placeholder="Edit your comment..."
                initialValue={comment.content}
                submitLabel="Save"
                autoFocus
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {!editing && (
            <div className="flex items-center gap-3 mt-2">
              {currentUserId && depth < 2 && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              )}
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-32">
                    {isOwner && (
                      <DropdownMenuItem onClick={() => setEditing(true)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {showReply && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                placeholder={`Reply to ${comment.userName}...`}
                autoFocus
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div>
          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              replies={[]}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  commentableType,
  commentableId,
}: CommentSectionProps) {
  const { user, isLoggedIn, role } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const res = await fetch(
      `/api/comments?type=${commentableType}&id=${commentableId}`
    );
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments);
    }
    setLoading(false);
  }, [commentableType, commentableId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePost = async (content: string) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, commentableType, commentableId }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        commentableType,
        commentableId,
        parentId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, content }),
    });
    if (res.ok) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, content, updatedAt: new Date().toISOString() }
            : c
        )
      );
    }
  };

  const handleDelete = async (commentId: string) => {
    const res = await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
    }
  };

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesByParent: Record<string, Comment[]> = {};
  for (const c of comments) {
    if (c.parentId) {
      if (!repliesByParent[c.parentId]) repliesByParent[c.parentId] = [];
      repliesByParent[c.parentId].push(c);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">
          Discussion{" "}
          <span className="text-muted-foreground font-normal text-base">
            ({comments.length})
          </span>
        </h3>
      </div>

      {isLoggedIn ? (
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(user?.email?.split("@")[0] ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CommentForm
              onSubmit={handlePost}
              placeholder="Share your thoughts..."
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>{" "}
            to join the discussion.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-xl">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to start the discussion!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {topLevel.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              replies={repliesByParent[comment.id] ?? []}
              currentUserId={user?.id ?? null}
              isAdmin={role === "admin"}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
