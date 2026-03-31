"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AchievementToastProps {
  achievementIds: string[];
  onDismiss: () => void;
}

export function AchievementToast({ achievementIds, onDismiss }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setVisible(false), 4000);
    const t3 = setTimeout(onDismiss, 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDismiss]);

  const { ACHIEVEMENTS } = require("@/lib/achievements");

  return (
    <div
      className={cn(
        "fixed top-6 right-6 z-[99] transition-all duration-500",
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      <div className="bg-popover/95 backdrop-blur-xl border border-primary/30 rounded-xl p-4 shadow-2xl shadow-primary/10 max-w-sm">
        <div className="text-primary text-xs font-bold tracking-wider uppercase mb-2">
          Achievement{achievementIds.length > 1 ? "s" : ""} Unlocked!
        </div>
        <div className="space-y-2">
          {achievementIds.map((id) => {
            const def = ACHIEVEMENTS.find((a: { id: string }) => a.id === id);
            return def ? (
              <div key={id} className="flex items-center gap-3">
                <div className="text-primary">
                  {require("@/lib/achievements").getAchievementIcon(def.icon, "h-5 w-5")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{def.title}</div>
                  <div className="text-xs text-muted-foreground">{def.description}</div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
