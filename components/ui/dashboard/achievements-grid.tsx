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
      <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-5 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);
          return (
            <div
              key={achievement.id}
              className="relative group"
            >
              <div
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                  isUnlocked
                    ? "opacity-100"
                    : "opacity-30 grayscale hover:opacity-50"
                )}
                style={{
                  background: "#0A0A0A",
                  border: `2px solid ${isUnlocked ? achievement.accent : "rgba(255,255,255,0.08)"}`,
                  boxShadow: isUnlocked
                    ? `0 0 20px ${achievement.accent}30, inset 0 0 30px ${achievement.accent}10`
                    : "none",
                }}
              >
                {/* Inner glow gradient */}
                {isUnlocked && (
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `radial-gradient(circle at center, ${achievement.accent}40 0%, transparent 70%)`,
                    }}
                  />
                )}

                {/* Icon */}
                <div
                  className="relative z-10"
                  style={{ color: isUnlocked ? achievement.accent : "rgba(255,255,255,0.25)" }}
                >
                  {getAchievementIcon(achievement.icon, "h-8 w-8 sm:h-10 sm:w-10")}
                </div>
              </div>

              {/* Hover tooltip */}
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-black/95 text-white text-[10px] py-2 px-3 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 text-center shadow-xl backdrop-blur-sm">
                <div className="font-bold text-[11px]" style={{ color: isUnlocked ? achievement.accent : undefined }}>
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
