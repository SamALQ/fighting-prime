"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSent(true);
    setIsSubmitting(false);
  };

  if (isSent) {
    return (
      <MainLayout>
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
          <Container>
            <div className="relative z-10 max-w-md mx-auto">
              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm p-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Check Your Email</h2>
                <p className="text-foreground/50">
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                  password reset link.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="mt-4 border-foreground/[0.08]">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />

        <Container>
          <div className="relative z-10 max-w-md mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-3 block">
                Account Recovery
              </span>
              <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
              <p className="text-foreground/50">
                Enter your email and we&apos;ll send you a reset link
              </p>
            </div>

            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-2 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/25" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm text-foreground/40 hover:text-primary transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
