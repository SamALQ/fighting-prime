"use client";

import { useProgress } from "@/lib/hooks/use-progress";
import { Trophy, Target, Clock, CheckCircle2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { userStats, isLoading, formatWatchTime } = useProgress();

  const pointsPerLevel = 1000;
  const currentLevelPoints = userStats.points % pointsPerLevel;
  const progressToNextLevel = (currentLevelPoints / pointsPerLevel) * 100;
  const pointsToNext = pointsPerLevel - currentLevelPoints;

  const multiplierLabel = userStats.streakMultiplier > 1
    ? `${userStats.streakMultiplier}x streak bonus active`
    : userStats.isFirstWatchToday
      ? "2x first-watch bonus!"
      : "Lifetime Earned";

  const stats = [
    {
      label: "Current Level",
      value: userStats.level,
      subtitle: userStats.level >= 20 ? "Silver Tier" : "Bronze Tier",
      icon: <Trophy className="h-5 w-5 text-primary" />,
      extra: (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-foreground/30">
            <span>Progress</span>
            <span>{pointsToNext} pts to level {userStats.level + 1}</span>
          </div>
          <div className="relative h-1.5 w-full bg-foreground/[0.06] rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000"
              style={{ width: `${progressToNextLevel}%` }}
            />
          </div>
        </div>
      )
    },
    {
      label: "Total Points",
      value: userStats.points.toLocaleString(),
      subtitle: multiplierLabel,
      icon: userStats.streakMultiplier > 1 || userStats.isFirstWatchToday
        ? <Flame className="h-5 w-5 text-orange-500" />
        : <Target className="h-5 w-5 text-primary" />,
    },
    {
      label: "Watch Time",
      value: formatWatchTime(userStats.watchTime),
      subtitle: "This month",
      icon: <Clock className="h-5 w-5 text-primary" />,
    },
    {
      label: "Assignments",
      value: `${userStats.assignmentsApproved}/${userStats.assignmentsSubmitted}`,
      subtitle: userStats.assignmentsSubmitted === 0 ? "None submitted" : `${userStats.assignmentPoints} pts earned`,
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-foreground/[0.03] animate-pulse rounded-2xl border border-foreground/[0.06]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden hover:border-primary/20 transition-all"
        >
          <div className="p-6 relative h-full flex flex-col justify-between">
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
                <p className="text-xs text-foreground/30">
                  {stat.subtitle}
                </p>
              </div>
              <div className={cn(
                "h-11 w-11 rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] flex items-center justify-center group-hover:scale-110 transition-transform"
              )}>
                {stat.icon}
              </div>
            </div>
            {stat.extra && <div className="relative">{stat.extra}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
