"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { FAQList } from "@/components/ui/faq-list";
import { faqs } from "@/data/faq";
import { useAuth } from "@/lib/hooks/use-auth";
import { STRIPE_PRICES } from "@/lib/stripe/config";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "athlete_pro",
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

export default function PricingPage() {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const handleSubscribe = async (priceId: string, planId: string) => {
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
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setLoadingPlan(null);
      }
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access all courses, episodes, and premium content. Train like a pro.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setInterval("monthly")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                interval === "monthly"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval("yearly")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                interval === "yearly"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <Badge className="ml-2 bg-green-500/20 text-green-500 border-green-500/30 text-[10px]">
                Save up to 50%
              </Badge>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {plans.map((plan) => {
              const pricing = interval === "monthly" ? plan.monthly : plan.yearly;
              const Icon = plan.icon;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative overflow-hidden transition-all",
                    plan.highlighted && "border-primary shadow-xl shadow-primary/10"
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-red-400" />
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        plan.highlighted ? "bg-primary/10" : "bg-muted"
                      )}>
                        <Icon className={cn(
                          "h-5 w-5",
                          plan.highlighted ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        {plan.highlighted && (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] mt-1">
                            Most Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-6">
                      <span className="text-5xl font-bold">${pricing.price}</span>
                      <span className="text-muted-foreground">
                        /{interval === "monthly" ? "month" : "year"}
                      </span>
                      {interval === "yearly" && "savings" in pricing && (
                        <Badge className="ml-3 bg-green-500/10 text-green-500 border-green-500/20">
                          Save {pricing.savings}
                        </Badge>
                      )}
                    </div>
                    {interval === "yearly" && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Just ${Math.round(pricing.price / 12)}/month billed annually
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-4">
                    <Button
                      className={cn(
                        "w-full h-12 text-base font-bold",
                        plan.highlighted
                          ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                          : ""
                      )}
                      variant={plan.highlighted ? "default" : "outline"}
                      disabled={loadingPlan === plan.id}
                      onClick={() => handleSubscribe(pricing.priceId, plan.id)}
                    >
                      {loadingPlan === plan.id
                        ? "Redirecting..."
                        : `Subscribe to ${plan.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <FAQList faqs={faqs.slice(0, 3)} />
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
