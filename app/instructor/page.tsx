"use client";

import { useEffect, useState } from "react";
import { Clock, Eye, Film, BookOpen, TrendingUp, Trophy, Play } from "lucide-react";

interface InstructorStats {
  instructor: { id: string; display_name: string; approved: boolean };
  courses: { id: string; title: string; slug: string; cover_image: string | null }[];
  episodes: {
    id: string;
    title: string;
    slug: string;
    course_id: string;
    duration_seconds: number;
    episode_order: number;
  }[];
  totals: { watchSeconds: number; views: number; courses: number; episodes: number };
  courseStats: Record<string, { watchSeconds: number; viewers: number }>;
  episodeStats: Record<string, { watchSeconds: number; viewers: number }>;
  timeline: { date: string; seconds: number; viewers: number }[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  sub?: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02]">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm text-foreground/40">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-foreground/30 mt-1">{sub}</p>}
    </div>
  );
}

function MiniChart({ data }: { data: { date: string; seconds: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-foreground/40 text-sm">
        Watch time data will appear here as viewers engage with your content.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.seconds), 1);

  return (
    <div className="h-32 flex items-end gap-[3px]">
      {data.map((d) => (
        <div
          key={d.date}
          className="flex-1 group relative"
        >
          <div
            className="w-full bg-primary/70 hover:bg-primary rounded-t-sm transition-colors min-h-[2px]"
            style={{ height: `${Math.max((d.seconds / maxVal) * 100, 2)}%` }}
          />
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 hidden group-hover:block bg-background border border-foreground/[0.08] rounded px-2 py-1 text-[10px] whitespace-nowrap shadow-lg z-10">
            {d.date.slice(5)}: {formatDuration(d.seconds)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InstructorOverview() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instructor/stats");
      if (res.ok) setStats(await res.json());
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-foreground/[0.04] rounded w-64 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-foreground/[0.03] rounded-xl animate-pulse border border-foreground/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Overview</h1>
        <p className="text-foreground/40">Unable to load dashboard data.</p>
      </div>
    );
  }

  const topEpisodes = stats.episodes
    .map((ep) => ({
      ...ep,
      watchSeconds: stats.episodeStats[ep.id]?.watchSeconds ?? 0,
      viewers: stats.episodeStats[ep.id]?.viewers ?? 0,
      courseName: stats.courses.find((c) => c.id === ep.course_id)?.title ?? "",
    }))
    .sort((a, b) => b.watchSeconds - a.watchSeconds)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {stats.instructor.display_name}
        </h1>
        <p className="text-foreground/40 mt-1">
          Here&apos;s how your content is performing
        </p>
        {!stats.instructor.approved && (
          <div className="mt-3 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-500">
            Your instructor account is pending approval.
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Watch Time"
          value={formatDuration(stats.totals.watchSeconds)}
          icon={Clock}
          sub="Accumulated across all content"
        />
        <StatCard
          label="Unique Viewers"
          value={stats.totals.views.toLocaleString()}
          icon={Eye}
        />
        <StatCard
          label="Courses"
          value={stats.totals.courses.toString()}
          icon={BookOpen}
        />
        <StatCard
          label="Episodes"
          value={stats.totals.episodes.toString()}
          icon={Film}
        />
      </div>

      {/* Watch time chart */}
      <div className="border border-foreground/[0.06] rounded-xl p-5 bg-foreground/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Daily Watch Time</h2>
          </div>
          <span className="text-xs text-foreground/30">Last 30 days</span>
        </div>
        <MiniChart data={stats.timeline} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top episodes */}
        <div className="border border-foreground/[0.06] rounded-xl bg-foreground/[0.02]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-foreground/[0.06]">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Top Episodes</h2>
          </div>
          {topEpisodes.length === 0 ? (
            <div className="p-8 text-center text-foreground/40 text-sm">
              No episode data yet.
            </div>
          ) : (
            <div className="divide-y divide-foreground/[0.06]">
              {topEpisodes.map((ep, i) => (
                <div
                  key={ep.id}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <span className="text-lg font-bold text-foreground/20 w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{ep.title}</p>
                    <p className="text-xs text-foreground/30">
                      {ep.courseName}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold">
                      {formatDuration(ep.watchSeconds)}
                    </p>
                    <p className="text-xs text-foreground/30">
                      {ep.viewers} viewer{ep.viewers !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="border border-foreground/[0.06] rounded-xl bg-foreground/[0.02]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-foreground/[0.06]">
            <Play className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm">Recent Activity</h2>
          </div>
          <div className="p-8 text-center">
            <p className="text-sm text-foreground/40">
              Viewer activity feed coming soon.
            </p>
            <p className="text-xs text-foreground/30 mt-1">
              See completions, milestones, and engagement as they happen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
