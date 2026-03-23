"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Film,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  Globe,
} from "lucide-react";

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
}

interface EpisodeRow {
  id: string;
  title: string;
  slug: string;
  course_id: string;
  duration_seconds: number;
  episode_order: number;
}

interface Stats {
  courses: CourseRow[];
  episodes: EpisodeRow[];
  courseStats: Record<string, { watchSeconds: number; viewers: number }>;
  episodeStats: Record<string, { watchSeconds: number; viewers: number }>;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ContentPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instructor/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.courses.length > 0) {
          setExpandedCourse(data.courses[0].id);
        }
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-foreground/[0.04] rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-foreground/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">My Content</h1>
        <p className="text-foreground/40">Unable to load content data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Content</h1>
        <p className="text-foreground/40 text-sm mt-1">
          View your courses and episode performance
        </p>
      </div>

      {stats.courses.length === 0 ? (
        <div className="border border-dashed border-foreground/[0.06] rounded-xl p-12 text-center bg-foreground/[0.01]">
          <Film className="h-12 w-12 text-foreground/40 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Courses Assigned</h2>
          <p className="text-foreground/40 text-sm">
            Once an admin assigns courses to your account, they will appear here
            with detailed performance stats.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stats.courses.map((course) => {
            const cs = stats.courseStats[course.id];
            const courseEpisodes = stats.episodes
              .filter((ep) => ep.course_id === course.id)
              .sort((a, b) => a.episode_order - b.episode_order);
            const isExpanded = expandedCourse === course.id;
            const totalDuration = courseEpisodes.reduce(
              (sum, ep) => sum + ep.duration_seconds,
              0
            );

            return (
              <div
                key={course.id}
                className="border border-foreground/[0.06] rounded-xl bg-foreground/[0.02] overflow-hidden"
              >
                {/* Course header */}
                <button
                  onClick={() =>
                    setExpandedCourse(isExpanded ? null : course.id)
                  }
                  className="w-full flex items-center gap-4 p-4 hover:bg-foreground/[0.03] transition-colors text-left"
                >
                  <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-foreground/[0.04] flex-shrink-0">
                    {course.cover_image ? (
                      <Image
                        src={course.cover_image}
                        alt={course.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Film className="h-6 w-6 text-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{course.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-xs text-foreground/40">
                      <span className="flex items-center gap-1">
                        <Film className="h-3 w-3" />
                        {courseEpisodes.length} episode{courseEpisodes.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(totalDuration)}
                      </span>
                      {cs && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {cs.viewers} viewer{cs.viewers !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 mr-2">
                    {cs && cs.watchSeconds > 0 && (
                      <p className="text-sm font-semibold text-primary">
                        {formatDuration(cs.watchSeconds)}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-foreground/40 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-foreground/40 flex-shrink-0" />
                  )}
                </button>

                {/* Episode list */}
                {isExpanded && (
                  <div className="border-t border-foreground/[0.06]">
                    {courseEpisodes.length === 0 ? (
                      <div className="p-6 text-center text-foreground/40 text-sm">
                        No episodes in this course yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-foreground/[0.06]">
                        {courseEpisodes.map((ep) => {
                          const es = stats.episodeStats[ep.id];
                          return (
                            <div
                              key={ep.id}
                              className="flex items-center gap-4 px-5 py-3 hover:bg-foreground/[0.03]"
                            >
                              <div className="h-8 w-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-foreground/40">
                                  {ep.episode_order}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {ep.title}
                                </p>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <span className="text-xs text-foreground/40">
                                    {formatDuration(ep.duration_seconds)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-6 flex-shrink-0 text-right">
                                <div>
                                  <p className="text-sm font-medium">
                                    {es && es.watchSeconds > 0
                                      ? formatDuration(es.watchSeconds)
                                      : "—"}
                                  </p>
                                  <p className="text-[10px] text-foreground/40">
                                    watch time
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {es && es.viewers > 0
                                      ? es.viewers.toLocaleString()
                                      : "—"}
                                  </p>
                                  <p className="text-[10px] text-foreground/40">
                                    viewers
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Future features */}
      <div className="border border-dashed border-foreground/[0.06] rounded-xl p-6 bg-foreground/[0.01] text-center">
        <p className="font-medium text-sm mb-1">Content Management</p>
        <p className="text-xs text-foreground/40">
          Coming soon -- upload and manage your episode content, thumbnails, and
          metadata directly from here.
        </p>
      </div>
    </div>
  );
}
