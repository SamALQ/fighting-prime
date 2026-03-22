"use client";

import { useState, useEffect } from "react";
import { Episode } from "@/data/episodes";

export interface EpisodeProgress {
  [episodeSlug: string]: number; // percentage watched (0-100)
}

export interface WatchTime {
  [episodeSlug: string]: number; // seconds watched
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface UserStats {
  level: number;
  points: number;
  watchTime: number; // total seconds watched
  assignmentsCompleted: number; // number of completed episodes
  coursesStarted: string[]; // course IDs
  achievements: string[]; // unlocked achievement IDs
}

const POINTS_PER_LEVEL = 1000;
const POINTS_PER_SECOND = 0.5;
const POINTS_PER_COMPLETION = 100;

export function useProgress() {
  const [progress, setProgress] = useState<EpisodeProgress>({});
  const [watchTime, setWatchTime] = useState<WatchTime>({});
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    points: 0,
    watchTime: 0,
    assignmentsCompleted: 0,
    coursesStarted: [],
    achievements: ["into-the-box"], // Default starting achievement
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateLevel = (points: number) => {
    return Math.floor(points / POINTS_PER_LEVEL) + 1;
  };

  useEffect(() => {
    // Load episode progress
    const storedProgress = localStorage.getItem("episodeProgress");
    if (storedProgress) {
      try {
        setProgress(JSON.parse(storedProgress));
      } catch {
        setProgress({});
      }
    }

    // Load watch time
    const storedWatchTime = localStorage.getItem("watchTime");
    let currentWT: WatchTime = {};
    if (storedWatchTime) {
      try {
        currentWT = JSON.parse(storedWatchTime);
        setWatchTime(currentWT);
      } catch {
        setWatchTime({});
      }
    }

    // Load assignments completed
    const storedAssignments = localStorage.getItem("assignmentsCompleted");
    let completedEpisodes: string[] = [];
    if (storedAssignments) {
      try {
        completedEpisodes = JSON.parse(storedAssignments);
      } catch {}
    }

    // Load courses started
    const storedCourses = localStorage.getItem("coursesStarted");
    let courses: string[] = [];
    if (storedCourses) {
      try {
        courses = JSON.parse(storedCourses);
      } catch {}
    }

    // Calculate initial stats
    const totalWatchTime = Object.values(currentWT).reduce((sum: number, seconds: number) => sum + seconds, 0);
    const watchPoints = Math.floor(totalWatchTime * POINTS_PER_SECOND);
    const completionPoints = completedEpisodes.length * POINTS_PER_COMPLETION;
    const totalPoints = watchPoints + completionPoints;

    setUserStats({
      level: calculateLevel(totalPoints),
      points: totalPoints,
      watchTime: totalWatchTime,
      assignmentsCompleted: completedEpisodes.length,
      coursesStarted: courses,
      achievements: ["into-the-box"], // Keep simple for now
    });

    setIsLoading(false);
  }, []);

  const updateProgress = (episodeSlug: string, percent: number, courseId?: string) => {
    const currentProgress = progress[episodeSlug] || 0;
    const newPercent = Math.min(100, Math.max(0, percent));
    const maxProgress = Math.max(currentProgress, newPercent);
    
    if (maxProgress > currentProgress) {
      const newProgress = { ...progress, [episodeSlug]: maxProgress };
      setProgress(newProgress);
      localStorage.setItem("episodeProgress", JSON.stringify(newProgress));
      
      const isNewlyComplete = maxProgress >= 95 && currentProgress < 95;
      
      if (isNewlyComplete) {
        const storedAssignments = localStorage.getItem("assignmentsCompleted");
        let completed: string[] = [];
        if (storedAssignments) {
          try {
            completed = JSON.parse(storedAssignments);
          } catch {}
        }
        if (!completed.includes(episodeSlug)) {
          completed.push(episodeSlug);
          localStorage.setItem("assignmentsCompleted", JSON.stringify(completed));
          
          setUserStats((prev) => {
            const nextPoints = prev.points + POINTS_PER_COMPLETION;
            return {
              ...prev,
              assignmentsCompleted: completed.length,
              points: nextPoints,
              level: calculateLevel(nextPoints),
            };
          });
        }
      }
    }
    
    // Track course as started
    if (courseId) {
      const storedCourses = localStorage.getItem("coursesStarted");
      let coursesStarted: string[] = [];
      if (storedCourses) {
        try {
          coursesStarted = JSON.parse(storedCourses);
        } catch {}
      }
      if (!coursesStarted.includes(courseId)) {
        coursesStarted.push(courseId);
        localStorage.setItem("coursesStarted", JSON.stringify(coursesStarted));
        setUserStats((prev) => ({ ...prev, coursesStarted }));
      }
    }

    return maxProgress >= 95;
  };

  const updateWatchTime = (episodeSlug: string, seconds: number, episodeDuration: number) => {
    const actualSeconds = Math.min(seconds, episodeDuration);
    const currentWatchTime = watchTime[episodeSlug] || 0;
    const maxWatchTime = Math.max(currentWatchTime, actualSeconds);
    
    if (maxWatchTime > currentWatchTime) {
      const diff = maxWatchTime - currentWatchTime;
      const newWatchTime = { ...watchTime, [episodeSlug]: maxWatchTime };
      setWatchTime(newWatchTime);
      localStorage.setItem("watchTime", JSON.stringify(newWatchTime));
      
      setUserStats((prev) => {
        const addedPoints = Math.floor(diff * POINTS_PER_SECOND);
        const nextPoints = prev.points + addedPoints;
        return {
          ...prev,
          watchTime: prev.watchTime + diff,
          points: nextPoints,
          level: calculateLevel(nextPoints),
        };
      });
    }
  };

  const getProgress = (episodeSlug: string): number => {
    return progress[episodeSlug] || 0;
  };

  const getCourseProgress = (episodes: Episode[]): number => {
    if (episodes.length === 0) return 0;
    const totalDuration = episodes.reduce((sum, episode) => sum + episode.durationSeconds, 0);
    if (totalDuration === 0) return 0;
    const totalWatched = episodes.reduce((sum, episode) => {
      const watched = getWatchTime(episode.slug);
      return sum + Math.min(watched, episode.durationSeconds);
    }, 0);
    return Math.round((totalWatched / totalDuration) * 100);
  };

  const getWatchTime = (episodeSlug: string): number => {
    return watchTime[episodeSlug] || 0;
  };

  const formatWatchTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return {
    progress,
    watchTime,
    userStats,
    isLoading,
    updateProgress,
    updateWatchTime,
    getProgress,
    getCourseProgress,
    getWatchTime,
    formatWatchTime,
  };
}
