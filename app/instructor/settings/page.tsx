"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Save, CheckCircle2, AlertCircle, User, Mail, FileText, Image } from "lucide-react";

interface InstructorProfile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  payout_email: string | null;
  approved: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/instructor/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.instructor);
        setEmail(data.email ?? "");
        setDisplayName(data.instructor.display_name ?? "");
        setBio(data.instructor.bio ?? "");
        setAvatarUrl(data.instructor.avatar_url ?? "");
        setPayoutEmail(data.instructor.payout_email ?? "");
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/instructor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, avatarUrl, payoutEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.instructor);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-foreground/[0.04] rounded w-48 animate-pulse" />
        <div className="h-64 bg-foreground/[0.04] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-foreground/40">Unable to load profile.</p>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-foreground/40 text-sm mt-1">
          Manage your instructor profile and payout information
        </p>
      </div>

      {/* Profile section */}
      <div className="border border-foreground/[0.06] rounded-xl bg-foreground/[0.02]">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-foreground/[0.06]">
          <Settings className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Instructor Profile</h2>
        </div>
        <div className="p-5 space-y-5">
          {/* Account info (read-only) */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-foreground/40" />
              <span className="text-sm text-foreground/40">Account Email</span>
            </div>
            <span className="text-sm font-medium">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground/40">Status</span>
            {profile.approved ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
                Approved
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
                Pending Approval
              </span>
            )}
          </div>
          <div className="flex items-center justify-between py-2 border-b border-foreground/[0.06] pb-5">
            <span className="text-sm text-foreground/40">Member since</span>
            <span className="text-sm">{memberSince}</span>
          </div>

          {/* Editable fields */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <User className="h-3.5 w-3.5 text-foreground/40" />
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/[0.06] bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <FileText className="h-3.5 w-3.5 text-foreground/40" />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell viewers about your martial arts background and teaching style..."
              className="w-full px-3 py-2 rounded-lg border border-foreground/[0.06] bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <Image className="h-3.5 w-3.5 text-foreground/40" />
              Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-foreground/[0.06] bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <Mail className="h-3.5 w-3.5 text-foreground/40" />
              Payout Email
            </label>
            <input
              type="email"
              value={payoutEmail}
              onChange={(e) => setPayoutEmail(e.target.value)}
              placeholder="paypal@example.com"
              className="w-full px-3 py-2 rounded-lg border border-foreground/[0.06] bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-foreground/40 mt-1">
              Used for payout notifications and payment processing
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || !displayName.trim()}
              className="gap-2"
            >
              {saving ? (
                "Saving..."
              ) : status === "saved" ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            {status === "error" && (
              <span className="flex items-center gap-1 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed to save. Please try again.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
