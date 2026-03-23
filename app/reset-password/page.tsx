"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => router.push("/dashboard"), 2000);
  };

  if (isSuccess) {
    return (
      <MainLayout>
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
          <Container>
            <div className="relative z-10 max-w-md mx-auto">
              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm p-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold">Password Updated</h2>
                <p className="text-foreground/50">
                  Your password has been reset. Redirecting to your dashboard...
                </p>
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
              <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
              <p className="text-foreground/50">
                Choose a new password for your account
              </p>
            </div>

            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="text-sm font-medium mb-2 block">
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium mb-2 block">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/25" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Password"}
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
