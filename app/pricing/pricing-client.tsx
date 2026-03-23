"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, AlertCircle } from "lucide-react";
import { FAQList } from "@/components/ui/faq-list";
import type { FAQ } from "@/data/faq";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { STRIPE_PRICES } from "@/lib/stripe/config";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "athlete_pro",
    tier: "athlete_pro" as const,
    name: "Athlete Pro",
    icon: Zap,
    description: "Perfect for driven athletes looking to grow inside a structured system.",
    monthly: { price: 20, priceId: STRIPE_PRICES.athletePro.monthly },
    yearly: { price: 120, priceId: STRIPE_PRICES.athletePro.yearly, savings: "50%" },
    features: [
      "Full access to all video course content",
      "Premium episodes and technique breakdowns",
      "Progress tracking and points system",
      "Leaderboards and achievements",
      "Watch exclusive sparring breakdowns",
      "Cancel at any time",
    ],
    highlighted: false,
  },
  {
    id: "fighter_elite",
    tier: "fighter_elite" as const,
    name: "Fighter Elite +",
    icon: Crown,
    description: "Built for serious fighters seeking elite coaching input and tactical refinement.",
    monthly: { price: 50, priceId: STRIPE_PRICES.fighterElite.monthly },
    yearly: { price: 450, priceId: STRIPE_PRICES.fighterElite.yearly, savings: "25%" },
    features: [
      "Everything included with Athlete Pro",
      "Submit your own sparring/training footage monthly",
      "Personalized video analysis from Jake Peacock",
      "Discounted prices on individual upgrades",
      "Priority support and coaching feedback",
      "Cancel at any time",
    ],
    highlighted: true,
  },
];

interface PricingClientProps {
  faqs: FAQ[];
}

export function PricingClient({ faqs }: PricingClientProps) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { isActive, plan: currentPlan, openBillingPortal } = useSubscription();
  const router = useRouter();

  const handleSubscribe = async (priceId: string, planId: string) => {
    setError(null);
    if (isAuthLoading) return;

    if (!isLoggedIn) {
      router.push("/signup");
      return;
    }

    setLoadingPlan(planId);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoadingPlan(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not create checkout session. Please try again.");
        setLoadingPlan(null);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (tier: string) => isActive && currentPlan === tier;

  return (
    <MainLayout>
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden grain">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.05] blur-[120px]" />

        <Container>
          <div className="relative z-10 text-center mb-16">
            <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
              Membership
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Choose Your Plan</h1>
            <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
              Access all courses, episodes, and premium content. Train like a pro.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center gap-1 mb-14 p-1 rounded-full border border-foreground/[0.08] bg-foreground/[0.02] w-fit mx-auto">
            <button
              onClick={() => setInterval("monthly")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all",
                interval === "monthly"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-foreground/50 hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2",
                interval === "yearly"
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "text-foreground/50 hover:text-foreground"
              )}
            >
              Yearly
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                interval === "yearly"
                  ? "bg-white/20 text-white"
                  : "bg-green-500/15 text-green-400"
              )}>
                Save 50%
              </span>
            </button>
          </div>

          {error && (
            <div className="relative z-10 max-w-2xl mx-auto mb-8 p-4 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {plans.map((plan) => {
              const pricing = interval === "monthly" ? plan.monthly : plan.yearly;
              const Icon = plan.icon;
              const isCurrent = isCurrentPlan(plan.tier);

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-2xl border bg-foreground/[0.02] backdrop-blur-sm overflow-hidden transition-all",
                    isCurrent && "border-green-500/40 shadow-xl shadow-green-500/10",
                    !isCurrent && plan.highlighted && "border-primary/30 shadow-xl shadow-primary/10",
                    !isCurrent && !plan.highlighted && "border-foreground/[0.06]"
                  )}
                >
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent" />
                  )}
                  {!isCurrent && plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}

                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border",
                        isCurrent ? "bg-green-500/10 border-green-500/20" : plan.highlighted ? "bg-primary/10 border-primary/20" : "bg-foreground/[0.04] border-foreground/[0.06]"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5",
                          isCurrent ? "text-green-500" : plan.highlighted ? "text-primary" : "text-foreground/40"
                        )} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        {isCurrent ? (
                          <Badge className="bg-green-500/15 text-green-400 border-green-500/20 text-[10px] mt-1">
                            Your Current Plan
                          </Badge>
                        ) : plan.highlighted ? (
                          <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] mt-1">
                            Most Popular
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <p className="text-sm text-foreground/50 mb-6">{plan.description}</p>

                    <div className="mb-8">
                      <span className="text-5xl font-bold">${pricing.price}</span>
                      <span className="text-foreground/40">
                        /{interval === "monthly" ? "month" : "year"}
                      </span>
                      {interval === "yearly" && "savings" in pricing && (
                        <Badge className="ml-3 bg-green-500/10 text-green-400 border-green-500/20">
                          Save {pricing.savings}
                        </Badge>
                      )}
                      {interval === "yearly" && (
                        <p className="text-sm text-foreground/40 mt-2">
                          Just ${Math.round(pricing.price / 12)}/month billed annually
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className={cn(
                            "h-4 w-4 shrink-0 mt-0.5",
                            isCurrent ? "text-green-500" : "text-primary"
                          )} />
                          <span className="text-sm text-foreground/70">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button
                        className="w-full h-12 text-base font-bold border-foreground/[0.08]"
                        variant="outline"
                        onClick={openBillingPortal}
                      >
                        Manage Subscription
                      </Button>
                    ) : isActive ? (
                      <Button
                        className="w-full h-12 text-base font-bold border-foreground/[0.08]"
                        variant="outline"
                        onClick={openBillingPortal}
                      >
                        Switch Plan
                      </Button>
                    ) : (
                      <Button
                        className={cn(
                          "w-full h-12 text-base font-bold",
                          plan.highlighted
                            ? "shadow-lg shadow-primary/25"
                            : "border-foreground/[0.08]"
                        )}
                        variant={plan.highlighted ? "default" : "outline"}
                        disabled={loadingPlan === plan.id || isAuthLoading}
                        onClick={() => handleSubscribe(pricing.priceId, plan.id)}
                      >
                        {loadingPlan === plan.id
                          ? "Redirecting to checkout..."
                          : isAuthLoading
                          ? "Loading..."
                          : `Subscribe to ${plan.name}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent mb-20" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <FAQList faqs={faqs.slice(0, 3)} />
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
