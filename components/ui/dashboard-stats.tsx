"use client";

import Image from "next/image";
import { useProgress } from "@/lib/hooks/use-progress";
import { Trophy, Target, Clock, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTier, getNextTier, getLevelsToNextTier, getXpProgress, getPointsToNextLevel, TierText, TIERS } from "@/lib/gamification";

function MiniTierRoadmap({ currentLevel, tier }: { currentLevel: number; tier: ReturnType<typeof getTier> }) {
  return (
    <div className="flex items-center gap-1">
      {TIERS.map((t) => {
        const active = currentLevel >= t.minLevel;
        const isCurrent = tier.slug === t.slug;
        return (
          <div
            key={t.slug}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              isCurrent && "ring-1 ring-offset-1 ring-offset-transparent"
            )}
            style={{
              backgroundColor: active ? t.color : `${t.color}20`,
              ...(isCurrent ? { boxShadow: `0 0 6px ${t.color}60` } : {}),
            }}
            title={`${t.name} — Level ${t.minLevel}+`}
          />
        );
      })}
    </div>
  );
}

export function DashboardStats() {
  const { userStats, isLoading, formatWatchTime } = useProgress();

  const tier = getTier(userStats.level);
  const nextTier = getNextTier(userStats.level);
  const levelsToNext = getLevelsToNextTier(userStats.level);
  const progressToNextLevel = getXpProgress(userStats.points);
  const pointsToNext = getPointsToNextLevel(userStats.points);

  const tierSubtitle = nextTier && levelsToNext !== null
    ? `${nextTier.name} in ${levelsToNext} level${levelsToNext !== 1 ? "s" : ""}`
    : "Max Tier Reached";

  if (isLoading) {
    return (
      <div className="h-[400px] lg:h-[420px] bg-foreground/[0.02] animate-pulse rounded-2xl border border-foreground/[0.06]" />
    );
  }

  return (
    <div className="relative rounded-2xl border overflow-hidden" style={{ borderColor: `${tier.color}20` }}>
      {/* Background — dark base with tier-colored ambient glow */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ background: `radial-gradient(ellipse at 30% 80%, ${tier.color}, transparent 60%)` }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[420px]">

        {/* Left half: Stats card pinned to bottom */}
        <div className="relative z-10 flex flex-col justify-end p-5 sm:p-6">
          {/* Tier name floating above card */}
          <div className="mb-3">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60"
              style={{ color: tier.color }}
            >
              {tier.name} Tier
            </p>
          </div>

          {/* Compact stats card */}
          <div
            className="rounded-xl border backdrop-blur-md p-4 sm:p-5"
            style={{
              borderColor: `${tier.color}25`,
              background: `linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.3))`,
            }}
          >
            {/* Level + Progress */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">
                  Level
                </p>
                <div className="flex items-baseline gap-2.5">
                  <TierText tier={tier} className="text-4xl sm:text-5xl font-black font-bruce">
                    {userStats.level}
                  </TierText>
                  <p className="text-xs text-white/40">{tierSubtitle}</p>
                </div>
              </div>
              <div
                className="h-10 w-10 rounded-lg border flex items-center justify-center shrink-0"
                style={{ borderColor: `${tier.color}30`, background: `${tier.color}15` }}
              >
                <Trophy className="h-4 w-4" style={{ color: tier.color }} />
              </div>
            </div>

            {/* XP bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-white/30 mb-1.5">
                <span>Progress</span>
                <span>{pointsToNext} pts to lvl {userStats.level + 1}</span>
              </div>
              <div className="relative h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${progressToNextLevel}%`,
                    background: `linear-gradient(90deg, ${tier.color}, ${tier.color}BB)`,
                    boxShadow: `0 0 8px ${tier.color}40`,
                  }}
                />
              </div>
              <div className="mt-2">
                <MiniTierRoadmap currentLevel={userStats.level} tier={tier} />
              </div>
            </div>

            {/* Mini stats row */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/[0.06]">
              {[
                {
                  label: "Points",
                  value: userStats.points.toLocaleString(),
                  icon: userStats.streakMultiplier > 1 || userStats.isFirstWatchToday
                    ? <Flame className="h-3 w-3 text-orange-400" />
                    : <Target className="h-3 w-3" style={{ color: tier.color }} />,
                },
                {
                  label: "Time",
                  value: formatWatchTime(userStats.watchTime),
                  icon: <Clock className="h-3 w-3 text-white/40" />,
                },
                {
                  label: "Streak",
                  value: `${userStats.currentStreak}d`,
                  icon: <Flame className="h-3 w-3 text-orange-400" />,
                },
                {
                  label: "Approved",
                  value: `${userStats.assignmentsApproved}`,
                  icon: <CheckCircle2 className="h-3 w-3 text-white/40" />,
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    {s.icon}
                  </div>
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right half: Fighter character */}
        <div className="relative hidden lg:block">
          {/* Tier glow behind character */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[80px] opacity-15"
            style={{ background: tier.color }}
          />
          <div className="absolute inset-0 flex items-end justify-center">
            <Image
              src="/images/fighter-character.png"
              alt="Fighter character"
              width={400}
              height={500}
              className="relative z-10 object-contain max-h-full drop-shadow-[0_0_40px_rgba(215,18,18,0.3)]"
              priority
            />
          </div>
        </div>

        {/* Mobile: character as background, faded */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <div className="absolute right-0 bottom-0 w-[60%] h-full opacity-[0.08]">
            <Image
              src="/images/fighter-character.png"
              alt=""
              fill
              className="object-contain object-right-bottom"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
