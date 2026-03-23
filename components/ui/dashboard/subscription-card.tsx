"use client";

import { useSubscription } from "@/lib/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, CreditCard } from "lucide-react";
import Link from "next/link";

export function SubscriptionCard() {
  const { subscription, isLoading, isActive, plan, currentPeriodEnd, openBillingPortal } = useSubscription();

  if (isLoading) {
    return <div className="h-40 bg-foreground/[0.03] animate-pulse rounded-2xl border border-foreground/[0.06]" />;
  }

  if (!isActive) {
    return (
      <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-foreground/30" />
          <h3 className="text-lg font-bold uppercase tracking-wider">Subscription</h3>
        </div>
        <p className="text-foreground/50 mb-6">
          You don&apos;t have an active subscription. Subscribe to unlock all premium content.
        </p>
        <Link href="/pricing">
          <Button className="w-full font-bold shadow-lg shadow-primary/25">
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
    <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold uppercase tracking-wider">Subscription</h3>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <PlanIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-bold">{planName}</p>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">
              Active
            </Badge>
            {subscription?.billing_interval && (
              <span className="text-xs text-foreground/30 capitalize">
                {subscription.billing_interval}
              </span>
            )}
          </div>
        </div>
      </div>
      {renewDate && (
        <p className="text-xs text-foreground/40 mb-4">
          Next billing date: {renewDate}
        </p>
      )}
      <Button
        variant="outline"
        className="w-full border-foreground/[0.08]"
        onClick={openBillingPortal}
      >
        Manage Subscription
      </Button>
    </div>
  );
}
