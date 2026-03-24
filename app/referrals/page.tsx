"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Check, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ReferralsPage() {
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [totalReferred, setTotalReferred] = useState(0);
  const [bonusEarned, setBonusEarned] = useState(0);
  const [copied, setCopied] = useState(false);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemResult, setRedeemResult] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((d) => {
        setCode(d.code ?? "");
        setTotalReferred(d.totalReferred ?? 0);
        setBonusEarned(d.bonusEarned ?? 0);
      })
      .catch(() => {});
  }, [user]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const redeem = async () => {
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: redeemCode }),
    });
    const d = await res.json();
    if (res.ok) setRedeemResult(`Success! You earned ${d.bonusPoints} bonus points.`);
    else setRedeemResult(d.error || "Invalid code");
  };

  if (!user) {
    return (
      <MainLayout>
        <Section>
          <Container>
            <p className="text-center text-foreground/40 py-12">Please log in to access referrals.</p>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Section className="pb-24">
        <Container>
          <div className="max-w-lg mx-auto space-y-8">
            <div className="text-center">
              <Gift className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Refer a Friend</h1>
              <p className="text-foreground/50">
                Share your code and both of you earn 500 bonus points when they sign up!
              </p>
            </div>

            <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground/40">Your Referral Code</div>
              <div className="flex items-center gap-3">
                <code className="flex-1 h-12 flex items-center justify-center bg-foreground/[0.04] rounded-lg text-xl font-mono font-bold tracking-wider">
                  {code || "Loading..."}
                </code>
                <Button size="icon" variant="outline" onClick={copyCode} disabled={!code}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center">
                <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalReferred}</div>
                <div className="text-xs text-foreground/40">Friends Referred</div>
              </div>
              <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center">
                <Gift className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{bonusEarned}</div>
                <div className="text-xs text-foreground/40">Bonus Points Earned</div>
              </div>
            </div>

            <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-6 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground/40">Have a Referral Code?</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="flex-1 h-10 px-3 rounded-lg border border-foreground/[0.08] bg-transparent text-sm font-mono"
                />
                <Button onClick={redeem} disabled={!redeemCode}>Redeem</Button>
              </div>
              {redeemResult && (
                <p className="text-sm text-foreground/60">{redeemResult}</p>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
