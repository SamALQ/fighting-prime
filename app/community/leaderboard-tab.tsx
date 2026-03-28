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
  Eye,
  Zap,
  ChevronUp,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getTier, TIERS, TierText } from "@/lib/gamification";

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
  return { name: t.name, color: t.color, gradient: t.gradient };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function PointsGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-foreground/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Info className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">How the Points System Works</p>
            <p className="text-xs text-muted-foreground">Earn points, level up, unlock tiers and rewards</p>
          </div>
        </div>
        <ChevronUp className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", !open && "rotate-180")} />
      </button>

      <div className={cn("grid transition-all duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="px-5 pb-6 space-y-6 border-t border-foreground/[0.06] pt-5">

            {/* How to earn points */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Earn Points</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Eye className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Watch</p>
                    <p className="text-xs text-muted-foreground mt-0.5">1 point every 2 seconds of training video</p>
                  </div>
                </div>
                <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Complete</p>
                    <p className="text-xs text-muted-foreground mt-0.5">100 bonus points per finished episode</p>
                  </div>
                </div>
                <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                    <Flame className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Streak</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Train daily for 1.25x–2x point multipliers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak multiplier detail */}
            <div className="flex flex-wrap gap-2">
              {[
                { days: "7+ days", mult: "1.25x" },
                { days: "14+ days", mult: "1.5x" },
                { days: "30+ days", mult: "2x" },
              ].map((s) => (
                <span key={s.days} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-500/[0.06] border border-orange-500/10 text-orange-400">
                  <Zap className="h-3 w-3" />
                  {s.days} = {s.mult}
                </span>
              ))}
            </div>

            {/* Tier progression */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Tier Progression</h4>
              <div className="relative">
                {/* Track line */}
                <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-foreground/[0.06] sm:hidden" />

                {/* Desktop: horizontal layout */}
                <div className="hidden sm:block">
                  {/* Horizontal track */}
                  <div className="relative mx-4 mb-2">
                    <div className="h-1 rounded-full bg-foreground/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${TIERS.map((t, i) => `${t.color} ${(i / (TIERS.length - 1)) * 100}%`).join(", ")})`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${TIERS.length}, 1fr)` }}>
                    {TIERS.map((tier) => (
                      <div key={tier.slug} className="flex flex-col items-center text-center px-1">
                        <div
                          className="h-9 w-9 rounded-full border-2 flex items-center justify-center text-[11px] font-black mb-1.5"
                          style={{ borderColor: tier.color, backgroundColor: `${tier.color}15`, color: tier.color }}
                        >
                          {tier.name.charAt(0)}
                        </div>
                        <p className="text-[11px] font-bold leading-tight" style={{ color: tier.color }}>{tier.name}</p>
                        <p className="text-[10px] text-muted-foreground"><TierText tier={tier}>Lvl {tier.minLevel}{tier.slug === "cosmic" ? "+" : ""}</TierText></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: vertical layout */}
                <div className="sm:hidden space-y-1">
                  {TIERS.map((tier, i) => {
                    const nextTier = TIERS[i + 1];
                    return (
                      <div key={tier.slug} className="flex items-center gap-3 pl-0.5 py-1.5">
                        <div
                          className="relative z-10 h-9 w-9 rounded-full border-2 flex items-center justify-center text-[11px] font-black shrink-0"
                          style={{ borderColor: tier.color, backgroundColor: `${tier.color}15`, color: tier.color }}
                        >
                          {tier.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: tier.color }}>{tier.name}</span>
                            <TierText tier={tier} className="text-[10px] font-bold">Lvl {tier.minLevel}{tier.slug === "cosmic" ? "+" : ""}</TierText>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{tier.rewardDescription}</p>
                        </div>
                        {nextTier && (
                          <span className="text-[10px] text-muted-foreground/50 font-bold shrink-0">
                            {nextTier.minLevel - tier.minLevel} lvls
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/60 text-center">
              Each tier unlocks exclusive rewards — the higher you climb, the bigger the perks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
      <PointsGuide />

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
                <p className="text-xs font-medium mt-0.5"><TierText tier={tier}>Lvl {entry.level}</TierText><span style={{ color: tier.color }}> · {tier.name}</span></p>
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
                  <p className="text-[11px]"><TierText tier={tier}>Lvl {entry.level}</TierText><span style={{ color: tier.color }}> · {tier.name}</span></p>
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
