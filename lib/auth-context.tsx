"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";

type UserRole = "user" | "instructor" | "admin";

interface UserData {
  id: string;
  email: string;
  role: UserRole;
}

interface SubscriptionData {
  plan: "athlete_pro" | "fighter_elite" | null;
  billing_interval: string | null;
  status: string;
  stripe_customer_id: string | null;
  current_period_end: string | null;
}

interface AuthContextValue {
  user: UserData | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  userEmail: string | null;
  role: UserRole;
  subscription: SubscriptionData | null;
  isSubscriptionLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<UserData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setUser(data.user);
      setSubscription(data.subscription);
    } catch {
      setUser(null);
      setSubscription(null);
    } finally {
      setIsLoading(false);
      setIsSubscriptionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();

    // Listen for auth changes (login/logout/token refresh) to re-fetch
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        fetchUserData();
      }
    });

    return () => {
      authSubscription.unsubscribe();
    };
  }, [supabase, fetchUserData]);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) {
        await fetchUserData();
      }
      return !error;
    },
    [supabase, fetchUserData]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSubscription(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: !!user,
      isLoading,
      userEmail: user?.email ?? null,
      role: user?.role ?? "user",
      subscription,
      isSubscriptionLoading,
      login,
      logout,
      refreshData: fetchUserData,
    }),
    [user, isLoading, subscription, isSubscriptionLoading, login, logout, fetchUserData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
