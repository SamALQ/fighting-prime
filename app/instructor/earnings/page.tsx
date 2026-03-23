"use client";

import { useEffect, useState } from "react";
import { DollarSign, Clock, PieChart, Info } from "lucide-react";

interface EarningsData {
  totals: { watchSeconds: number };
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instructor/stats");
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, []);

  const watchTime = data?.totals.watchSeconds ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-foreground/40 text-sm mt-1">
          Track your revenue share and payout history
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
            <span className="text-sm text-foreground/40">
              Lifetime Earnings
            </span>
          </div>
          <p className="text-2xl font-bold">$0.00</p>
          <p className="text-xs text-foreground/40 mt-1">
            Payouts have not started yet
          </p>
        </div>

        <div className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-foreground/40">
              Total Watch Time
            </span>
          </div>
          <p className="text-2xl font-bold">
            {loading ? "..." : formatDuration(watchTime)}
          </p>
          <p className="text-xs text-foreground/40 mt-1">
            Your content&apos;s accumulated engagement
          </p>
        </div>

        <div className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <PieChart className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-sm text-foreground/40">
              Watch Time Share
            </span>
          </div>
          <p className="text-2xl font-bold">—</p>
          <p className="text-xs text-foreground/40 mt-1">
            Calculated at end of each period
          </p>
        </div>
      </div>

      {/* Payout history */}
      <div className="border border-foreground/[0.06] rounded-xl bg-foreground/[0.02] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-foreground/[0.06]">
          <DollarSign className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Payout History</h2>
        </div>
        <div className="p-12 text-center">
          <DollarSign className="h-10 w-10 text-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground/40">
            No payouts yet
          </p>
          <p className="text-xs text-foreground/40 mt-1">
            Earnings will appear here once the payout system is live.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="border border-foreground/[0.06] rounded-xl p-6 bg-foreground/[0.02]">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">How Earnings Work</h2>
        </div>
        <div className="space-y-3 text-sm text-foreground/40">
          <div className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              1
            </span>
            <p>
              <span className="text-foreground font-medium">
                Watch time is tracked
              </span>{" "}
              -- every second a viewer spends on your content is recorded and
              attributed to you.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              2
            </span>
            <p>
              <span className="text-foreground font-medium">
                Monthly share calculated
              </span>{" "}
              -- at the end of each month, your watch time is compared to total
              platform watch time to determine your share percentage.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
              3
            </span>
            <p>
              <span className="text-foreground font-medium">
                Revenue distributed
              </span>{" "}
              -- net subscription revenue (after platform fee) is distributed
              proportionally based on each instructor&apos;s share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
