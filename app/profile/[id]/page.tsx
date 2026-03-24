"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  BookOpen,
  Loader2,
  User,
  Calendar,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface ProfileData {
  profile: {
    id: string;
    displayName: string;
    bio: string;
    role: string;
    avatarUrl: string | null;
    joinedAt: string;
  };
  stats: {
    totalPoints: number;
    level: number;
    totalWatchTime: number;
    completedEpisodes: number;
    coursesStarted: number;
    assignmentsSubmitted: number;
    assignmentsApproved: number;
    assignmentPoints: number;
    currentStreak: number;
    longestStreak: number;
  };
}

function getTier(level: number) {
  if (level >= 50) return { name: "Diamond", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" };
  if (level >= 30) return { name: "Gold", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" };
  if (level >= 20) return { name: "Silver", color: "text-gray-300", bg: "bg-gray-300/10 border-gray-300/20" };
  if (level >= 10) return { name: "Bronze", color: "text-amber-600", bg: "bg-amber-600/10 border-amber-600/20" };
  return { name: "Rookie", color: "text-foreground/40", bg: "bg-foreground/[0.04] border-foreground/[0.08]" };
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0, isFollowing: false });
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/profile?id=${id}`);
        if (res.ok) {
          const d = await res.json();
          setData(d);
          setEditName(d.profile.displayName);
          setEditBio(d.profile.bio);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
    fetch(`/api/follows?userId=${id}`)
      .then((r) => r.json())
      .then((d) => setFollowStats(d))
      .catch(() => {});
  }, [id]);

  const toggleFollow = async () => {
    setFollowLoading(true);
    const action = followStats.isFollowing ? "unfollow" : "follow";
    try {
      await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: id, action }),
      });
      setFollowStats((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followers: prev.followers + (action === "follow" ? 1 : -1),
      }));
    } catch { /* silent */ }
    setFollowLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: editName, bio: editBio }),
      });
      if (res.ok && data) {
        setData({
          ...data,
          profile: { ...data.profile, displayName: editName || data.profile.displayName, bio: editBio },
        });
        setEditing(false);
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Section>
          <Container>
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-foreground/20" />
            </div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  if (!data) {
    return (
      <MainLayout>
        <Section>
          <Container>
            <div className="text-center py-32">
              <User className="h-16 w-16 text-foreground/10 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Fighter not found</h1>
              <p className="text-foreground/40">This profile doesn&apos;t exist.</p>
            </div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  const { profile, stats } = data;
  const tier = getTier(stats.level);
  const pointsInLevel = stats.totalPoints % 1000;
  const progressPct = (pointsInLevel / 1000) * 100;

  const statCards = [
    { label: "Total Points", value: stats.totalPoints.toLocaleString(), icon: Trophy, color: "text-primary" },
    { label: "Watch Time", value: formatTime(stats.totalWatchTime), icon: Clock, color: "text-blue-400" },
    { label: "Episodes Done", value: stats.completedEpisodes, icon: CheckCircle2, color: "text-green-500" },
    { label: "Courses", value: stats.coursesStarted, icon: BookOpen, color: "text-purple-400" },
    { label: "Assignments", value: `${stats.assignmentsApproved}/${stats.assignmentsSubmitted}`, icon: ClipboardCheck, color: "text-orange-400" },
    { label: "Current Streak", value: `${stats.currentStreak}d`, icon: Flame, color: "text-orange-500" },
  ];

  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 text-center relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-4">
                {getInitials(profile.displayName)}
              </div>

              {editing ? (
                <div className="space-y-3 max-w-sm mx-auto">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Display name"
                    maxLength={50}
                    className="w-full px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-center font-bold text-lg focus:border-primary/40 focus:outline-none"
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Write a short bio..."
                    maxLength={300}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-center text-sm focus:border-primary/40 focus:outline-none resize-none"
                  />
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={saveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {profile.role === "instructor" && (
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Coach</Badge>
                    )}
                    {profile.role === "admin" && (
                      <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs">Admin</Badge>
                    )}
                    <Badge className={cn("text-xs border", tier.bg, tier.color)}>
                      Lvl {stats.level} · {tier.name}
                    </Badge>
                  </div>
                  {profile.bio && (
                    <p className="text-foreground/50 text-sm mt-3 max-w-md mx-auto">{profile.bio}</p>
                  )}
                  <div className="flex items-center justify-center gap-4 mt-3 text-sm">
                    <span className="text-foreground/50"><strong className="text-foreground">{followStats.followers}</strong> followers</span>
                    <span className="text-foreground/50"><strong className="text-foreground">{followStats.following}</strong> following</span>
                  </div>
                  {!isOwnProfile && user && (
                    <Button
                      size="sm"
                      variant={followStats.isFollowing ? "outline" : "default"}
                      onClick={toggleFollow}
                      disabled={followLoading}
                      className="mt-3"
                    >
                      {followStats.isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                  <p className="text-foreground/25 text-xs mt-3 flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setEditing(true)}
                      className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] transition-colors"
                    >
                      <Edit3 className="h-4 w-4 text-foreground/30" />
                    </button>
                  )}
                </>
              )}

              {/* Level progress bar */}
              <div className="mt-6 max-w-xs mx-auto">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-foreground/30 mb-1">
                  <span>Level {stats.level}</span>
                  <span>{1000 - pointsInLevel} pts to level {stats.level + 1}</span>
                </div>
                <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 text-center"
                >
                  <stat.icon className={cn("h-5 w-5 mx-auto mb-2", stat.color)} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-[11px] text-foreground/30 uppercase tracking-wider font-bold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Streaks */}
            {stats.longestStreak > 0 && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.04] p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-bold">
                    {stats.currentStreak > 0
                      ? `${stats.currentStreak}-day streak!`
                      : "Start a new streak today"}
                  </p>
                  <p className="text-sm text-foreground/40">
                    Longest streak: {stats.longestStreak} days
                  </p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
