"use client";

import { useProgress } from "@/lib/hooks/use-progress";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakCard() {
  const { userStats, isLoading } = useProgress();

  if (isLoading) {
    return <div className="h-28 bg-foreground/[0.03] animate-pulse rounded-2xl border border-foreground/[0.06]" />;
  }

  const { currentStreak, longestStreak } = userStats;
  const hasStreak = currentStreak > 0;

  return (
    <div className={cn(
      "rounded-2xl border p-5 transition-all",
      hasStreak
        ? "border-orange-500/20 bg-gradient-to-br from-orange-500/[0.06] to-transparent"
        : "border-foreground/[0.06] bg-foreground/[0.02]"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
          hasStreak ? "bg-orange-500/10" : "bg-foreground/[0.04]"
        )}>
          <Flame className={cn("h-6 w-6", hasStreak ? "text-orange-500" : "text-foreground/20")} />
        </div>
        <div>
          <p className="font-bold text-lg leading-tight">
            {hasStreak ? `${currentStreak}-day streak` : "No active streak"}
          </p>
          <p className="text-xs text-foreground/40 mt-0.5">
            {hasStreak
              ? longestStreak > currentStreak
                ? `Best: ${longestStreak} days`
                : "Personal best!"
              : "Watch an episode today to start"}
          </p>
        </div>
      </div>

      {hasStreak && (
        <div className="flex gap-1 mt-3">
          {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full bg-orange-500/60"
            />
          ))}
          {currentStreak < 7 &&
            Array.from({ length: 7 - Math.min(currentStreak, 7) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-1.5 flex-1 rounded-full bg-foreground/[0.06]"
              />
            ))
          }
        </div>
      )}
    </div>
  );
}
