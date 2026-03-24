"use client";

import { ACHIEVEMENTS, getAchievementIcon } from "@/lib/achievements";
import { cn } from "@/lib/utils";

export function AchievementsGrid({ unlockedIds = [] }: { unlockedIds?: string[] }) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedIds.includes(a.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Achievements</h3>
        <span className="text-xs text-foreground/30">
          {unlockedCount}/{ACHIEVEMENTS.length}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-5 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className={cn(
                "rounded-xl border flex flex-col items-center justify-center gap-2 p-3 py-4 transition-all group relative",
                isUnlocked
                  ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                  : "border-foreground/[0.06] bg-foreground/[0.02] grayscale opacity-40 hover:opacity-60"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isUnlocked ? "text-primary" : "text-foreground/30"
                )}
              >
                {getAchievementIcon(achievement.icon)}
              </div>
              <span className="text-[9px] font-bold text-center leading-tight uppercase tracking-wider">
                {achievement.title}
              </span>

              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-background text-foreground text-[10px] py-1.5 px-3 rounded border border-foreground/[0.08] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 text-center">
                <div className="font-semibold">{achievement.title}</div>
                <div className="text-foreground/50">{achievement.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
