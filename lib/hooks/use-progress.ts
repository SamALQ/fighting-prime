"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Episode } from "@/data/episodes";

export interface UserStats {
  level: number;
  points: number;
  watchTime: number;
  episodesCompleted: number;
  assignmentsSubmitted: number;
  assignmentsApproved: number;
  assignmentPoints: number;
  currentStreak: number;
  longestStreak: number;
  streakMultiplier: number;
  isFirstWatchToday: boolean;
  coursesStarted: string[];
  achievements: string[];
}

export interface ContinueWatchingItem {
  episode_id: string;
  percent_watched: number;
  watch_time_seconds: number;
  updated_at: string;
}

import {
  getLevelFromPoints,
  POINTS_PER_SECOND,
  POINTS_PER_COMPLETION,
} from "@/lib/gamification";

const FLUSH_INTERVAL_MS = 5_000;

interface EpisodeCache {
  percent: number;
  watchTime: number;
  completed: boolean;
}

interface PendingUpdate {
  episodeId: string;
  percent: number;
  watchTimeSeconds: number;
  courseId?: string;
}

interface WatchEventDelta {
  episodeId: string;
  courseId: string;
  watchSeconds: number;
}

export function useProgress() {
  const { user } = useAuth();
  const [episodeMap, setEpisodeMap] = useState<Record<string, EpisodeCache>>({});
  const [coursesStarted, setCoursesStarted] = useState<string[]>([]);
  const [serverAssignmentStats, setServerAssignmentStats] = useState({ submitted: 0, approved: 0, points: 0 });
  const [serverStreakStats, setServerStreakStats] = useState({ current: 0, longest: 0, multiplier: 1, isFirstWatchToday: false });
  const [serverAchievements, setServerAchievements] = useState<string[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelUpFrom, setLevelUpFrom] = useState<number | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const prevLevelRef = useRef<number>(0);
  const levelMountedRef = useRef(false);

  const pendingRef = useRef<Record<string, PendingUpdate>>({});
  const watchEventRef = useRef<Record<string, WatchEventDelta>>({});
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedEpisodesRef = useRef<Set<string>>(new Set());
  const episodeMapRef = useRef<Record<string, EpisodeCache>>({});
  const coursesStartedRef = useRef<string[]>([]);

  episodeMapRef.current = episodeMap;
  coursesStartedRef.current = coursesStarted;

  const flush = useCallback(async () => {
    const pending = { ...pendingRef.current };
    pendingRef.current = {};
    const progressEntries = Object.values(pending);

    const watchDeltas = { ...watchEventRef.current };
    watchEventRef.current = {};
    const watchEntries = Object.values(watchDeltas).filter(
      (e) => e.watchSeconds > 0.5
    );

    const promises: Promise<unknown>[] = [];

    if (progressEntries.length > 0) {
      promises.push(
        ...progressEntries.map((u) =>
          fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(u),
            keepalive: true,
          })
        )
      );
    }

    if (watchEntries.length > 0) {
      promises.push(
        fetch("/api/watch-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: watchEntries }),
          keepalive: true,
        })
      );
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/progress");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (cancelled) return;

        setEpisodeMap(data.episodes ?? {});
        setCoursesStarted(data.stats?.coursesStarted ?? []);
        setServerAssignmentStats({
          submitted: data.stats?.assignmentsSubmitted ?? 0,
          approved: data.stats?.assignmentsApproved ?? 0,
          points: data.stats?.assignmentPoints ?? 0,
        });
        setServerStreakStats({
          current: data.stats?.currentStreak ?? 0,
          longest: data.stats?.longestStreak ?? 0,
          multiplier: data.stats?.streakMultiplier ?? 1,
          isFirstWatchToday: data.stats?.isFirstWatchToday ?? false,
        });
        setServerAchievements(data.achievements ?? []);
        setContinueWatching(data.continueWatching ?? []);

        const knownIds = Object.keys(data.episodes ?? {});
        for (const id of knownIds) {
          savedEpisodesRef.current.add(id);
        }
      } catch {
        // leave empty on error
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    flushTimerRef.current = setInterval(flush, FLUSH_INTERVAL_MS);

    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
      flush();
    };
  }, [user, flush]);

  const computeStats = useCallback((): UserStats => {
    let totalWatchTime = 0;
    let completedCount = 0;

    for (const ep of Object.values(episodeMap)) {
      totalWatchTime += ep.watchTime;
      if (ep.completed) completedCount++;
    }

    const streakMult = serverStreakStats.multiplier;
    const watchPoints = Math.floor(totalWatchTime * POINTS_PER_SECOND * streakMult);
    const completionPoints = completedCount * POINTS_PER_COMPLETION;
    const totalPoints = watchPoints + completionPoints + serverAssignmentStats.points;
    const newLevel = getLevelFromPoints(totalPoints);

    if (levelMountedRef.current && newLevel > prevLevelRef.current) {
      setLevelUpFrom(prevLevelRef.current);
    }
    prevLevelRef.current = newLevel;
    levelMountedRef.current = true;

    return {
      level: newLevel,
      points: totalPoints,
      watchTime: totalWatchTime,
      episodesCompleted: completedCount,
      assignmentsSubmitted: serverAssignmentStats.submitted,
      assignmentsApproved: serverAssignmentStats.approved,
      assignmentPoints: serverAssignmentStats.points,
      currentStreak: serverStreakStats.current,
      longestStreak: serverStreakStats.longest,
      streakMultiplier: serverStreakStats.multiplier,
      isFirstWatchToday: serverStreakStats.isFirstWatchToday,
      coursesStarted,
      achievements: serverAchievements,
    };
  }, [episodeMap, coursesStarted, serverAssignmentStats, serverStreakStats, serverAchievements]);

  const getProgress = useCallback(
    (episodeId: string): number => episodeMapRef.current[episodeId]?.percent ?? 0,
    []
  );

  const getWatchTime = useCallback(
    (episodeId: string): number => episodeMapRef.current[episodeId]?.watchTime ?? 0,
    []
  );

  const updateProgress = useCallback(
    (episodeId: string, percent: number, courseId?: string): boolean => {
      const map = episodeMapRef.current;
      const current = map[episodeId]?.percent ?? 0;
      const newPercent = Math.min(100, Math.max(0, percent));
      const best = Math.max(current, newPercent);

      if (best > current) {
        setEpisodeMap((prev) => ({
          ...prev,
          [episodeId]: {
            ...prev[episodeId],
            percent: best,
            watchTime: prev[episodeId]?.watchTime ?? 0,
            completed: best >= 95,
          },
        }));

        pendingRef.current[episodeId] = {
          ...pendingRef.current[episodeId],
          episodeId,
          percent: best,
          watchTimeSeconds:
            pendingRef.current[episodeId]?.watchTimeSeconds ??
            map[episodeId]?.watchTime ??
            0,
          courseId: courseId ?? pendingRef.current[episodeId]?.courseId,
        };

        if (!savedEpisodesRef.current.has(episodeId)) {
          savedEpisodesRef.current.add(episodeId);
          queueMicrotask(() => flush());
        }
      }

      if (courseId && !coursesStartedRef.current.includes(courseId)) {
        setCoursesStarted((prev) =>
          prev.includes(courseId) ? prev : [...prev, courseId]
        );
      }

      return best >= 95;
    },
    [flush]
  );

  const updateWatchTime = useCallback(
    (episodeId: string, seconds: number, episodeDuration: number) => {
      const map = episodeMapRef.current;
      const actual = Math.min(seconds, episodeDuration);
      const current = map[episodeId]?.watchTime ?? 0;
      const best = Math.max(current, actual);

      if (best > current) {
        setEpisodeMap((prev) => ({
          ...prev,
          [episodeId]: {
            ...prev[episodeId],
            percent: prev[episodeId]?.percent ?? 0,
            watchTime: best,
            completed: prev[episodeId]?.completed ?? false,
          },
        }));

        pendingRef.current[episodeId] = {
          ...pendingRef.current[episodeId],
          episodeId,
          percent:
            pendingRef.current[episodeId]?.percent ??
            map[episodeId]?.percent ??
            0,
          watchTimeSeconds: best,
        };
      }
    },
    []
  );

  const trackWatchEvent = useCallback(
    (episodeId: string, courseId: string, deltaSec: number) => {
      if (deltaSec <= 0 || deltaSec > 2) return;
      const existing = watchEventRef.current[episodeId];
      watchEventRef.current[episodeId] = {
        episodeId,
        courseId,
        watchSeconds: (existing?.watchSeconds ?? 0) + deltaSec,
      };
    },
    []
  );

  const getCourseProgress = useCallback(
    (episodes: Episode[]): number => {
      const map = episodeMapRef.current;
      if (episodes.length === 0) return 0;
      const totalDuration = episodes.reduce(
        (sum, ep) => sum + ep.durationSeconds,
        0
      );
      if (totalDuration === 0) return 0;
      const totalWatched = episodes.reduce((sum, ep) => {
        const watched = map[ep.id]?.watchTime ?? 0;
        return sum + Math.min(watched, ep.durationSeconds);
      }, 0);
      return Math.round((totalWatched / totalDuration) * 100);
    },
    []
  );

  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const dismissLevelUp = useCallback(() => setLevelUpFrom(null), []);
  const dismissNewAchievements = useCallback(() => setNewAchievements([]), []);

  const checkAchievementsNow = useCallback(async () => {
    try {
      const res = await fetch("/api/achievements", { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.newlyUnlocked?.length > 0) {
        setServerAchievements(data.allUnlocked);
        setNewAchievements(data.newlyUnlocked);
      }
    } catch { /* silent */ }
  }, []);

  return {
    progress: Object.fromEntries(
      Object.entries(episodeMap).map(([id, ep]) => [id, ep.percent])
    ),
    watchTime: Object.fromEntries(
      Object.entries(episodeMap).map(([id, ep]) => [id, ep.watchTime])
    ),
    userStats: computeStats(),
    continueWatching,
    isLoading,
    levelUpFrom,
    newAchievements,
    dismissLevelUp,
    dismissNewAchievements,
    checkAchievementsNow,
    updateProgress,
    updateWatchTime,
    trackWatchEvent,
    getProgress,
    getCourseProgress,
    getWatchTime,
    formatWatchTime,
    flush,
  };
}
