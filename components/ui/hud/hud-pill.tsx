"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Flame, Bell, MessageCircle, Trophy, Clock, CheckCircle2, ChevronUp, ExternalLink, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/hooks/use-progress";
import { useHudNotifications } from "./use-hud-notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";
import confetti from "canvas-confetti";

const HIDDEN_ROUTES = ["/login", "/signup", "/onboarding", "/reset-password", "/forgot-password"];
const POINTS_PER_LEVEL = 1000;

function getTier(level: number) {
  if (level >= 50) return { name: "Diamond", color: "text-cyan-400", ring: "stroke-cyan-400" };
  if (level >= 30) return { name: "Gold", color: "text-yellow-400", ring: "stroke-yellow-400" };
  if (level >= 20) return { name: "Silver", color: "text-gray-300", ring: "stroke-gray-300" };
  if (level >= 10) return { name: "Bronze", color: "text-amber-600", ring: "stroke-amber-600" };
  return { name: "Rookie", color: "text-foreground/50", ring: "stroke-primary" };
}

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

function MiniXpRing({ progress, size = 36, strokeWidth = 2.5, className }: { progress: number; size?: number; strokeWidth?: number; className?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className={cn("absolute inset-0 -rotate-90", className)}>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-white/[0.08]" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeLinecap="round"
        className="text-primary"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </svg>
  );
}

export function HudPill() {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { userStats, isLoading: progressLoading } = useProgress();
  const { unreadCount } = useHudNotifications();

  const [panelOpen, setPanelOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const rankFetchedRef = useRef(false);
  const hudRef = useRef<HTMLDivElement>(null);

  const prevLevelRef = useRef(0);
  const prevStreakRef = useRef(0);
  const [levelPulse, setLevelPulse] = useState(false);
  const [streakPulse, setStreakPulse] = useState(false);
  const [notifPulse, setNotifPulse] = useState(false);
  const prevUnreadRef = useRef(0);

  const level = userStats.level;
  const points = userStats.points;
  const pointsInLevel = points % POINTS_PER_LEVEL;
  const xpProgress = (pointsInLevel / POINTS_PER_LEVEL) * 100;
  const tier = getTier(level);
  const hotStreak = userStats.currentStreak >= 3;

  // Pulse on level change
  useEffect(() => {
    if (prevLevelRef.current > 0 && level > prevLevelRef.current) {
      setLevelPulse(true);
      // Micro confetti from the HUD
      if (hudRef.current) {
        const rect = hudRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = rect.top / window.innerHeight;
        confetti({ particleCount: 30, spread: 60, origin: { x, y }, colors: ["#ef4444", "#f97316", "#eab308"], startVelocity: 20, gravity: 1.2, scalar: 0.7 });
      }
      setTimeout(() => setLevelPulse(false), 800);
    }
    prevLevelRef.current = level;
  }, [level]);

  // Pulse on streak change
  useEffect(() => {
    if (prevStreakRef.current > 0 && userStats.currentStreak > prevStreakRef.current) {
      setStreakPulse(true);
      setTimeout(() => setStreakPulse(false), 800);
    }
    prevStreakRef.current = userStats.currentStreak;
  }, [userStats.currentStreak]);

  // Pulse on new notifications
  useEffect(() => {
    if (prevUnreadRef.current === 0 && unreadCount > 0) {
      setNotifPulse(true);
      setTimeout(() => setNotifPulse(false), 800);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  // Scroll collapse
  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const y = window.scrollY;
      if (y > lastY + 50 && y > 200) setCollapsed(true);
      if (y < lastY - 30 || y < 100) setCollapsed(false);
      lastY = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close panel on Escape key
  useEffect(() => {
    if (!panelOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") setPanelOpen(false); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [panelOpen]);

  // Fetch leaderboard rank when panel opens (once per session)
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

  const panelContent = (
    <>
      {/* Panel header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary shrink-0">
            {initials}
            <MiniXpRing progress={xpProgress} size={48} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{user?.email?.split("@")[0] ?? "Fighter"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn("text-[10px] font-black uppercase tracking-wider", tier.color)}>
                Lvl {level} · {tier.name}
              </span>
            </div>
          </div>
          <Link
            href={`/profile/${user?.id}`}
            onClick={() => setPanelOpen(false)}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-white/40" />
          </Link>
        </div>

        {/* XP bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">
            <span><AnimatedNumber value={pointsInLevel} /> / {POINTS_PER_LEVEL} XP</span>
            <span>Level {level + 1}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-white/[0.04] p-2.5 text-center">
            <Trophy className="h-3.5 w-3.5 text-primary mx-auto mb-1" />
            <p className="text-sm font-bold text-white"><AnimatedNumber value={points} /></p>
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-bold">Points</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-2.5 text-center">
            <Clock className="h-3.5 w-3.5 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{formatTime(userStats.watchTime)}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-bold">Watch</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-2.5 text-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{userStats.episodesCompleted}</p>
            <p className="text-[9px] text-white/30 uppercase tracking-wider font-bold">Done</p>
          </div>
        </div>

        {/* Leaderboard rank */}
        <div className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <ChevronUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {rankLoading ? "Loading..." : leaderboardRank && leaderboardRank > 0 ? `#${leaderboardRank} on Leaderboard` : "Unranked"}
              </p>
              <p className="text-[10px] text-white/30">Keep training to climb</p>
            </div>
          </div>
          <Link
            href="/community"
            onClick={() => setPanelOpen(false)}
            className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
          >
            View
          </Link>
        </div>
      </div>

      {/* Streak section */}
      {userStats.currentStreak > 0 && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2.5 rounded-xl bg-orange-500/[0.06] border border-orange-500/10 px-3 py-2.5">
            <Flame className="h-5 w-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-xs font-bold text-white">{userStats.currentStreak}-day streak</p>
              <p className="text-[10px] text-white/30">Longest: {userStats.longestStreak}d</p>
            </div>
            {userStats.streakMultiplier > 1 && (
              <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                {userStats.streakMultiplier}x
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Stats panel — bottom sheet on mobile, floating card on desktop */}
      <AnimatePresence>
        {panelOpen && createPortal(
          <>
            {/* Backdrop (mobile only: visible overlay; desktop: transparent click-catcher) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[59] bg-black/60 sm:bg-transparent"
              onClick={() => setPanelOpen(false)}
            />

            {/* Mobile bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 z-[61] sm:hidden max-h-[85vh] flex flex-col rounded-t-2xl bg-[#111] border-t border-white/[0.1] shadow-2xl overflow-hidden"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              {/* Drag handle + close */}
              <div className="flex items-center justify-between px-5 pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/20 mx-auto" />
                <button onClick={() => setPanelOpen(false)} className="absolute right-4 top-3 h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center">
                  <X className="h-4 w-4 text-white/40" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 overscroll-contain">
                {panelContent}
              </div>
            </motion.div>

            {/* Desktop floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="hidden sm:block fixed bottom-20 left-1/2 -translate-x-1/2 z-[61] w-80 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/[0.1] shadow-2xl shadow-black/50 overflow-hidden"
            >
              {panelContent}
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>

      {/* Main pill */}
      <div ref={hudRef} className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] pb-[env(safe-area-inset-bottom)]">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          width: collapsed ? 44 : "auto",
        }}
        transition={{ type: "spring", damping: 22, stiffness: 300 }}
        className={cn(
          "relative flex items-center gap-1 rounded-full border backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden cursor-default max-w-[calc(100vw-2rem)]",
          "bg-black/70 border-white/[0.08]",
          hotStreak && "border-orange-500/30 shadow-orange-500/10",
        )}
      >
        {/* Hot streak ambient glow */}
        {hotStreak && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 20px rgba(249,115,22,0.3), inset 0 0 12px rgba(249,115,22,0.1)" }}
          />
        )}

        <div className={cn("relative z-10 flex items-center gap-1 sm:gap-1 px-1.5 py-1.5", collapsed && "gap-0")}>
          {/* Avatar with XP ring */}
          <motion.button
            onClick={() => setPanelOpen(!panelOpen)}
            whileTap={{ scale: 0.92 }}
            className="relative h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 hover:bg-primary/30 transition-colors"
          >
            {initials}
            <MiniXpRing progress={xpProgress} size={32} strokeWidth={2} className="sm:inset-0 inset-0.5" />
          </motion.button>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-1 overflow-hidden"
              >
                {/* Level */}
                <motion.div
                  animate={levelPulse ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-1 px-2.5 sm:px-2 py-1.5 sm:py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  <span className="text-[10px] font-black text-white/50 uppercase tracking-wider">Lvl</span>
                  <span className="text-xs font-black text-white tabular-nums">{level}</span>
                </motion.div>

                {/* Streak */}
                <motion.div
                  animate={streakPulse ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 sm:px-2 py-1.5 sm:py-1 rounded-full transition-colors",
                    userStats.currentStreak > 0
                      ? "bg-orange-500/[0.08] hover:bg-orange-500/[0.15]"
                      : "bg-white/[0.04] hover:bg-white/[0.08]"
                  )}
                >
                  <Flame className={cn("h-3.5 w-3.5 sm:h-3 sm:w-3", userStats.currentStreak > 0 ? "text-orange-500" : "text-white/30")} />
                  <span className={cn("text-xs font-bold tabular-nums", userStats.currentStreak > 0 ? "text-orange-400" : "text-white/30")}>
                    {userStats.currentStreak}
                  </span>
                </motion.div>

                {/* Notifications */}
                <motion.div
                  animate={notifPulse ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <Link
                    href="/dashboard"
                    className="relative flex items-center justify-center h-8 w-8 sm:h-7 sm:w-7 rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                  >
                    <Bell className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-white/40" />
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 400 }}
                        className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] sm:h-3.5 sm:min-w-[14px] rounded-full bg-primary text-[9px] sm:text-[8px] font-bold text-white flex items-center justify-center px-0.5"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>

                {/* DMs placeholder */}
                <div className="group relative">
                  <div className="flex items-center justify-center h-8 w-8 sm:h-7 sm:w-7 rounded-full bg-white/[0.04] cursor-not-allowed">
                    <MessageCircle className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-white/20" />
                  </div>
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/90 border border-white/10 text-[10px] font-bold text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Coming Soon
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
    </>
  );
}
