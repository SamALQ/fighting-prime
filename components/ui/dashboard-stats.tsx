"use client";

import { useProgress } from "@/lib/hooks/use-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { userStats, isLoading, formatWatchTime } = useProgress();

  const pointsPerLevel = 1000;
  const currentLevelPoints = userStats.points % pointsPerLevel;
  const progressToNextLevel = (currentLevelPoints / pointsPerLevel) * 100;
  const pointsToNext = pointsPerLevel - currentLevelPoints;

  const stats = [
    {
      label: "Current Level",
      value: userStats.level,
      subtitle: userStats.level >= 20 ? "Silver Tier" : "Bronze Tier",
      icon: <Trophy className="h-6 w-6 text-primary" />,
      color: "from-primary/20 to-transparent",
      extra: (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Progress</span>
            <span>{pointsToNext} pts to level {userStats.level + 1}</span>
          </div>
          <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
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
      subtitle: "Lifetime Earned",
      icon: <Target className="h-6 w-6 text-primary" />,
      color: "from-primary/20 to-transparent",
    },
    {
      label: "Watch Time",
      value: formatWatchTime(userStats.watchTime),
      subtitle: "This month",
      icon: <Clock className="h-6 w-6 text-primary" />,
      color: "from-primary/20 to-transparent",
    },
    {
      label: "Assignments",
      value: userStats.assignmentsCompleted,
      subtitle: "Submitted",
      icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
      color: "from-primary/20 to-transparent",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-2xl border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border overflow-hidden group">
          <CardContent className="p-6 relative h-full flex flex-col justify-between">
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-10 transition-opacity group-hover:opacity-20",
              stat.color
            )} />
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            {stat.extra && <div className="relative">{stat.extra}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}




