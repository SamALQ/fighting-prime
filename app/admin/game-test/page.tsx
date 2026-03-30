"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Flame, Bell, Trophy, RotateCcw, Plus, Minus, Zap } from "lucide-react";
import {
  getLevelFromPoints, getTier, getXpProgress, getPointsToNextLevel,
  getNextTier, getLevelsToNextTier, getPointsForLevel, TierText, TIERS, POINTS_PER_COMPLETION,
} from "@/lib/gamification";
import type { Tier } from "@/lib/gamification";
import { ACHIEVEMENTS, getAchievementIcon } from "@/lib/achievements";
import { playPointsSound, playLevelUpSound, playTierSound, playAchievementSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";


/* ------------------------------------------------------------------ */
/*  Local stats type (mirrors UserStats shape we care about)           */
/* ------------------------------------------------------------------ */

interface LocalStats {
  points: number;
  episodesCompleted: number;
  assignmentPoints: number;
  currentStreak: number;
  longestStreak: number;
  streakMultiplier: number;
  achievements: string[];
  /** Tracks each discrete points award for the bubble animation */
  _pointsAwardSeq: number;
  _lastAwardAmount: number;
  _lastBaseAmount: number;
}

const INITIAL_STATS: LocalStats = {
  points: 0,
  episodesCompleted: 0,
  assignmentPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  streakMultiplier: 1,
  achievements: [],
  _pointsAwardSeq: 0,
  _lastAwardAmount: 0,
  _lastBaseAmount: 0,
};

/* ------------------------------------------------------------------ */
/*  Points Bubble (copied from hud-pill, self-contained)               */
/* ------------------------------------------------------------------ */

function PointsBubble({
  amount,
  baseAmount,
  streakMultiplier = 1,
  onDone,
  onCountComplete,
  onStreakFlash,
}: {
  amount: number;
  baseAmount?: number;
  streakMultiplier?: number;
  onDone: () => void;
  onCountComplete: () => void;
  onStreakFlash?: () => void;
}) {
  const hasMultiplier = streakMultiplier > 1 && baseAmount !== undefined && baseAmount < amount;
  const countTarget = hasMultiplier ? baseAmount : amount;

  const onDoneRef = useRef(onDone);
  const onCountCompleteRef = useRef(onCountComplete);
  const onStreakFlashRef = useRef(onStreakFlash);
  onDoneRef.current = onDone;
  onCountCompleteRef.current = onCountComplete;
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
    const controls = animate(mv, countTarget, {
      duration: Math.min(1.5, 0.5 + countTarget / 200),
      ease: "easeOut",
      onComplete: () => {
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
    return controls.stop;
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
/*  Tier Promotion Modal (copied from hud-pill, self-contained)        */
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
        <button onClick={onClose} className="px-6 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80" style={{ backgroundColor: tier.color }}>
          Continue
        </button>
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ */
/*  Sandboxed Mini XP Ring                                             */
/* ------------------------------------------------------------------ */

let ringId = 0;
function MiniXpRing({ progress, size = 40, strokeWidth = 2.5, gradientStops }: { progress: number; size?: number; strokeWidth?: number; gradientStops: [string, string] }) {
  const idRef = useRef(`gt-ring-${++ringId}`);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const gId = idRef.current;
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gradientStops[0]} />
          <stop offset="100%" stopColor={gradientStops[1]} />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-foreground/[0.08]" />
      <motion.circle cx={size / 2} cy={size / 2} r={radius} stroke={`url(#${gId})`} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeLinecap="round" initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Sandboxed HUD Pill                                                 */
/* ------------------------------------------------------------------ */

function GameTestHudPill({ stats }: { stats: LocalStats }) {
  const prevAwardSeqRef = useRef(0);
  const animatedLevelRef = useRef(0);
  const animatedTierRef = useRef("iron");
  const hudRef = useRef<HTMLDivElement>(null);

  const [frozenPoints, setFrozenPoints] = useState<number | null>(null);
  const [levelPulse, setLevelPulse] = useState(false);
  const [levelGlimmer, setLevelGlimmer] = useState(false);
  const [pointsEvent, setPointsEvent] = useState<{ amount: number; baseAmount?: number; streakMultiplier?: number } | null>(null);
  const [streakFlash, setStreakFlash] = useState(false);
  const [tierPromotion, setTierPromotion] = useState<TierPromotionData | null>(null);

  const displayPoints = frozenPoints !== null ? frozenPoints : stats.points;
  const level = getLevelFromPoints(displayPoints);
  const tier = getTier(level);
  const xpProgress = getXpProgress(displayPoints);

  // Detect any points award → freeze display + start bubble
  useEffect(() => {
    const seq = stats._pointsAwardSeq;
    if (seq > prevAwardSeqRef.current && stats._lastAwardAmount > 0) {
      setFrozenPoints(prev => prev !== null ? prev : stats.points - stats._lastAwardAmount);
      setPointsEvent({
        amount: stats._lastAwardAmount,
        baseAmount: stats.streakMultiplier > 1 ? stats._lastBaseAmount : undefined,
        streakMultiplier: stats.streakMultiplier,
      });
      playPointsSound();
    }
    prevAwardSeqRef.current = seq;
  }, [stats._pointsAwardSeq, stats._lastAwardAmount, stats._lastBaseAmount, stats.streakMultiplier, stats.points]);

  const fireLevelUp = useCallback(() => {
    setLevelPulse(true);
    setLevelGlimmer(true);
    playLevelUpSound();
    
    setTimeout(() => setLevelPulse(false), 800);
    setTimeout(() => setLevelGlimmer(false), 1000);
  }, []);

  // All animation triggering happens here — when the bubble finishes counting
  const handleCountComplete = useCallback(() => {
    setFrozenPoints(null);
    const realLevel = getLevelFromPoints(stats.points);
    const realTier = getTier(realLevel);
    if (realLevel > animatedLevelRef.current) {
      fireLevelUp();
    }
    if (animatedTierRef.current !== realTier.slug) {
      const old = TIERS.find(t => t.slug === animatedTierRef.current);
      const data = {
        name: realTier.name, color: realTier.color, reward: realTier.rewardDescription,
        previousColor: old?.color ?? realTier.color, previousName: old?.name ?? "",
        newLevel: realLevel,
      };
      setTimeout(() => {
        setTierPromotion(data);
        playTierSound();
      }, 1200);
    }
    animatedLevelRef.current = realLevel;
    animatedTierRef.current = realTier.slug;
  }, [stats.points, fireLevelUp]);

  const handleBubbleDone = useCallback(() => {
    setPointsEvent(null);
  }, []);
  const handleStreakFlash = useCallback(() => {
    setStreakFlash(true);
    setTimeout(() => setStreakFlash(false), 600);
  }, []);

  const hotStreak = stats.currentStreak >= 3;

  return (
    <>
      {tierPromotion && <TierPromotionModal tier={tierPromotion} onClose={() => setTierPromotion(null)} />}
      <div ref={hudRef} className="flex justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className={cn(
            "relative flex items-center rounded-full border backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40",
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
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ color: tier.color, backgroundColor: `${tier.color}20` }}
            >
              T
              <MiniXpRing progress={xpProgress} size={40} strokeWidth={2.5} gradientStops={tier.gradientStops} />
            </div>
            <div className="flex items-center gap-1.5 font-bruce">
              <div className="relative">
                {pointsEvent && (
                  <PointsBubble
                    key={stats._pointsAwardSeq}
                    amount={pointsEvent.amount}
                    baseAmount={pointsEvent.baseAmount}
                    streakMultiplier={pointsEvent.streakMultiplier}
                    onCountComplete={handleCountComplete}
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
                    : {}
                }
                transition={{ duration: 0.5 }}
                className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-full", stats.currentStreak > 0 ? "bg-orange-500/[0.08]" : "bg-foreground/[0.04]")}
              >
                <Flame className={cn("h-3.5 w-3.5", stats.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground/50")} />
                <span className={cn("text-sm font-bold tabular-nums", stats.currentStreak > 0 ? "text-orange-400" : "text-muted-foreground/50")}>{stats.currentStreak}</span>
              </motion.div>
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-foreground/[0.04]">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Card                                                         */
/* ------------------------------------------------------------------ */

function StatsCard({ stats }: { stats: LocalStats }) {
  const level = getLevelFromPoints(stats.points);
  const tier = getTier(level);
  const nextTier = getNextTier(level);
  const levelsToNext = getLevelsToNextTier(level);
  const xpProgress = getXpProgress(stats.points);
  const pointsToNext = getPointsToNextLevel(stats.points);

  const tierSub = nextTier && levelsToNext !== null
    ? `${tier.name} Tier · ${nextTier.name} in ${levelsToNext} lvls`
    : `${tier.name} Tier · Max Tier`;

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${tier.color}40`, background: `linear-gradient(135deg, ${tier.color}10, ${tier.color}06)` }}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Current Level</p>
            <h3 className="text-3xl font-bold"><TierText tier={tier}>{level}</TierText></h3>
            <p className="text-xs text-foreground/30">{tierSub}</p>
          </div>
          <div className="h-11 w-11 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] flex items-center justify-center">
            <Trophy className="h-5 w-5" style={{ color: tier.color }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-foreground/30 mb-1">
            <span>Progress</span>
            <span>{pointsToNext} pts to level {level + 1}</span>
          </div>
          <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${xpProgress}%`, backgroundColor: tier.color }} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{stats.points.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Points</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{stats.episodesCompleted}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Episodes</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{stats.currentStreak}d</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier Roadmap mini                                                  */
/* ------------------------------------------------------------------ */

function TierRoadmap({ currentLevel }: { currentLevel: number }) {
  return (
    <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-4">
      <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-3">Tier Roadmap</p>
      <div className="space-y-1.5">
        {TIERS.map((t) => {
          const active = currentLevel >= t.minLevel;
          const isCurrent = getTier(currentLevel).slug === t.slug;
          return (
            <div key={t.slug} className={cn("flex items-center gap-2 px-2 py-1 rounded-lg text-xs", isCurrent && "bg-foreground/[0.04]")}>
              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: active ? t.color : "transparent", border: active ? "none" : `1.5px solid ${t.color}40` }} />
              <span className={cn("font-bold", active ? "text-foreground" : "text-muted-foreground/50")} style={isCurrent ? { color: t.color } : undefined}>{t.name}</span>
              <span className="text-muted-foreground/40 ml-auto tabular-nums">Lvl {t.minLevel}{t.slug === "cosmic" ? "+" : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function GameTestPage() {
  const [stats, setStats] = useState<LocalStats>(INITIAL_STATS);

  const level = getLevelFromPoints(stats.points);
  const tier = getTier(level);

  const addPoints = (amount: number, raw = false) => {
    setStats(prev => {
      const effective = raw ? amount : Math.floor(amount * prev.streakMultiplier);
      const newPoints = prev.points + effective;
      const completions = amount >= POINTS_PER_COMPLETION ? Math.floor(amount / POINTS_PER_COMPLETION) : 0;
      return {
        ...prev,
        points: newPoints,
        episodesCompleted: prev.episodesCompleted + completions,
        _pointsAwardSeq: prev._pointsAwardSeq + 1,
        _lastAwardAmount: effective,
        _lastBaseAmount: raw ? amount : amount,
      };
    });
  };

  const adjustStreak = (delta: number) => {
    setStats(prev => {
      const newStreak = Math.max(0, prev.currentStreak + delta);
      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        streakMultiplier: newStreak >= 30 ? 2 : newStreak >= 14 ? 1.5 : newStreak >= 7 ? 1.25 : 1,
      };
    });
  };

  const toggleAchievement = (id: string) => {
    setStats(prev => {
      const has = prev.achievements.includes(id);
      if (!has) playAchievementSound();
      return {
        ...prev,
        achievements: has ? prev.achievements.filter(a => a !== id) : [...prev.achievements, id],
      };
    });
  };

  const reset = () => setStats(INITIAL_STATS);

  const pointAmounts = [10, 50, 100, 150, 500, 1000];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Admin</p>
          <h1 className="text-2xl font-black text-foreground">Game Test Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sandboxed gamification tester. Nothing on this page affects your real stats.
          </p>
        </div>

        {/* HUD Pill Preview */}
        <div className="mb-8 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">HUD Pill Preview</p>
          <GameTestHudPill stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Points Controls */}
            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Add Points</p>
                <button onClick={reset} className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                  <RotateCcw className="h-3 w-3" /> Reset All
                </button>
              </div>
              {stats.streakMultiplier > 1 && (
                <p className="text-[10px] text-orange-400 font-bold mb-2">{stats.streakMultiplier}x streak multiplier active</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {pointAmounts.map((amt) => {
                  const actual = Math.floor(amt * stats.streakMultiplier);
                  return (
                  <button
                    key={amt}
                    onClick={() => addPoints(amt)}
                    className="px-3 py-2.5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-colors text-sm font-bold text-foreground"
                  >
                    +{actual}{stats.streakMultiplier > 1 && <span className="text-[10px] text-muted-foreground ml-0.5">({amt})</span>}
                  </button>
                  );
                })}
              </div>
            </div>

            {/* Streak Controls */}
            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">Streak</p>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustStreak(-1)} className="h-9 w-9 rounded-lg border border-foreground/[0.06] bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-colors flex items-center justify-center">
                  <Minus className="h-3.5 w-3.5 text-foreground" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-bold text-foreground tabular-nums">{stats.currentStreak}</span>
                  <span className="text-xs text-muted-foreground ml-1">days</span>
                  {stats.streakMultiplier > 1 && (
                    <span className="ml-2 text-[10px] font-black text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full">{stats.streakMultiplier}x</span>
                  )}
                </div>
                <button onClick={() => adjustStreak(1)} className="h-9 w-9 rounded-lg border border-foreground/[0.06] bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-colors flex items-center justify-center">
                  <Plus className="h-3.5 w-3.5 text-foreground" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => adjustStreak(7)} className="px-3 py-2 rounded-lg border border-foreground/[0.06] bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-colors text-xs font-bold text-foreground">+7 days</button>
                <button onClick={() => adjustStreak(-stats.currentStreak)} className="px-3 py-2 rounded-lg border border-foreground/[0.06] bg-foreground/[0.03] hover:bg-foreground/[0.08] transition-colors text-xs font-bold text-muted-foreground">Reset</button>
              </div>
            </div>

            {/* Quick actions */}
            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
              <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mb-4">Quick Scenarios</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const nextTierObj = getNextTier(level);
                    if (nextTierObj) {
                      const targetLevel = nextTierObj.minLevel;
                      const targetPts = getPointsForLevel(targetLevel);
                      const delta = Math.max(100, targetPts - stats.points);
                      addPoints(delta, true);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-bold text-primary flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" /> Jump to Next Tier
                </button>
              </div>
            </div>
          </div>

          {/* Center: Stats + Tier */}
          <div className="lg:col-span-1 space-y-6">
            <StatsCard stats={stats} />
            <TierRoadmap currentLevel={level} />
          </div>

          {/* Right: Achievements */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">Achievements</p>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {stats.achievements.length}/{ACHIEVEMENTS.length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = stats.achievements.includes(ach.id);
                  return (
                    <button
                      key={ach.id}
                      onClick={() => toggleAchievement(ach.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all text-left",
                        unlocked
                          ? "border-foreground/[0.1] bg-foreground/[0.04]"
                          : "border-transparent bg-foreground/[0.02] opacity-50 hover:opacity-75",
                      )}
                    >
                      <div
                        className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", unlocked ? "text-white" : "text-foreground/20")}
                        style={unlocked ? { backgroundColor: ach.accent } : { backgroundColor: "transparent", border: `1.5px solid ${ach.accent}30` }}
                      >
                        {getAchievementIcon(ach.icon, "h-4 w-4")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-bold truncate", unlocked ? "text-foreground" : "text-muted-foreground")}>{ach.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{ach.description}</p>
                      </div>
                      {unlocked && <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
            Current: Level {level} · {tier.name} Tier · {stats.points.toLocaleString()} pts
          </p>
        </div>
      </div>
    </div>
  );
}
