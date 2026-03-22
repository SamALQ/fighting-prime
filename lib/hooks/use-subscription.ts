"use client";

import { useAuth } from "@/lib/auth-context";

export function useSubscription() {
  const {
    subscription,
    isSubscriptionLoading,
    isLoading: isAuthLoading,
    refreshData,
  } = useAuth();

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isElite = isActive && subscription?.plan === "fighter_elite";

  const openBillingPortal = async () => {
    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  };

  return {
    subscription,
    isLoading: isSubscriptionLoading || isAuthLoading,
    isActive,
    isElite,
    plan: subscription?.plan || null,
    status: subscription?.status || null,
    currentPeriodEnd: subscription?.current_period_end || null,
    openBillingPortal,
    refreshData,
  };
}
