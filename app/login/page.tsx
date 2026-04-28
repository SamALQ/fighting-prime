"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleButton } from "@/components/auth/google-button";
import { useAuth } from "@/lib/hooks/use-auth";
import { Suspense, useState } from "react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => searchParams.get("error") ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const success = await login(email, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password");
      setIsSubmitting(false);
    }
  };

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
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-foreground/50">
                Enter your credentials to access premium content
              </p>
            </div>

            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm p-8 space-y-5">
              <GoogleButton onError={setError} />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-foreground/[0.08]" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-foreground/40 uppercase">
                  Or
                </span>
                <div className="h-px flex-1 bg-foreground/[0.08]" />
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-foreground/40 hover:text-primary transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </form>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-foreground/40">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
