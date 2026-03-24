"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Film,
  Trophy,
  Loader2,
  ExternalLink,
  MessageSquare,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ShowcaseItem {
  id: string;
  userId: string;
  displayName: string;
  role: string;
  episodeTitle: string;
  courseTitle: string;
  courseSlug: string;
  episodeSlug: string;
  notes: string;
  feedback: string | null;
  pointsAwarded: number;
  videoUrl: string | null;
  createdAt: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  return "just now";
}

export function ShowcaseTab() {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchItems = useCallback(async (offset = 0) => {
    try {
      const res = await fetch(`/api/community/showcase?limit=12&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        if (offset === 0) setItems(data.items);
        else setItems((prev) => [...prev, ...data.items]);
        setHasMore(data.hasMore);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 border border-foreground/[0.06] rounded-2xl bg-foreground/[0.02]">
        <Film className="h-12 w-12 text-foreground/10 mx-auto mb-4" />
        <p className="text-foreground/40 text-lg font-medium">No approved assignments yet</p>
        <p className="text-foreground/25 text-sm mt-1">Submit an assignment on any episode to get featured here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden group"
            >
              {/* Video */}
              {item.videoUrl && (
                <div
                  className={cn(
                    "bg-black relative cursor-pointer",
                    isExpanded ? "aspect-video" : "aspect-[2.4/1]"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  {isExpanded ? (
                    <video
                      src={item.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                      preload="metadata"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
                      <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Play className="h-5 w-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-foreground/[0.04] border border-foreground/[0.08] flex items-center justify-center text-xs font-bold text-foreground/50 shrink-0">
                    {getInitials(item.displayName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${item.userId}`} className="font-medium text-sm hover:text-primary transition-colors">{item.displayName}</Link>
                      {item.role === "instructor" && (
                        <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Coach</Badge>
                      )}
                      <span className="text-[11px] text-foreground/25 ml-auto shrink-0">{timeAgo(item.createdAt)}</span>
                    </div>
                    <Link
                      href={`/courses/${item.courseSlug}/${item.episodeSlug}`}
                      className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                    >
                      {item.episodeTitle}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-sm text-foreground/50">{item.notes}</p>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <Trophy className="h-3.5 w-3.5" />
                    <span className="font-bold">+{item.pointsAwarded} pts</span>
                  </div>
                  {item.feedback && (
                    <div className="flex items-center gap-1 text-xs text-foreground/30">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Coach feedback</span>
                    </div>
                  )}
                </div>

                {isExpanded && item.feedback && (
                  <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl p-3 mt-2">
                    <p className="text-[11px] font-medium text-foreground/40 mb-1">Instructor Feedback</p>
                    <p className="text-sm text-foreground/60 whitespace-pre-wrap">{item.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => fetchItems(items.length)}
            className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
