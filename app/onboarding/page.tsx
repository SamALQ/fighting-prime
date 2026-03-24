"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Trophy, Target, Shield, Zap } from "lucide-react";

const EXPERIENCE_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to martial arts", icon: Target },
  { id: "intermediate", label: "Intermediate", desc: "1-3 years training", icon: Shield },
  { id: "advanced", label: "Advanced", desc: "3+ years training", icon: Zap },
  { id: "professional", label: "Professional", desc: "Compete regularly", icon: Trophy },
];

const TRAINING_GOALS = [
  { id: "fitness", label: "Fitness & Health" },
  { id: "competition", label: "Competition Prep" },
  { id: "self-defense", label: "Self Defense" },
  { id: "technique", label: "Technique Improvement" },
  { id: "fun", label: "Fun & Hobby" },
  { id: "mental", label: "Mental Toughness" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [experience, setExperience] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleGoal = (id: string) => {
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  const finish = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name.trim() || undefined,
          experienceLevel: experience,
          trainingGoals: goals,
          onboardingCompleted: true,
        }),
      });
    } catch { /* silent */ }
    router.push("/dashboard");
  };

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? experience !== "" : goals.length > 0;

  return (
    <MainLayout>
      <section className="min-h-[80vh] flex items-center">
        <Container>
          <div className="max-w-lg mx-auto">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-8">
              {[0, 1, 2].map((s) => (
                <div
                  key={s}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all",
                    s <= step ? "bg-primary" : "bg-foreground/[0.08]"
                  )}
                />
              ))}
            </div>

            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome to Fighting Prime</h2>
                  <p className="text-foreground/50">What should we call you?</p>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full h-12 px-4 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] text-lg"
                  autoFocus
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Your Experience Level</h2>
                  <p className="text-foreground/50">This helps us recommend the right content.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const Icon = level.icon;
                    return (
                      <button
                        key={level.id}
                        onClick={() => setExperience(level.id)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          experience === level.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-foreground/[0.08] bg-foreground/[0.02] hover:border-foreground/20"
                        )}
                      >
                        <Icon className={cn("h-6 w-6 mb-2", experience === level.id ? "text-primary" : "text-foreground/30")} />
                        <div className="font-semibold text-sm">{level.label}</div>
                        <div className="text-xs text-foreground/40">{level.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Training Goals</h2>
                  <p className="text-foreground/50">Select all that apply.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {TRAINING_GOALS.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        "p-3 rounded-xl border text-sm font-medium transition-all",
                        goals.includes(goal.id)
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                          : "border-foreground/[0.08] bg-foreground/[0.02] text-foreground/60 hover:border-foreground/20"
                      )}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
              ) : (
                <div />
              )}
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext} className="gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finish} disabled={!canNext || saving} className="gap-1">
                  {saving ? "Setting up..." : "Start Training"} <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
