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
      <div className="flex flex-wrap gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          const c = achievement.accent;

          return (
            <div
              key={achievement.id}
              className="relative group"
            >
              {/* Outer shell — gradient border via padding + bg gradient */}
              <div
                className={cn(
                  "p-[2px] transition-all duration-300",
                  !isUnlocked && "opacity-25 grayscale hover:opacity-45"
                )}
                style={{
                  borderRadius: 12,
                  background: isUnlocked ? c : "var(--foreground, #888)10",
                }}
              >
                {/* Inner card */}
                <div
                  className="flex items-center justify-center relative overflow-hidden bg-card"
                  style={{ width: 75, height: 75, borderRadius: 10 }}
                >
                  {/* Diagonal color wash */}
                  {isUnlocked && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, ${c} 85%, var(--card, #fff)) 0%, color-mix(in srgb, ${c} 28%, var(--card, #fff)) 32%, color-mix(in srgb, ${c} 8%, var(--card, #fff)) 55%, var(--card, #fff) 100%)`,
                      }}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={cn("relative z-10", isUnlocked ? "text-white dark:text-white/90" : "text-foreground/20")}
                  >
                    {getAchievementIcon(achievement.icon, "h-8 w-8")}
                  </div>
                </div>
              </div>

              {/* Hover tooltip */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-popover/95 text-popover-foreground text-[10px] py-2 px-3 rounded-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 text-center shadow-xl backdrop-blur-sm">
                <div className="font-bold text-[11px]" style={{ color: isUnlocked ? c : undefined }}>
                  {achievement.title}
                </div>
                <div className="text-muted-foreground mt-0.5">{achievement.description}</div>
                {!isUnlocked && <div className="text-muted-foreground/60 mt-0.5 italic">Locked</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
