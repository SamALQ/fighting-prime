"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, Trophy, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  bonus_points: number;
  badge_icon: string;
  userProgress?: { completed: boolean; completed_at?: string };
}

export function ChallengesTab() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges ?? []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const joinChallenge = async (challengeId: string) => {
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, action: "join" }),
    });
    if (res.ok) fetchChallenges();
  };

  const now = new Date();

  const activeChallenges = challenges.filter((c) => new Date(c.end_date) >= now);
  const pastChallenges = challenges.filter((c) => new Date(c.end_date) < now);

  if (loading) {
    return <div className="text-center text-foreground/30 py-12">Loading challenges...</div>;
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <Flame className="h-12 w-12 text-foreground/20 mx-auto" />
        <h3 className="text-lg font-semibold text-foreground/50">No Active Challenges</h3>
        <p className="text-sm text-foreground/30">Check back soon — new challenges drop regularly!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Active Challenges
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeChallenges.map((c) => {
              const daysLeft = Math.ceil((new Date(c.end_date).getTime() - now.getTime()) / 86400000);
              const completed = c.userProgress?.completed;
              return (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-xl border p-5 space-y-3 transition-all",
                    completed
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        completed ? "bg-green-500/10" : "bg-primary/10"
                      )}>
                        {completed
                          ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                          : <Flame className="h-5 w-5 text-primary animate-pulse" />
                        }
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{c.title}</h4>
                        <span className="text-[10px] text-foreground/40 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysLeft > 0 ? `${daysLeft} days left` : "Ends today"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-primary">
                      <Trophy className="h-3 w-3" />
                      +{c.bonus_points}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/50 leading-relaxed">{c.description}</p>
                  {!c.userProgress && (
                    <Button size="sm" onClick={() => joinChallenge(c.id)} className="w-full">
                      Join Challenge
                    </Button>
                  )}
                  {completed && (
                    <div className="text-xs text-green-500 font-semibold text-center">
                      Completed {c.userProgress?.completed_at ? new Date(c.userProgress.completed_at).toLocaleDateString() : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pastChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground/30 uppercase tracking-wider">Past Challenges</h3>
          <div className="space-y-2">
            {pastChallenges.map((c) => (
              <div key={c.id} className="rounded-lg border border-foreground/[0.04] bg-foreground/[0.01] p-3 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-3">
                  <Flame className="h-4 w-4 text-foreground/20" />
                  <span className="text-sm">{c.title}</span>
                </div>
                {c.userProgress?.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <span className="text-xs text-foreground/30">Missed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
