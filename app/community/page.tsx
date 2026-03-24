"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Trophy, Film, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeaderboardTab } from "./leaderboard-tab";
import { ShowcaseTab } from "./showcase-tab";
import { DiscussionsTab } from "./discussions-tab";

const TABS = [
  { key: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
  { key: "showcase" as const, label: "Showcase", icon: Film },
  { key: "discussions" as const, label: "Discussions", icon: MessageCircle },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "showcase" | "discussions">("leaderboard");

  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">Community</h1>
              <p className="text-foreground/40 text-lg">
                Compete on the leaderboard, watch approved assignments, and connect with fighters
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-foreground/[0.03] rounded-xl border border-foreground/[0.06] w-fit">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                    activeTab === tab.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-foreground/40 hover:text-foreground"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "leaderboard" && <LeaderboardTab />}
            {activeTab === "showcase" && <ShowcaseTab />}
            {activeTab === "discussions" && <DiscussionsTab />}
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
