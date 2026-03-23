"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { DashboardStats } from "@/components/ui/dashboard-stats";
import { MyCourses } from "@/components/ui/my-courses";
import { RecentActivity } from "@/components/ui/dashboard/recent-activity";
import { AchievementsGrid } from "@/components/ui/dashboard/achievements-grid";
import { SubscriptionCard } from "@/components/ui/dashboard/subscription-card";
import { useProgress } from "@/lib/hooks/use-progress";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import type { Course } from "@/data/courses";
import type { Episode } from "@/data/episodes";

interface DashboardClientProps {
  courses: Course[];
  episodes: Episode[];
}

export function DashboardClient({ courses, episodes }: DashboardClientProps) {
  const { userStats, isLoading: isProgressLoading } = useProgress();

  if (isProgressLoading) {
    return null;
  }

  return (
    <MainLayout>
      <Section className="pb-24">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">My Training Dashboard</h1>
              <p className="text-xl text-muted-foreground">
                Track your progress and continue your Muay Thai journey
              </p>
            </div>
            <Button variant="outline" className="gap-2 h-12 px-6 border-primary/20 bg-primary/5 hover:bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
              Demo Achievement
            </Button>
          </div>

          <div className="space-y-12">
            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-12">
                <MyCourses courses={courses} episodes={episodes} />
                <AchievementsGrid unlockedIds={userStats.achievements} />
              </div>

              <div className="lg:col-span-4 space-y-8">
                <SubscriptionCard />
                <RecentActivity />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
