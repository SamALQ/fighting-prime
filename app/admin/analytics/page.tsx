"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  MessageCircle,
  TrendingUp,
  Loader2,
  Film,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Analytics {
  users: {
    total: number;
    instructors: number;
    admins: number;
    newLast30Days: number;
    newLast7Days: number;
  };
  subscriptions: {
    totalActive: number;
    athletePro: number;
    fighterElite: number;
    total: number;
  };
  engagement: {
    uniqueWatchers: number;
    totalWatchTimeHours: number;
    episodesCompleted: number;
    uniqueEpisodesWatched: number;
  };
  assignments: {
    total: number;
    byStatus: Record<string, number>;
  };
  eliteSubmissions: {
    total: number;
    byStatus: Record<string, number>;
  };
  community: {
    totalPosts: number;
    totalReplies: number;
    postsLast30Days: number;
    repliesLast30Days: number;
  };
}

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: typeof Users;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/30">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-foreground/40 mt-0.5">{subtitle}</p>}
        </div>
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-foreground/[0.04]")}>
          <Icon className={cn("h-5 w-5", color ?? "text-primary")} />
        </div>
      </div>
    </div>
  );
}

function StatusBreakdown({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const total = Object.values(data).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-blue-400",
    approved: "bg-green-500",
    needs_revision: "bg-orange-400",
    uploading: "bg-yellow-500",
    in_review: "bg-purple-400",
    responded: "bg-green-500",
  };

  return (
    <div>
      <p className="text-xs font-bold text-foreground/40 mb-2">{title}</p>
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {Object.entries(data).map(([status, count]) => (
          <div
            key={status}
            className={cn("h-full rounded-full", STATUS_COLORS[status] ?? "bg-foreground/20")}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {Object.entries(data).map(([status, count]) => (
          <span key={status} className="text-[11px] text-foreground/40 flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-full inline-block", STATUS_COLORS[status] ?? "bg-foreground/20")} />
            {status.replace("_", " ")}: {count}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) setData(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-foreground/20" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-32 text-foreground/40">Failed to load analytics</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Platform Analytics</h1>
        <p className="text-foreground/40 text-sm">Real-time overview of platform health and engagement</p>
      </div>

      {/* Users */}
      <div>
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" /> Users
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={data.users.total} icon={Users} />
          <StatCard label="New (7 days)" value={data.users.newLast7Days} icon={UserPlus} color="text-green-500" />
          <StatCard label="New (30 days)" value={data.users.newLast30Days} icon={TrendingUp} color="text-blue-400" />
          <StatCard label="Instructors" value={data.users.instructors} subtitle={`${data.users.admins} admins`} icon={Users} color="text-purple-400" />
        </div>
      </div>

      {/* Subscriptions */}
      <div>
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4" /> Subscriptions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Active Subscribers" value={data.subscriptions.totalActive} subtitle={`of ${data.subscriptions.total} total`} icon={CreditCard} color="text-green-500" />
          <StatCard label="Athlete Pro" value={data.subscriptions.athletePro} icon={CreditCard} color="text-blue-400" />
          <StatCard label="Fighter Elite" value={data.subscriptions.fighterElite} icon={Crown} color="text-yellow-400" />
        </div>
      </div>

      {/* Engagement */}
      <div>
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Film className="h-4 w-4" /> Engagement
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active Viewers" value={data.engagement.uniqueWatchers} icon={Users} color="text-primary" />
          <StatCard label="Total Watch Time" value={`${data.engagement.totalWatchTimeHours}h`} icon={Clock} color="text-blue-400" />
          <StatCard label="Episodes Completed" value={data.engagement.episodesCompleted} icon={CheckCircle2} color="text-green-500" />
          <StatCard label="Episodes Watched" value={data.engagement.uniqueEpisodesWatched} subtitle="unique episodes" icon={Film} color="text-purple-400" />
        </div>
      </div>

      {/* Assignments & Elite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" /> Assignments
            </h2>
            <span className="text-xl font-bold">{data.assignments.total}</span>
          </div>
          <StatusBreakdown title="By Status" data={data.assignments.byStatus} />
        </div>

        <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
              <Crown className="h-4 w-4" /> Elite Submissions
            </h2>
            <span className="text-xl font-bold">{data.eliteSubmissions.total}</span>
          </div>
          <StatusBreakdown title="By Status" data={data.eliteSubmissions.byStatus} />
        </div>
      </div>

      {/* Community */}
      <div>
        <h2 className="text-sm font-bold text-foreground/50 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4" /> Community
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Posts" value={data.community.totalPosts} icon={MessageCircle} />
          <StatCard label="Total Replies" value={data.community.totalReplies} icon={MessageCircle} color="text-blue-400" />
          <StatCard label="Posts (30d)" value={data.community.postsLast30Days} icon={TrendingUp} color="text-green-500" />
          <StatCard label="Replies (30d)" value={data.community.repliesLast30Days} icon={TrendingUp} color="text-orange-400" />
        </div>
      </div>
    </div>
  );
}
