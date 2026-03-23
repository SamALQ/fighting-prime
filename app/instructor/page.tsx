"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Clock, Eye, Film, BookOpen, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="p-5 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function TimelineChart({ data }: { data: { date: string; seconds: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
        No data yet. Watch time will appear here as viewers watch your content.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.seconds), 1);

  return (
    <div className="h-40 flex items-end gap-1">
      {data.map((d) => (
        <div
          key={d.date}
          className="flex-1 group relative"
          title={`${d.date}: ${formatDuration(d.seconds)}`}
        >
          <div
            className="w-full bg-primary/80 hover:bg-primary rounded-t transition-colors min-h-[2px]"
            style={{ height: `${(d.seconds / maxVal) * 100}%` }}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg z-10">
            {d.date}: {formatDuration(d.seconds)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InstructorDashboard() {
  const [stats, setStats] = useState<InstructorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instructor/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.courses.length > 0) {
          setSelectedCourse(data.courses[0].id);
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <Section>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
          </div>
        </Section>
      </MainLayout>
    );
  }

  if (!stats) {
    return (
      <MainLayout>
        <Section>
          <h1 className="text-3xl font-bold mb-4">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Unable to load dashboard data.</p>
        </Section>
      </MainLayout>
    );
  }

  const selectedEpisodes = stats.episodes.filter(
    (ep) => ep.course_id === selectedCourse
  );

  return (
    <MainLayout>
      <Section className="pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome, {stats.instructor.display_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your content performance and viewer engagement
          </p>
          {!stats.instructor.approved && (
            <div className="mt-3 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-500">
              Your instructor account is pending approval. Stats will populate
              once approved and content is assigned.
            </div>
          )}
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Total Watch Time"
            value={formatDuration(stats.totals.watchSeconds)}
            icon={Clock}
          />
          <StatCard
            label="Total Views"
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

        {/* Timeline */}
        <div className="border border-border rounded-lg p-5 bg-card mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-semibold">Daily Watch Time (Last 30 Days)</h2>
          </div>
          <TimelineChart data={stats.timeline} />
        </div>

        {/* Course breakdown */}
        {stats.courses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Course Breakdown</h2>

            {/* Course tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {stats.courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors",
                    selectedCourse === course.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                >
                  {course.title}
                </button>
              ))}
            </div>

            {/* Course stats summary */}
            {selectedCourse && stats.courseStats[selectedCourse] && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-sm text-muted-foreground">Course Watch Time</p>
                  <p className="text-xl font-bold">
                    {formatDuration(
                      stats.courseStats[selectedCourse].watchSeconds
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-sm text-muted-foreground">Unique Viewers</p>
                  <p className="text-xl font-bold">
                    {stats.courseStats[selectedCourse].viewers.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Episode table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Episode
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Duration
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Watch Time
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Viewers
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedEpisodes.map((ep) => {
                    const epStat = stats.episodeStats[ep.id];
                    return (
                      <tr key={ep.id} className="bg-card hover:bg-muted/30">
                        <td className="px-4 py-3 text-muted-foreground">
                          {ep.episode_order}
                        </td>
                        <td className="px-4 py-3 font-medium">{ep.title}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {formatDuration(ep.duration_seconds)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {epStat ? formatDuration(epStat.watchSeconds) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {epStat ? epStat.viewers.toLocaleString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {selectedEpisodes.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No episodes for this course yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {stats.courses.length === 0 && (
          <div className="text-center py-12 border border-border rounded-lg bg-card">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Courses Assigned</h2>
            <p className="text-muted-foreground">
              Once an admin assigns courses to your account, your stats will
              appear here.
            </p>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}
