"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { DrillTimer } from "./drill-timer";
import { TrainingLog } from "./training-log";
import { ChallengesTab } from "./challenges-tab";
import { cn } from "@/lib/utils";
import { Timer, BookOpen, Flame } from "lucide-react";

const TABS = [
  { id: "timer", label: "Drill Timer", icon: Timer },
  { id: "log", label: "Training Log", icon: BookOpen },
  { id: "challenges", label: "Challenges", icon: Flame },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function TrainingClient() {
  const [activeTab, setActiveTab] = useState<TabId>("timer");

  return (
    <MainLayout>
      <Section className="pb-24">
        <Container>
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
              Practice
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Training</h1>
            <p className="text-lg text-foreground/50">
              Train with purpose. Track your sessions, hit your drills, and conquer challenges.
            </p>
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] w-fit mb-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.04]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "timer" && <DrillTimer />}
          {activeTab === "log" && <TrainingLog />}
          {activeTab === "challenges" && <ChallengesTab />}
        </Container>
      </Section>
    </MainLayout>
  );
}
