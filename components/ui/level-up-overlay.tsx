"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface LevelUpOverlayProps {
  fromLevel: number;
  toLevel: number;
  onDismiss: () => void;
}

export function LevelUpOverlay({ fromLevel, toLevel, onDismiss }: LevelUpOverlayProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("show"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 3500);
    const t3 = setTimeout(onDismiss, 4200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDismiss]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto transition-opacity duration-700",
        phase === "enter" && "opacity-0",
        phase === "show" && "opacity-100",
        phase === "exit" && "opacity-0"
      )}
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Radial light burst */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className={cn(
            "w-[600px] h-[600px] rounded-full transition-all duration-1000",
            phase === "show"
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0"
          )}
          style={{
            background: "radial-gradient(circle, rgba(215,18,18,0.3) 0%, rgba(215,18,18,0.1) 40%, transparent 70%)",
          }}
        />
      </div>

      {/* Streak lines */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute h-[2px] origin-left transition-all",
              phase === "show" ? "opacity-100" : "opacity-0"
            )}
            style={{
              width: phase === "show" ? "40vw" : "0",
              left: "50%",
              top: "50%",
              transform: `rotate(${i * 30}deg)`,
              background: `linear-gradient(90deg, rgba(215,18,18,0.8), transparent)`,
              transitionDuration: `${600 + i * 50}ms`,
              transitionDelay: `${100 + i * 30}ms`,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 rounded-full bg-primary/80 transition-all",
              phase === "show" ? "opacity-100" : "opacity-0"
            )}
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              transitionDuration: `${800 + Math.random() * 400}ms`,
              transitionDelay: `${Math.random() * 500}ms`,
              transform: phase === "show"
                ? `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(${1 + Math.random() * 2})`
                : "translate(0, 0) scale(0)",
            }}
          />
        ))}
      </div>

      {/* Level text */}
      <div
        className={cn(
          "relative z-10 text-center transition-all duration-700",
          phase === "show" ? "scale-100 opacity-100" : "scale-75 opacity-0"
        )}
      >
        <div className="text-primary/60 text-sm font-bold tracking-[0.4em] uppercase mb-2">
          Level Up
        </div>
        <div className="flex items-center gap-4 justify-center">
          <span className="text-4xl font-bold text-white/40">{fromLevel}</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                style={{
                  animation: phase === "show" ? `pulse 0.6s ease-in-out ${i * 0.15}s infinite alternate` : "none",
                }}
              />
            ))}
          </div>
          <span className="text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(215,18,18,0.5)]">
            {toLevel}
          </span>
        </div>
        <div className="mt-4 text-white/50 text-sm">Keep training, fighter!</div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          from { opacity: 0.3; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

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
      <div className="bg-black/90 backdrop-blur-xl border border-primary/30 rounded-xl p-4 shadow-2xl shadow-primary/10 max-w-sm">
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
                  <div className="text-sm font-semibold text-white">{def.title}</div>
                  <div className="text-xs text-white/50">{def.description}</div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
