"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import type { Episode } from "@/data/episodes";

export interface UserStats {
  level: number;
  points: number;
  watchTime: number;
  assignmentsCompleted: number;
  coursesStarted: string[];
  achievements: string[];
}

const POINTS_PER_LEVEL = 1000;
const POINTS_PER_SECOND = 0.5;
const POINTS_PER_COMPLETION = 100;
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

export function useProgress() {
  const { user } = useAuth();
  const [episodeMap, setEpisodeMap] = useState<Record<string, EpisodeCache>>({});
  const [coursesStarted, setCoursesStarted] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pendingRef = useRef<Record<string, PendingUpdate>>({});
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedEpisodesRef = useRef<Set<string>>(new Set());

  const flush = useCallback(async () => {
    const pending = { ...pendingRef.current };
    pendingRef.current = {};
    const entries = Object.values(pending);
    if (entries.length === 0) return;

    await Promise.allSettled(
      entries.map((u) =>
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(u),
          keepalive: true,
        })
      )
    );
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

  const calculateLevel = (points: number) =>
    Math.floor(points / POINTS_PER_LEVEL) + 1;

  const computeStats = useCallback((): UserStats => {
    let totalWatchTime = 0;
    let completedCount = 0;

    for (const ep of Object.values(episodeMap)) {
      totalWatchTime += ep.watchTime;
      if (ep.completed) completedCount++;
    }

    const watchPoints = Math.floor(totalWatchTime * POINTS_PER_SECOND);
    const completionPoints = completedCount * POINTS_PER_COMPLETION;
    const totalPoints = watchPoints + completionPoints;

    return {
      level: calculateLevel(totalPoints),
      points: totalPoints,
      watchTime: totalWatchTime,
      assignmentsCompleted: completedCount,
      coursesStarted,
      achievements: ["into-the-box"],
    };
  }, [episodeMap, coursesStarted]);

  const getProgress = useCallback(
    (episodeId: string): number => episodeMap[episodeId]?.percent ?? 0,
    [episodeMap]
  );

  const getWatchTime = useCallback(
    (episodeId: string): number => episodeMap[episodeId]?.watchTime ?? 0,
    [episodeMap]
  );

  const updateProgress = useCallback(
    (episodeId: string, percent: number, courseId?: string): boolean => {
      const current = episodeMap[episodeId]?.percent ?? 0;
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
            episodeMap[episodeId]?.watchTime ??
            0,
          courseId: courseId ?? pendingRef.current[episodeId]?.courseId,
        };

        if (!savedEpisodesRef.current.has(episodeId)) {
          savedEpisodesRef.current.add(episodeId);
          flush();
        }
      }

      if (courseId && !coursesStarted.includes(courseId)) {
        setCoursesStarted((prev) =>
          prev.includes(courseId) ? prev : [...prev, courseId]
        );
      }

      return best >= 95;
    },
    [episodeMap, coursesStarted, flush]
  );

  const updateWatchTime = useCallback(
    (episodeId: string, seconds: number, episodeDuration: number) => {
      const actual = Math.min(seconds, episodeDuration);
      const current = episodeMap[episodeId]?.watchTime ?? 0;
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
            episodeMap[episodeId]?.percent ??
            0,
          watchTimeSeconds: best,
        };
      }
    },
    [episodeMap]
  );

  const getCourseProgress = useCallback(
    (episodes: Episode[]): number => {
      if (episodes.length === 0) return 0;
      const totalDuration = episodes.reduce(
        (sum, ep) => sum + ep.durationSeconds,
        0
      );
      if (totalDuration === 0) return 0;
      const totalWatched = episodes.reduce((sum, ep) => {
        const watched = episodeMap[ep.id]?.watchTime ?? 0;
        return sum + Math.min(watched, ep.durationSeconds);
      }, 0);
      return Math.round((totalWatched / totalDuration) * 100);
    },
    [episodeMap]
  );

  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return {
    progress: Object.fromEntries(
      Object.entries(episodeMap).map(([id, ep]) => [id, ep.percent])
    ),
    watchTime: Object.fromEntries(
      Object.entries(episodeMap).map(([id, ep]) => [id, ep.watchTime])
    ),
    userStats: computeStats(),
    isLoading,
    updateProgress,
    updateWatchTime,
    getProgress,
    getCourseProgress,
    getWatchTime,
    formatWatchTime,
    flush,
  };
}
