"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useSubscription } from "@/lib/hooks/use-subscription";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Mail,
  Shield,
  CreditCard,
  Crown,
  Zap,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user, userEmail, role, isLoading: isAuthLoading } = useAuth();
  const { subscription, isActive, isElite, plan, currentPeriodEnd, openBillingPortal, isLoading: isSubLoading } = useSubscription();
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handlePasswordReset = async () => {
    if (!userEmail) return;
    setPasswordStatus("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setPasswordStatus(error ? "error" : "sent");
    } catch {
      setPasswordStatus("error");
    }
  };

  if (isAuthLoading) {
    return (
      <MainLayout>
        <Section className="pb-24 pt-12">
          <Container>
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="h-8 w-48 bg-muted/50 animate-pulse rounded" />
              <div className="h-64 bg-muted/50 animate-pulse rounded-2xl" />
            </div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  const planName = plan === "fighter_elite" ? "Fighter Elite +" : plan === "athlete_pro" ? "Athlete Pro" : null;
  const PlanIcon = plan === "fighter_elite" ? Crown : Zap;
  const renewDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <MainLayout>
      <Section className="pb-24">
        <Container>
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground mb-10">Manage your profile, subscription, and security.</p>

            <div className="space-y-6">
              {/* Profile Section */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Profile</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Email</span>
                    </div>
                    <span className="text-sm font-medium">{userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Role</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{role}</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-mono">ID</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{user?.id?.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              {/* Subscription Section */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Subscription</h2>
                </div>

                {isSubLoading ? (
                  <div className="h-20 bg-muted/50 animate-pulse rounded-xl" />
                ) : isActive && planName ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <PlanIcon className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{planName}</p>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
                            Active
                          </Badge>
                        </div>
                        {subscription?.billing_interval && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {subscription.billing_interval} billing
                          </p>
                        )}
                      </div>
                    </div>
                    {renewDate && (
                      <p className="text-sm text-muted-foreground">
                        Next billing date: <span className="font-medium text-foreground">{renewDate}</span>
                      </p>
                    )}
                    <Button variant="outline" className="w-full" onClick={openBillingPortal}>
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      You don&apos;t have an active subscription.
                    </p>
                    <Link href="/pricing">
                      <Button className="bg-primary hover:bg-primary/90 font-bold">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Security Section */}
              <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Security</h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-xs text-muted-foreground">
                      Send a password reset link to your email
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePasswordReset}
                    disabled={passwordStatus === "sending" || passwordStatus === "sent"}
                  >
                    {passwordStatus === "sending" ? "Sending..." :
                     passwordStatus === "sent" ? (
                       <span className="flex items-center gap-1">
                         <CheckCircle2 className="h-3 w-3 text-green-500" /> Sent
                       </span>
                     ) :
                     passwordStatus === "error" ? (
                       <span className="flex items-center gap-1">
                         <AlertCircle className="h-3 w-3 text-destructive" /> Retry
                       </span>
                     ) :
                     "Reset Password"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
