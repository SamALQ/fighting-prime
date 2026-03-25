"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Crown,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getTier } from "@/lib/gamification";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  role: string;
  totalPoints: number;
  level: number;
  watchTime: number;
  completedEpisodes: number;
  assignmentsApproved: number;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getRankDisplay(rank: number) {
  if (rank === 1) return { icon: Crown, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" };
  if (rank === 2) return { icon: Medal, color: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/20" };
  if (rank === 3) return { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/20" };
  return null;
}

function getTierName(level: number) {
  const t = getTier(level);
  return { name: t.name, color: t.color };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function LeaderboardTab() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/community/leaderboard?limit=50");
        if (res.ok) setEntries(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-24 border border-foreground/[0.06] rounded-2xl bg-foreground/[0.02]">
        <Trophy className="h-12 w-12 text-foreground/10 mx-auto mb-4" />
        <p className="text-foreground/40 text-lg font-medium">No fighters on the board yet</p>
        <p className="text-foreground/25 text-sm mt-1">Start watching episodes and completing assignments to rank up</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const actualRank = [2, 1, 3][i];
            const rankInfo = getRankDisplay(actualRank)!;
            const tier = getTierName(entry.level);
            const isMe = user?.id === entry.userId;
            const RankIcon = rankInfo.icon;
            return (
              <div
                key={entry.userId}
                className={cn(
                  "rounded-2xl border p-5 text-center relative transition-all",
                  actualRank === 1 ? "bg-yellow-400/[0.04] border-yellow-400/20 lg:-mt-4" : "bg-foreground/[0.02] border-foreground/[0.06]",
                  isMe && "ring-1 ring-primary/30"
                )}
              >
                <div className={cn("inline-flex items-center justify-center h-8 w-8 rounded-full border mb-3", rankInfo.bg)}>
                  <RankIcon className={cn("h-4 w-4", rankInfo.color)} />
                </div>
                <div
                  className="h-14 w-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold border"
                  style={{ color: tier.color, backgroundColor: `${tier.color}15`, borderColor: `${tier.color}40` }}
                >
                  {getInitials(entry.displayName)}
                </div>
                <Link href={`/profile/${entry.userId}`} className={cn("font-bold text-sm truncate hover:text-primary transition-colors block", isMe && "text-primary")}>{entry.displayName}</Link>
                <p className="text-xs font-medium mt-0.5" style={{ color: tier.color }}>Lvl {entry.level} · {tier.name}</p>
                <p className="text-2xl font-bold mt-2 text-primary">{entry.totalPoints.toLocaleString()}</p>
                <p className="text-[10px] uppercase tracking-wider text-foreground/30 font-bold">points</p>
                {entry.role === "instructor" && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                    Coach
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="rounded-2xl border border-foreground/[0.06] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-foreground/[0.03] border-b border-foreground/[0.06] text-[10px] font-bold uppercase tracking-wider text-foreground/30">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Fighter</div>
          <div className="col-span-2 text-right">Points</div>
          <div className="col-span-2 text-right hidden md:block">Watch Time</div>
          <div className="col-span-1 text-right hidden md:block">Eps</div>
          <div className="col-span-2 text-right hidden md:block">Assignments</div>
        </div>

        {entries.map((entry) => {
          const tier = getTierName(entry.level);
          const isMe = user?.id === entry.userId;
          const rankInfo = getRankDisplay(entry.rank);

          return (
            <div
              key={entry.userId}
              className={cn(
                "grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-foreground/[0.04] last:border-0 items-center transition-colors",
                isMe ? "bg-primary/[0.04]" : "hover:bg-foreground/[0.02]"
              )}
            >
              <div className="col-span-1">
                {rankInfo ? (
                  <span className={cn("font-bold text-sm", rankInfo.color)}>
                    {entry.rank}
                  </span>
                ) : (
                  <span className="text-foreground/30 text-sm font-medium">{entry.rank}</span>
                )}
              </div>

              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div
                  className="h-9 w-9 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ color: tier.color, backgroundColor: `${tier.color}12`, borderColor: `${tier.color}30` }}
                >
                  {getInitials(entry.displayName)}
                </div>
                <div className="min-w-0">
                  <Link href={`/profile/${entry.userId}`} className={cn("text-sm font-medium truncate hover:text-primary transition-colors block", isMe && "text-primary")}>
                    {entry.displayName}
                    {isMe && <span className="text-primary/60 ml-1.5 text-xs">(you)</span>}
                  </Link>
                  <p className="text-[11px]" style={{ color: tier.color }}>Lvl {entry.level} · {tier.name}</p>
                </div>
                {entry.role === "instructor" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold shrink-0 hidden sm:inline">
                    Coach
                  </span>
                )}
              </div>

              <div className="col-span-2 text-right">
                <span className="font-bold text-sm flex items-center justify-end gap-1">
                  {entry.rank <= 3 && <Flame className="h-3.5 w-3.5 text-orange-400" />}
                  {entry.totalPoints.toLocaleString()}
                </span>
              </div>

              <div className="col-span-2 text-right hidden md:flex items-center justify-end gap-1.5 text-foreground/40 text-xs">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(entry.watchTime)}
              </div>

              <div className="col-span-1 text-right hidden md:flex items-center justify-end gap-1 text-foreground/40 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {entry.completedEpisodes}
              </div>

              <div className="col-span-2 text-right hidden md:flex items-center justify-end gap-1 text-foreground/40 text-xs">
                <ClipboardCheck className="h-3.5 w-3.5" />
                {entry.assignmentsApproved}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
