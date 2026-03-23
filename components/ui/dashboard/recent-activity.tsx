"use client";

import { useProgress } from "@/lib/hooks/use-progress";
import { CheckCircle2, Trophy, PlayCircle } from "lucide-react";

const icons = {
  completion: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  watch: <PlayCircle className="h-4 w-4 text-blue-500" />,
  level: <Trophy className="h-4 w-4 text-yellow-500" />,
};

export function RecentActivity() {
  const { userStats, isLoading } = useProgress();

  if (isLoading) {
    return <div className="h-48 bg-foreground/[0.03] animate-pulse rounded-2xl border border-foreground/[0.06]" />;
  }

  const activities: { id: string; icon: React.ReactNode; title: string; subtitle: string }[] = [];

  if (userStats.assignmentsCompleted > 0) {
    activities.push({
      id: "completions",
      icon: icons.completion,
      title: `${userStats.assignmentsCompleted} episode${userStats.assignmentsCompleted !== 1 ? "s" : ""} completed`,
      subtitle: "Keep up the great work!",
    });
  }

  if (userStats.level > 1) {
    activities.push({
      id: "level",
      icon: icons.level,
      title: `Reached Level ${userStats.level}`,
      subtitle: `${userStats.points.toLocaleString()} total points earned`,
    });
  }

  if (userStats.watchTime > 0) {
    const hours = Math.floor(userStats.watchTime / 3600);
    const minutes = Math.floor((userStats.watchTime % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    activities.push({
      id: "watchtime",
      icon: icons.watch,
      title: `${timeStr} of training logged`,
      subtitle: `Across ${userStats.coursesStarted.length} course${userStats.coursesStarted.length !== 1 ? "s" : ""}`,
    });
  }

  if (activities.length === 0) {
    activities.push({
      id: "start",
      icon: icons.watch,
      title: "No activity yet",
      subtitle: "Start watching a course to see your progress here",
    });
  }

  return (
    <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
      <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity, idx) => (
          <div key={activity.id} className="relative flex gap-4">
            {idx !== activities.length - 1 && (
              <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-foreground/[0.06]" />
            )}
            <div className="relative z-10 mt-1">
              <div className="h-4 w-4 rounded-full bg-background flex items-center justify-center">
                {activity.icon}
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold leading-none">{activity.title}</p>
              <p className="text-xs text-foreground/40">{activity.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
