"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface Subscription {
  plan: "athlete_pro" | "fighter_elite" | null;
  billing_interval: string | null;
  status: string;
  stripe_customer_id: string | null;
  current_period_end: string | null;
}

export function useSubscription() {
  const supabase = useMemo(() => createClient(), []);
  const { user, isLoading: isAuthLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSubscription = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select(
          "plan, billing_interval, status, stripe_customer_id, current_period_end"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setSubscription(data);
        setIsLoading(false);
      }
    };

    fetchSubscription();

    return () => {
      cancelled = true;
    };
  }, [user, isAuthLoading, supabase]);

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
    isLoading: isLoading || isAuthLoading,
    isActive,
    isElite,
    plan: subscription?.plan || null,
    status: subscription?.status || null,
    currentPeriodEnd: subscription?.current_period_end || null,
    openBillingPortal,
  };
}
