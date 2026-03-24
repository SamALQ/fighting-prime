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
                  background: isUnlocked
                    ? `linear-gradient(160deg, ${c} 0%, ${c}40 50%, ${c}18 100%)`
                    : "linear-gradient(160deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 100%)",
                }}
              >
                {/* Inner card */}
                <div
                  className="flex items-center justify-center relative overflow-hidden"
                  style={{ width: 75, height: 75, borderRadius: 10, background: "#0C0C0C" }}
                >
                  {/* Diagonal color wash */}
                  {isUnlocked && (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(135deg, ${c}25 0%, ${c}08 40%, transparent 70%)`,
                      }}
                    />
                  )}

                  {/* Icon — white when unlocked */}
                  <div
                    className="relative z-10"
                    style={{ color: isUnlocked ? "#FFFFFFDD" : "rgba(255,255,255,0.2)" }}
                  >
                    {getAchievementIcon(achievement.icon, "h-8 w-8")}
                  </div>
                </div>
              </div>

              {/* Hover tooltip */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/95 text-white text-[10px] py-2 px-3 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 text-center shadow-xl backdrop-blur-sm">
                <div className="font-bold text-[11px]" style={{ color: isUnlocked ? c : undefined }}>
                  {achievement.title}
                </div>
                <div className="text-white/50 mt-0.5">{achievement.description}</div>
                {!isUnlocked && <div className="text-white/30 mt-0.5 italic">Locked</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
