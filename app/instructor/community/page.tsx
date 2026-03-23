"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  MessagesSquare,
  Users,
  Heart,
  Shield,
  Loader2,
  Film,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface InstructorComment {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  commentableType: string;
  commentableId: string;
  createdAt: string;
  userName: string;
  userRole: string;
  episodeName: string;
  courseName: string;
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

export default function CommunityPage() {
  const [comments, setComments] = useState<InstructorComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instructor/comments?limit=50");
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Community</h1>
        <p className="text-foreground/40 text-sm mt-1">
          See what your students are saying about your content
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-foreground/40">Total Comments</p>
            <p className="text-lg font-bold">
              {loading ? "..." : comments.length}
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-foreground/40">Unique Commenters</p>
            <p className="text-lg font-bold">
              {loading
                ? "..."
                : new Set(comments.map((c) => c.userId)).size}
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
            <MessagesSquare className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-foreground/40">Replies</p>
            <p className="text-lg font-bold">
              {loading
                ? "..."
                : comments.filter((c) => c.parentId).length}
            </p>
          </div>
        </div>
      </div>

      {/* Recent comments */}
      <div className="border border-foreground/[0.06] rounded-xl bg-foreground/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-foreground/[0.06]">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Recent Comments</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-foreground/40" />
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-10 w-10 text-foreground/[0.12] mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground/40">
              No comments yet
            </p>
            <p className="text-xs text-foreground/40 mt-1">
              Comments from your students will appear here as they engage with
              your episodes.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-foreground/[0.06]">
            {comments.map((comment) => {
              const isInstructor =
                comment.userRole === "instructor" ||
                comment.userRole === "admin";
              return (
                <div key={comment.id} className="px-5 py-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          isInstructor
                            ? "bg-primary/20 text-primary"
                            : "bg-foreground/[0.04] text-foreground/40"
                        )}
                      >
                        {getInitials(comment.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">
                          {comment.userName}
                        </span>
                        {isInstructor && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            <Shield className="h-2.5 w-2.5" />
                            Instructor
                          </span>
                        )}
                        <span className="text-[11px] text-foreground/40">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 mt-1">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-foreground/40">
                        <Film className="h-3 w-3" />
                        <span>
                          {comment.episodeName}
                          {comment.courseName && (
                            <span className="text-foreground/25">
                              {" "}
                              &middot; {comment.courseName}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-dashed border-foreground/[0.06] rounded-xl p-5 bg-foreground/[0.01]">
          <Heart className="h-5 w-5 text-foreground/40 mb-3" />
          <h3 className="font-semibold text-sm mb-1">Course Forums</h3>
          <p className="text-xs text-foreground/40">
            Coming soon -- dedicated discussion threads for each course. Share
            drills, answer technique questions, and foster a training community.
          </p>
        </div>
        <div className="border border-dashed border-foreground/[0.06] rounded-xl p-5 bg-foreground/[0.01]">
          <Users className="h-5 w-5 text-foreground/40 mb-3" />
          <h3 className="font-semibold text-sm mb-1">Student Highlights</h3>
          <p className="text-xs text-foreground/40">
            Coming soon -- see your most engaged students, celebrate their
            milestones, and build lasting relationships with your audience.
          </p>
        </div>
      </div>
    </div>
  );
}
