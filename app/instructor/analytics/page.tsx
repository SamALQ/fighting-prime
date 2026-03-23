"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ArrowUpDown,
  Clock,
  Eye,
  TrendingUp,
  Layers,
} from "lucide-react";

interface InstructorStats {
  courses: { id: string; title: string }[];
  episodes: {
    id: string;
    title: string;
    course_id: string;
    duration_seconds: number;
    episode_order: number;
  }[];
  totals: { watchSeconds: number; views: number };
  courseStats: Record<string, { watchSeconds: number; viewers: number }>;
  episodeStats: Record<string, { watchSeconds: number; viewers: number }>;
  timeline: { date: string; seconds: number; viewers: number }[];
}

type Range = "7d" | "30d" | "90d" | "all";
type SortKey = "order" | "watchTime" | "viewers" | "duration";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("30d");
  const [sortKey, setSortKey] = useState<SortKey>("watchTime");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instructor/stats");
      if (res.ok) setStats(await res.json());
      setLoading(false);
    })();
  }, []);

  const filteredTimeline = useMemo(() => {
    if (!stats) return [];
    if (range === "all") return stats.timeline;
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const cutoff = daysAgo(days);
    return stats.timeline.filter((d) => d.date >= cutoff);
  }, [stats, range]);

  const rangeStats = useMemo(() => {
    let seconds = 0;
    let viewers = 0;
    for (const d of filteredTimeline) {
      seconds += d.seconds;
      viewers += d.viewers;
    }
    return { seconds, viewers };
  }, [filteredTimeline]);

  const sortedEpisodes = useMemo(() => {
    if (!stats) return [];
    const mapped = stats.episodes.map((ep) => ({
      ...ep,
      watchSeconds: stats.episodeStats[ep.id]?.watchSeconds ?? 0,
      viewers: stats.episodeStats[ep.id]?.viewers ?? 0,
      courseName: stats.courses.find((c) => c.id === ep.course_id)?.title ?? "",
    }));
    mapped.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "order":
          cmp = a.episode_order - b.episode_order;
          break;
        case "watchTime":
          cmp = a.watchSeconds - b.watchSeconds;
          break;
        case "viewers":
          cmp = a.viewers - b.viewers;
          break;
        case "duration":
          cmp = a.duration_seconds - b.duration_seconds;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return mapped;
  }, [stats, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Unable to load analytics data.</p>
      </div>
    );
  }

  const maxTimelineVal = Math.max(
    ...filteredTimeline.map((d) => d.seconds),
    1
  );
  const maxViewerVal = Math.max(
    ...filteredTimeline.map((d) => d.viewers),
    1
  );

  const maxCourseWatch = Math.max(
    ...Object.values(stats.courseStats).map((c) => c.watchSeconds),
    1
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deep dive into your content performance
          </p>
        </div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["7d", "30d", "90d", "all"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:bg-muted text-muted-foreground"
              )}
            >
              {r === "all" ? "All" : r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Period summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Period Watch Time</p>
            <p className="text-xl font-bold">{formatDuration(rangeStats.seconds)}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Period Views</p>
            <p className="text-xl font-bold">{rangeStats.viewers.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Watch time chart */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Watch Time & Viewers</h2>
        </div>
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Watch Time
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-400" /> Viewers
          </span>
        </div>
        {filteredTimeline.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
            No data for this period.
          </div>
        ) : (
          <div className="h-40 flex items-end gap-[3px] relative">
            {filteredTimeline.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-stretch justify-end gap-[1px] group relative h-full">
                {/* Viewer dot */}
                <div
                  className="absolute w-full flex justify-center"
                  style={{
                    bottom: `${(d.viewers / maxViewerVal) * 100}%`,
                  }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400 opacity-60 group-hover:opacity-100" />
                </div>
                {/* Watch time bar */}
                <div
                  className="w-full bg-primary/70 hover:bg-primary rounded-t-sm transition-colors min-h-[2px]"
                  style={{
                    height: `${Math.max((d.seconds / maxTimelineVal) * 100, 2)}%`,
                  }}
                />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border border-border rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-lg z-10">
                  {d.date.slice(5)}: {formatDuration(d.seconds)} / {d.viewers} viewers
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course comparison */}
      <div className="border border-border rounded-xl p-5 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Course Comparison</h2>
        </div>
        {stats.courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No courses assigned.</p>
        ) : (
          <div className="space-y-3">
            {stats.courses.map((course) => {
              const cs = stats.courseStats[course.id];
              const w = cs?.watchSeconds ?? 0;
              return (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(w)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.max((w / maxCourseWatch) * 100, 1)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Episode heatmap table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Episode Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Episode</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Course</th>
                <th
                  className="px-4 py-3 font-medium text-muted-foreground text-right cursor-pointer select-none"
                  onClick={() => toggleSort("duration")}
                >
                  <span className="inline-flex items-center gap-1">
                    Duration
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 font-medium text-muted-foreground text-right cursor-pointer select-none"
                  onClick={() => toggleSort("watchTime")}
                >
                  <span className="inline-flex items-center gap-1">
                    Watch Time
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 font-medium text-muted-foreground text-right cursor-pointer select-none"
                  onClick={() => toggleSort("viewers")}
                >
                  <span className="inline-flex items-center gap-1">
                    Viewers
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedEpisodes.map((ep) => (
                <tr key={ep.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-5">
                        {ep.episode_order}
                      </span>
                      <span className="font-medium">{ep.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ep.courseName}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatDuration(ep.duration_seconds)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {ep.watchSeconds > 0
                      ? formatDuration(ep.watchSeconds)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ep.viewers > 0 ? ep.viewers.toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {sortedEpisodes.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No episode data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retention placeholder */}
      <div className="border border-dashed border-border rounded-xl p-8 text-center bg-card/50">
        <p className="font-medium text-sm mb-1">Viewer Retention</p>
        <p className="text-xs text-muted-foreground">
          Coming soon -- see where viewers drop off in each episode to optimize
          your content structure.
        </p>
      </div>
    </div>
  );
}
