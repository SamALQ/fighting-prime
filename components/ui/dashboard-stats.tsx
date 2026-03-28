"use client";

import { useProgress } from "@/lib/hooks/use-progress";
import { Trophy, Target, Clock, CheckCircle2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTier, getNextTier, getLevelsToNextTier, getXpProgress, getPointsToNextLevel, TierText } from "@/lib/gamification";

export function DashboardStats() {
  const { userStats, isLoading, formatWatchTime } = useProgress();

  const tier = getTier(userStats.level);
  const nextTier = getNextTier(userStats.level);
  const levelsToNext = getLevelsToNextTier(userStats.level);
  const progressToNextLevel = getXpProgress(userStats.points);
  const pointsToNext = getPointsToNextLevel(userStats.points);

  const multiplierLabel = userStats.streakMultiplier > 1
    ? `${userStats.streakMultiplier}x streak bonus active`
    : userStats.isFirstWatchToday
      ? "2x first-watch bonus!"
      : "Lifetime Earned";

  const tierSubtitle = nextTier && levelsToNext !== null
    ? `${tier.name} Tier · ${nextTier.name} in ${levelsToNext} lvls`
    : `${tier.name} Tier`;

  const stats = [
    {
      label: "Current Level",
      value: userStats.level,
      subtitle: tierSubtitle,
      icon: <Trophy className="h-5 w-5" style={{ color: tier.color }} />,
      borderColor: tier.color,
      tierGradient: tier,
      extra: (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-foreground/30">
            <span>Progress</span>
            <span>{pointsToNext} pts to level {userStats.level + 1}</span>
          </div>
          <div className="relative h-1.5 w-full bg-foreground/[0.06] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressToNextLevel}%`, backgroundColor: tier.color }}
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
      {stats.map((stat) => {
        const hasTier = "tierGradient" in stat && stat.tierGradient;
        return (
        <div
          key={stat.label}
          className={cn(
            "group rounded-2xl border overflow-hidden transition-all",
            hasTier ? "" : "bg-foreground/[0.02] border-foreground/[0.06] hover:border-primary/20"
          )}
          style={hasTier && stat.borderColor ? {
            borderColor: `${stat.borderColor}40`,
            background: `linear-gradient(135deg, ${stat.borderColor}10, ${stat.borderColor}06)`,
          } : undefined}
        >
          <div className="p-6 relative h-full flex flex-col justify-between">
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  {"tierGradient" in stat && stat.tierGradient ? (
                    <h3 className="text-3xl font-bold"><TierText tier={stat.tierGradient}>{stat.value}</TierText></h3>
                  ) : (
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  )}
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
        );
      })}
    </div>
  );
}
