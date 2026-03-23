"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setIsSubmitting(false);
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
                <h2 className="text-2xl font-bold">Check Your Email</h2>
                <p className="text-foreground/50">
                  We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                  Click the link to activate your account.
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
                Fighting Prime Academy
              </span>
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-foreground/50">
                Sign up to start your Muay Thai journey
              </p>
            </div>

            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm p-8">
              <form onSubmit={handleSignup} className="space-y-5">
                <div>
                  <label htmlFor="fullName" className="text-sm font-medium mb-2 block">
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
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
                <div>
                  <label htmlFor="password" className="text-sm font-medium mb-2 block">
                    Password
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
                {error && (
                  <div className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full h-11 font-bold shadow-lg shadow-primary/25" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/40">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
