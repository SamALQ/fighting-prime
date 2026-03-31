"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Flame, Bell, MessageCircle, Trophy, Clock, CheckCircle2, ChevronUp, ExternalLink, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/hooks/use-progress";
import { useHudNotifications } from "./use-hud-notifications";
import { getTier, getXpProgress, getPointsToNextLevel, getNextTier, getLevelsToNextTier, TierText, TIERS, POINTS_PER_COMPLETION } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { startPointsBuildUp, stopPointsBuildUp, playPointsEnd, playLevelUpSound, playTierSound, playAchievementSound } from "@/lib/sounds";
import type { PointsEndVariant } from "@/lib/sounds";

const HIDDEN_ROUTES = ["/login", "/signup", "/onboarding", "/reset-password", "/forgot-password"];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{display}</motion.span>;
}

let ringIdCounter = 0;
function MiniXpRing({ progress, size = 36, strokeWidth = 2.5, color, gradientStops }: { progress: number; size?: number; strokeWidth?: number; color?: string; gradientStops?: [string, string] }) {
  const idRef = useRef(`xp-ring-${++ringIdCounter}`);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const gradId = idRef.current;
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      {gradientStops && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradientStops[0]} />
            <stop offset="100%" stopColor={gradientStops[1]} />
          </linearGradient>
        </defs>
      )}
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-foreground/[0.08]" />
      <motion.circle cx={size / 2} cy={size / 2} r={radius} stroke={gradientStops ? `url(#${gradId})` : (color || "currentColor")} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeLinecap="round" className={color && !gradientStops ? undefined : (!gradientStops ? "text-primary" : undefined)} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Points Bubble                                                      */
/* ------------------------------------------------------------------ */

function PointsBubble({
  amount,
  baseAmount,
  streakMultiplier = 1,
  onDone,
  onCountComplete,
  onPhaseOneDone,
  onStreakFlash,
}: {
  amount: number;
  baseAmount?: number;
  streakMultiplier?: number;
  onDone: () => void;
  onCountComplete: () => void;
  onPhaseOneDone?: () => void;
  onStreakFlash?: () => void;
}) {
  const hasMultiplier = streakMultiplier > 1 && baseAmount !== undefined && baseAmount < amount;
  const countTarget = hasMultiplier ? baseAmount : amount;

  // Stable refs for callbacks to prevent animation restarts from identity changes
  const onDoneRef = useRef(onDone);
  const onCountCompleteRef = useRef(onCountComplete);
  const onPhaseOneDoneRef = useRef(onPhaseOneDone);
  const onStreakFlashRef = useRef(onStreakFlash);
  onDoneRef.current = onDone;
  onCountCompleteRef.current = onCountComplete;
  onPhaseOneDoneRef.current = onPhaseOneDone;
  onStreakFlashRef.current = onStreakFlash;
  const countFiredRef = useRef(false);

  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => `+${Math.round(v)}`);
  const bubbleScale = useTransform(mv, [0, countTarget], [1, 1.15]);
  const [phase, setPhase] = useState<"count" | "lock" | "multiply" | "result" | "exit">("count");
  const [currentScale, setCurrentScale] = useState(1);

  useEffect(() => {
    const unsub = bubbleScale.on("change", (v) => setCurrentScale(v));
    return unsub;
  }, [bubbleScale]);

  // Phase 1: count up to base (or full amount if no multiplier)
  useEffect(() => {
    if (countTarget > 1) startPointsBuildUp();
    const controls = animate(mv, countTarget, {
      duration: Math.min(1.5, 0.5 + countTarget / 200),
      ease: "easeOut",
      onComplete: () => {
        stopPointsBuildUp();
        onPhaseOneDoneRef.current?.();
        setPhase("lock");
        if (hasMultiplier) {
          setTimeout(() => {
            onStreakFlashRef.current?.();
            setPhase("multiply");
          }, 600);
          setTimeout(() => setPhase("result"), 1500);
        } else {
          if (!countFiredRef.current) {
            countFiredRef.current = true;
            onCountCompleteRef.current();
          }
          setTimeout(() => setPhase("exit"), 1200);
          setTimeout(() => onDoneRef.current(), 1800);
        }
      },
    });
    return () => { stopPointsBuildUp(); controls.stop(); };
  }, [countTarget, mv, hasMultiplier]);

  // Phase 2: snap to final amount when multiplier is active
  useEffect(() => {
    if (phase !== "result" || !hasMultiplier) return;
    mv.set(amount);
    if (!countFiredRef.current) {
      countFiredRef.current = true;
      onCountCompleteRef.current();
    }
    setTimeout(() => setPhase("exit"), 800);
    setTimeout(() => onDoneRef.current(), 1400);
  }, [phase, hasMultiplier, amount, mv]);

  const showMultiplier = hasMultiplier && (phase === "multiply" || phase === "result");

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 4 }}
      animate={
        phase === "exit"
          ? { scale: 0.8, opacity: 0, y: -8 }
          : phase === "lock"
            ? { scale: 1, opacity: 1, y: -4 }
            : phase === "multiply" || phase === "result"
              ? { scale: 1, opacity: 1, y: -4 }
              : { scale: currentScale, opacity: 1, y: -4 }
      }
      transition={
        phase === "lock"
          ? { type: "spring", stiffness: 500, damping: 15 }
          : phase === "exit"
            ? { duration: 0.5, ease: "easeIn" }
            : { type: "spring", stiffness: 300, damping: 20 }
      }
      className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
    >
      <div
        className={cn(
          "px-3 py-1 rounded-full bg-black/70 dark:bg-black/80 backdrop-blur-sm font-bruce whitespace-nowrap transition-colors duration-300",
          phase === "lock" && "animate-shimmer",
          showMultiplier ? "border border-orange-400/50" : "border border-[#62fab6]/30",
        )}
      >
        <div className="flex items-center">
          <motion.span className="text-sm font-black tabular-nums" style={{ color: "#62fab6" }}>
            {display}
          </motion.span>
          {showMultiplier && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="overflow-hidden"
            >
              <span className="text-sm font-black text-orange-400 pl-1.5 whitespace-nowrap">×{streakMultiplier}</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier Promotion Modal                                               */
/* ------------------------------------------------------------------ */

interface TierPromotionData {
  name: string;
  color: string;
  reward: string;
  previousColor: string;
  previousName: string;
  newLevel: number;
}

function TierPromotionModal({ tier, onClose }: { tier: TierPromotionData; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  const levelMv = useMotionValue(tier.newLevel - 1);
  const levelDisplay = useTransform(levelMv, (v) => Math.round(v));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (ready) {
      const controls = animate(levelMv, tier.newLevel, { duration: 0.8, ease: "easeOut", delay: 0.6 });
      return controls.stop;
    }
  }, [ready, tier.newLevel, levelMv]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center">
      <div className={cn("absolute inset-0 bg-black/50 dark:bg-black/70 transition-opacity duration-300", ready ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <div
        className={cn("relative max-w-sm w-[calc(100vw-2rem)] rounded-2xl border bg-background p-8 text-center shadow-2xl transition-all duration-500", ready ? "opacity-100 scale-100" : "opacity-0 scale-90")}
        style={{ borderColor: `${tier.color}40` }}
      >
        <motion.div
          className="h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
          initial={{ borderColor: tier.previousColor, backgroundColor: `${tier.previousColor}15` }}
          animate={{ borderColor: tier.color, backgroundColor: `${tier.color}15` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        >
          <motion.span
            className="text-3xl font-black"
            initial={{ color: tier.previousColor }}
            animate={{ color: tier.color }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          >
            {tier.name.charAt(0)}
          </motion.span>
        </motion.div>
        <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 font-bruce" style={{ color: tier.color }}>Tier Earned</p>
        <h2 className="text-2xl font-black text-foreground mb-1">{tier.name} Tier</h2>
        <p className="text-sm text-muted-foreground mb-1">
          <motion.span className="font-bold" style={{ color: tier.color }}>Level <motion.span>{levelDisplay}</motion.span></motion.span>
        </p>
        <p className="text-sm text-muted-foreground mb-6">{tier.reward}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: tier.color }}
        >
          Continue
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  Stats panel — rendered via portal ONLY when open                  */
/* ------------------------------------------------------------------ */

function StatsPanel({ onClose, panelProps }: { onClose: () => void; panelProps: PanelProps }) {
  const [sheetReady, setSheetReady] = useState(false);

  // Two-phase mount: render off-screen, then slide in on the next frame
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSheetReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  const { initials, user, level, tier, xpProgress, pointsToNext, points, userStats, rankLoading, leaderboardRank, nextTier, levelsToNextTier } = panelProps;

  const content = (
    <>
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0" style={{ color: tier.color, backgroundColor: `${tier.color}20` }}>
            {initials}
            <MiniXpRing progress={xpProgress} size={48} strokeWidth={2.5} color={tier.color} gradientStops={tier.gradientStops} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm truncate">{user?.email?.split("@")[0] ?? "Fighter"}</p>
            <span className="text-[10px] font-black uppercase tracking-wider font-bruce">
              <TierText tier={tier}>Lvl {level}</TierText>
              <span style={{ color: tier.color }}> · {tier.name}</span>
            </span>
          </div>
          <Link href={`/profile/${user?.id}`} onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-foreground/[0.08] transition-colors">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            <span>{pointsToNext} pts to next level</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${xpProgress}%`, backgroundColor: tier.color }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-foreground/[0.04] p-2.5 text-center">
            <Trophy className="h-3.5 w-3.5 mx-auto mb-1" style={{ color: tier.color }} />
            <p className="text-sm font-bold text-foreground"><AnimatedNumber value={points} /></p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Points</p>
          </div>
          <div className="rounded-xl bg-foreground/[0.04] p-2.5 text-center">
            <Clock className="h-3.5 w-3.5 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{formatTime(userStats.watchTime)}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Watch</p>
          </div>
          <div className="rounded-xl bg-foreground/[0.04] p-2.5 text-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{userStats.episodesCompleted}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Done</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-foreground/[0.04] px-3 py-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}15` }}>
              <ChevronUp className="h-4 w-4" style={{ color: tier.color }} />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                {rankLoading ? "Loading..." : leaderboardRank && leaderboardRank > 0 ? `#${leaderboardRank} on Leaderboard` : "Unranked"}
              </p>
              <p className="text-[10px] text-muted-foreground">Keep training to climb</p>
            </div>
          </div>
          <Link href="/community" onClick={onClose} className="text-[10px] font-bold hover:opacity-80 transition-opacity uppercase tracking-wider" style={{ color: tier.color }}>View</Link>
        </div>

        {nextTier && levelsToNextTier !== null && (
          <div className="rounded-xl px-3 py-2.5 border" style={{ backgroundColor: `${nextTier.color}08`, borderColor: `${nextTier.color}20` }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-wider font-bruce" style={{ color: nextTier.color }}>
                Next: {nextTier.name} Tier
              </p>
              <p className="text-[10px] font-bold text-muted-foreground">{levelsToNextTier} levels away</p>
            </div>
            <p className="text-[10px] text-muted-foreground">{nextTier.rewardDescription}</p>
          </div>
        )}
      </div>

      {userStats.currentStreak > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-orange-500/[0.06] border border-orange-500/10 px-3 py-2.5">
            <Flame className="h-5 w-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-xs font-bold text-foreground">{userStats.currentStreak}-day streak</p>
              <p className="text-[10px] text-muted-foreground">Longest: {userStats.longestStreak}d</p>
            </div>
            {userStats.streakMultiplier > 1 && (
              <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">{userStats.streakMultiplier}x pts</span>
            )}
          </div>
        </div>
      )}
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className={cn("absolute inset-0 bg-black/30 dark:bg-black/60 transition-opacity duration-200", sheetReady ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />

      {/* Floating card — same style on mobile and desktop */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-2xl bg-background/95 backdrop-blur-2xl border border-border shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden transition-all duration-200 ease-out",
          "bottom-20 sm:bottom-20",
          sheetReady ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
        )}
      >
        {content}
      </div>
    </div>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PanelProps {
  initials: string;
  user: { id: string; email?: string | null } | null;
  level: number;
  tier: { name: string; color: string; gradient: string; gradientStops: [string, string] };
  xpProgress: number;
  pointsToNext: number;
  points: number;
  userStats: { watchTime: number; episodesCompleted: number; currentStreak: number; longestStreak: number; streakMultiplier: number };
  rankLoading: boolean;
  leaderboardRank: number | null;
  nextTier: { name: string; color: string; minLevel: number; rewardDescription: string } | null;
  levelsToNextTier: number | null;
}

/* ------------------------------------------------------------------ */
/*  Main HUD Pill                                                      */
/* ------------------------------------------------------------------ */

export function HudPill() {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { userStats, isLoading: progressLoading } = useProgress();
  const { unreadCount } = useHudNotifications();

  const [panelOpen, setPanelOpen] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const rankFetchedRef = useRef(false);
  const hudRef = useRef<HTMLDivElement>(null);

  const prevLevelRef = useRef(0);
  const prevTierRef = useRef<string>("");
  const hasMountedRef = useRef(false);
  const tierMountedRef = useRef(false);
  const prevStreakRef = useRef(0);
  const prevCompletedRef = useRef(-1);
  const prevAssignPtsRef = useRef(-1);
  const [levelPulse, setLevelPulse] = useState(false);
  const [levelGlimmer, setLevelGlimmer] = useState(false);
  const [streakPulse, setStreakPulse] = useState(false);
  const [notifPulse, setNotifPulse] = useState(false);
  const [tierPromotion, setTierPromotion] = useState<TierPromotionData | null>(null);
  const [pointsEvent, setPointsEvent] = useState<{ amount: number; baseAmount?: number; streakMultiplier?: number } | null>(null);
  const [streakFlash, setStreakFlash] = useState(false);
  const pointsSeqRef = useRef(0);
  const lastAwardAmountRef = useRef(0);
  const pendingLevelUpRef = useRef(false);
  const pendingTierRef = useRef(false);
  const prevUnreadRef = useRef(0);

  const level = userStats.level;
  const points = userStats.points;
  const xpProgress = getXpProgress(points);
  const pointsToNext = getPointsToNextLevel(points);
  const tier = getTier(level);
  const nextTier = getNextTier(level);
  const levelsToNextTier = getLevelsToNextTier(level);
  const hotStreak = userStats.currentStreak >= 3;

  // Points event detection: video completion and assignment approval
  useEffect(() => {
    const completed = userStats.episodesCompleted;
    if (prevCompletedRef.current >= 0 && completed > prevCompletedRef.current) {
      const delta = (completed - prevCompletedRef.current) * POINTS_PER_COMPLETION;
      pointsSeqRef.current++;
      lastAwardAmountRef.current = delta;
      setPointsEvent({ amount: delta });
    }
    prevCompletedRef.current = completed;
  }, [userStats.episodesCompleted]);

  useEffect(() => {
    const pts = userStats.assignmentPoints;
    if (prevAssignPtsRef.current >= 0 && pts > prevAssignPtsRef.current) {
      const delta = pts - prevAssignPtsRef.current;
      pointsSeqRef.current++;
      lastAwardAmountRef.current = delta;
      setPointsEvent({ amount: delta });
    }
    prevAssignPtsRef.current = pts;
  }, [userStats.assignmentPoints]);

  // Level-up: defer if bubble is active, otherwise fire immediately
  useEffect(() => {
    if (progressLoading) return;
    if (hasMountedRef.current && level > prevLevelRef.current) {
      if (pointsEvent) {
        pendingLevelUpRef.current = true;
      } else {
        fireLevelUpRef.current();
      }
    }
    prevLevelRef.current = level;
    hasMountedRef.current = true;
  }, [level, pointsEvent, progressLoading]);

  // Tier promotion: defer if bubble is active
  useEffect(() => {
    const currentTierSlug = tier.slug;
    if (progressLoading) return;
    if (tierMountedRef.current && prevTierRef.current !== currentTierSlug) {
      if (pointsEvent) {
        pendingTierRef.current = true;
      } else {
        fireTierPromotionRef.current();
      }
    }
    prevTierRef.current = currentTierSlug;
    tierMountedRef.current = true;
  }, [tier, pointsEvent, progressLoading]);

  useEffect(() => {
    if (prevStreakRef.current > 0 && userStats.currentStreak > prevStreakRef.current) {
      setStreakPulse(true);
      setTimeout(() => setStreakPulse(false), 800);
    }
    prevStreakRef.current = userStats.currentStreak;
  }, [userStats.currentStreak]);

  useEffect(() => {
    if (prevUnreadRef.current === 0 && unreadCount > 0) {
      setNotifPulse(true);
      setTimeout(() => setNotifPulse(false), 800);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const fireLevelUpRef = useRef(() => {});
  fireLevelUpRef.current = () => {
    setLevelPulse(true);
    setLevelGlimmer(true);
    playLevelUpSound();
    
    setTimeout(() => setLevelPulse(false), 800);
    setTimeout(() => setLevelGlimmer(false), 1000);
  };

  const fireTierPromotionRef = useRef(() => {});
  fireTierPromotionRef.current = () => {
    const oldTier = TIERS.find(t => t.slug === prevTierRef.current);
    setTierPromotion({
      name: tier.name, color: tier.color, reward: tier.rewardDescription,
      previousColor: oldTier?.color ?? tier.color, previousName: oldTier?.name ?? "",
      newLevel: level,
    });
    playTierSound();
  };

  const handlePhaseOneDone = useCallback(() => {
    let endVariant: PointsEndVariant = "default";
    if (lastAwardAmountRef.current >= 100) endVariant = "100";
    if (pendingLevelUpRef.current) endVariant = "levelup";
    if (pendingTierRef.current) endVariant = "tier";
    setTimeout(() => playPointsEnd(endVariant), 50);
  }, []);

  const handleCountComplete = useCallback(() => {
    if (pendingLevelUpRef.current) {
      pendingLevelUpRef.current = false;
      fireLevelUpRef.current();
    }
    if (pendingTierRef.current) {
      pendingTierRef.current = false;
      setTimeout(() => fireTierPromotionRef.current(), 1200);
    }
  }, []);

  const handleBubbleDone = useCallback(() => {
    setPointsEvent(null);
  }, []);

  const handleStreakFlash = useCallback(() => {
    setStreakFlash(true);
    setTimeout(() => setStreakFlash(false), 600);
  }, []);

  // Fetch leaderboard rank when panel opens
  const fetchRank = useCallback(async () => {
    if (!user || rankFetchedRef.current) return;
    rankFetchedRef.current = true;
    setRankLoading(true);
    try {
      const res = await fetch("/api/community/leaderboard?limit=100");
      if (res.ok) {
        const data = await res.json();
        const idx = data.leaderboard?.findIndex((e: { userId: string }) => e.userId === user.id);
        setLeaderboardRank(idx >= 0 ? idx + 1 : -1);
      }
    } catch { /* silent */ }
    setRankLoading(false);
  }, [user]);

  useEffect(() => {
    if (panelOpen && !rankFetchedRef.current) fetchRank();
  }, [panelOpen, fetchRank]);

  if (authLoading || !isLoggedIn || progressLoading) return null;
  if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

  const initials = (user?.email ?? "?").charAt(0).toUpperCase();

  const panelProps: PanelProps = {
    initials,
    user: user ? { id: user.id, email: user.email } : null,
    level, tier: { name: tier.name, color: tier.color, gradient: tier.gradient, gradientStops: tier.gradientStops }, xpProgress, pointsToNext, points, userStats, rankLoading, leaderboardRank,
    nextTier: nextTier ? { name: nextTier.name, color: nextTier.color, minLevel: nextTier.minLevel, rewardDescription: nextTier.rewardDescription } : null,
    levelsToNextTier,
  };

  return (
    <>
      {/* Tier promotion modal */}
      {tierPromotion && <TierPromotionModal tier={tierPromotion} onClose={() => setTierPromotion(null)} />}

      {/* Portal: only mounted when panel is open — nothing in the DOM when closed */}
      {panelOpen && <StatsPanel onClose={() => setPanelOpen(false)} panelProps={panelProps} />}

      {/* Pill — z-[39] so it sits below the navbar mobile drawer (z-40) */}
      <div
        ref={hudRef}
        className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-[39] flex justify-center pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className={cn(
            "pointer-events-auto relative flex items-center rounded-full border backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40",
            "bg-white/80 dark:bg-black/70 border-border",
            hotStreak && "border-orange-500/30 shadow-orange-500/10",
          )}
        >
          {hotStreak && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ boxShadow: "0 0 20px rgba(249,115,22,0.3), inset 0 0 12px rgba(249,115,22,0.1)" }}
            />
          )}

          <div className="relative z-10 flex items-center gap-1.5 px-2 py-2">
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 active:scale-95 transition-transform"
              style={{ color: tier.color, backgroundColor: `${tier.color}20` }}
            >
              {initials}
              <MiniXpRing progress={xpProgress} size={40} strokeWidth={2.5} color={tier.color} gradientStops={tier.gradientStops} />
            </button>

            <div className="flex items-center gap-1.5 font-bruce">
              <div className="relative">
                {pointsEvent && (
                  <PointsBubble
                    key={pointsSeqRef.current}
                    amount={pointsEvent.amount}
                    baseAmount={pointsEvent.baseAmount}
                    streakMultiplier={pointsEvent.streakMultiplier}
                    onCountComplete={handleCountComplete}
                    onPhaseOneDone={handlePhaseOneDone}
                    onDone={handleBubbleDone}
                    onStreakFlash={handleStreakFlash}
                  />
                )}
                <motion.div
                  animate={levelPulse ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded-full border relative overflow-hidden",
                    levelGlimmer && "tier-glimmer-active",
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${tier.color}15, ${tier.color}08)`,
                    borderColor: `${tier.color}30`,
                  }}
                >
                  <TierText tier={tier} className="text-[11px] font-black uppercase tracking-wider">Lvl</TierText>
                  <TierText tier={tier} className="text-sm font-black tabular-nums">{level}</TierText>
                </motion.div>
              </div>

              <motion.div
                animate={
                  streakFlash
                    ? { scale: [1, 1.4, 1], boxShadow: ["0 0 0px rgba(249,115,22,0)", "0 0 16px rgba(249,115,22,0.8)", "0 0 0px rgba(249,115,22,0)"] }
                    : streakPulse ? { scale: [1, 1.3, 1] } : {}
                }
                transition={{ duration: streakFlash ? 0.5 : 0.4 }}
                className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-full", userStats.currentStreak > 0 ? "bg-orange-500/[0.08]" : "bg-foreground/[0.04]")}
              >
                <Flame className={cn("h-3.5 w-3.5", userStats.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground/50")} />
                <span className={cn("text-sm font-bold tabular-nums", userStats.currentStreak > 0 ? "text-orange-400 dark:text-orange-400" : "text-muted-foreground/50")}>{userStats.currentStreak}</span>
              </motion.div>

              <motion.div animate={notifPulse ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4 }}>
                <Link href="/dashboard" className="relative flex items-center justify-center h-8 w-8 rounded-full bg-foreground/[0.04]">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 400 }} className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-0.5">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              <div className="group relative hidden sm:block">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-foreground/[0.04] cursor-not-allowed">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-popover border border-border text-[10px] font-bold text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Coming Soon</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
