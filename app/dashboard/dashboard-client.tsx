"use client";

import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { DashboardStats } from "@/components/ui/dashboard-stats";
import { MyCourses } from "@/components/ui/my-courses";
import { RecentActivity } from "@/components/ui/dashboard/recent-activity";
import { AchievementsGrid } from "@/components/ui/dashboard/achievements-grid";
import { SubscriptionCard } from "@/components/ui/dashboard/subscription-card";
import { ContinueWatching } from "@/components/ui/dashboard/continue-watching";
import { StreakCard } from "@/components/ui/dashboard/streak-card";
import { LevelUpOverlay, AchievementToast } from "@/components/ui/level-up-overlay";
import { useProgress } from "@/lib/hooks/use-progress";
import type { Course } from "@/data/courses";
import type { Episode } from "@/data/episodes";

interface DashboardClientProps {
  courses: Course[];
  episodes: Episode[];
}

export function DashboardClient({ courses, episodes }: DashboardClientProps) {
  const {
    userStats,
    isLoading: isProgressLoading,
    levelUpFrom,
    newAchievements,
    dismissLevelUp,
    dismissNewAchievements,
    checkAchievementsNow,
  } = useProgress();

  useEffect(() => {
    if (!isProgressLoading) {
      checkAchievementsNow();
    }
  }, [isProgressLoading, checkAchievementsNow]);

  if (isProgressLoading) {
    return null;
  }

  return (
    <MainLayout>
      {levelUpFrom !== null && (
        <LevelUpOverlay
          fromLevel={levelUpFrom}
          toLevel={userStats.level}
          onDismiss={dismissLevelUp}
        />
      )}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievementIds={newAchievements}
          onDismiss={dismissNewAchievements}
        />
      )}
      <section className="relative py-16 md:py-24 lg:py-32 pb-24 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />

        <Container>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
                  Your Training
                </span>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">My Training Dashboard</h1>
                <p className="text-lg text-foreground/50">
                  Track your progress and continue your Muay Thai journey
                </p>
              </div>
            </div>

            <div className="space-y-12">
              <DashboardStats />

              <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

              <ContinueWatching episodes={episodes} courses={courses} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                  <MyCourses courses={courses} episodes={episodes} />
                  <AchievementsGrid unlockedIds={userStats.achievements} />
                </div>

                <div className="lg:col-span-4 space-y-8">
                  <StreakCard />
                  <SubscriptionCard />
                  <RecentActivity />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
