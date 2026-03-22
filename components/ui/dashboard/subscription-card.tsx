"use client";

import { useSubscription } from "@/lib/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, CreditCard } from "lucide-react";
import Link from "next/link";

export function SubscriptionCard() {
  const { subscription, isLoading, isActive, plan, currentPeriodEnd, openBillingPortal } = useSubscription();

  if (isLoading) {
    return <div className="h-40 bg-muted/50 animate-pulse rounded-2xl" />;
  }

  if (!isActive) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase tracking-wider">Subscription</h3>
        </div>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have an active subscription. Subscribe to unlock all premium content.
        </p>
        <Link href="/pricing">
          <Button className="w-full bg-primary hover:bg-primary/90 font-bold">
            View Plans
          </Button>
        </Link>
      </div>
    );
  }

  const planName = plan === "fighter_elite" ? "Fighter Elite +" : "Athlete Pro";
  const PlanIcon = plan === "fighter_elite" ? Crown : Zap;
  const renewDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold uppercase tracking-wider">Subscription</h3>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <PlanIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-bold">{planName}</p>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
              Active
            </Badge>
            {subscription?.billing_interval && (
              <span className="text-xs text-muted-foreground capitalize">
                {subscription.billing_interval}
              </span>
            )}
          </div>
        </div>
      </div>
      {renewDate && (
        <p className="text-xs text-muted-foreground mb-4">
          Next billing date: {renewDate}
        </p>
      )}
      <Button
        variant="outline"
        className="w-full"
        onClick={openBillingPortal}
      >
        Manage Subscription
      </Button>
    </div>
  );
}
