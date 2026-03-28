"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Flame, Bell, MessageCircle, Trophy, Clock, CheckCircle2, ChevronUp, ExternalLink, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/hooks/use-progress";
import { useHudNotifications } from "./use-hud-notifications";
import { getTier, getXpProgress, getPointsToNextLevel, getNextTier, getLevelsToNextTier, TierText } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import Link from "next/link";
import confetti from "canvas-confetti";

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
/*  Tier Promotion Modal                                               */
/* ------------------------------------------------------------------ */

function TierPromotionModal({ tier, onClose }: { tier: { name: string; color: string; reward: string }; onClose: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);
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
        <div className="h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center border-2" style={{ borderColor: tier.color, backgroundColor: `${tier.color}15` }}>
          <span className="text-3xl font-black" style={{ color: tier.color }}>{tier.name.charAt(0)}</span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] mb-2" style={{ color: tier.color }}>Tier Promotion</p>
        <h2 className="text-2xl font-black text-foreground mb-2">{tier.name} Tier</h2>
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
  const prevStreakRef = useRef(0);
  const [levelPulse, setLevelPulse] = useState(false);
  const [streakPulse, setStreakPulse] = useState(false);
  const [notifPulse, setNotifPulse] = useState(false);
  const [tierPromotion, setTierPromotion] = useState<{ name: string; color: string; reward: string } | null>(null);
  const prevUnreadRef = useRef(0);

  const level = userStats.level;
  const points = userStats.points;
  const xpProgress = getXpProgress(points);
  const pointsToNext = getPointsToNextLevel(points);
  const tier = getTier(level);
  const nextTier = getNextTier(level);
  const levelsToNextTier = getLevelsToNextTier(level);
  const hotStreak = userStats.currentStreak >= 3;

  useEffect(() => {
    if (prevLevelRef.current > 0 && level > prevLevelRef.current) {
      setLevelPulse(true);
      if (hudRef.current) {
        const rect = hudRef.current.getBoundingClientRect();
        confetti({ particleCount: 30, spread: 60, origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight }, colors: ["#ef4444", "#f97316", "#eab308"], startVelocity: 20, gravity: 1.2, scalar: 0.7 });
      }
      setTimeout(() => setLevelPulse(false), 800);
    }
    prevLevelRef.current = level;
  }, [level]);

  useEffect(() => {
    const currentTierSlug = tier.slug;
    if (prevTierRef.current && prevTierRef.current !== currentTierSlug) {
      setTierPromotion({ name: tier.name, color: tier.color, reward: tier.rewardDescription });
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: [tier.color, "#ffffff", "#ffd700"], startVelocity: 35, gravity: 0.8, scalar: 1.1 });
    }
    prevTierRef.current = currentTierSlug;
  }, [tier]);

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
              <motion.div
                animate={levelPulse ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border"
                style={{
                  background: `linear-gradient(135deg, ${tier.color}15, ${tier.color}08)`,
                  borderColor: `${tier.color}30`,
                }}
              >
                <TierText tier={tier} className="text-[11px] font-black uppercase tracking-wider">Lvl</TierText>
                <TierText tier={tier} className="text-sm font-black tabular-nums">{level}</TierText>
              </motion.div>

              <motion.div animate={streakPulse ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4 }} className={cn("flex items-center gap-1 px-2.5 py-1.5 rounded-full", userStats.currentStreak > 0 ? "bg-orange-500/[0.08]" : "bg-foreground/[0.04]")}>
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
