"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  Trophy,
  Send,
  RotateCcw,
  X,
  FileVideo,
  Film,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AssignmentSubmission {
  id: string;
  user_id: string;
  episode_id: string;
  status: "pending" | "approved" | "needs_revision";
  notes: string;
  feedback: string | null;
  points_awarded: number;
  created_at: string;
  updated_at: string;
  video_url?: string;
  episodes?: {
    title: string;
    slug: string;
    assignment_points: number;
    courses?: { title: string; slug: string };
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending Review", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  approved: { label: "Approved", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  needs_revision: { label: "Revision Requested", color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function InstructorAssignmentsPage() {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "needs_revision">("pending");
  const [selected, setSelected] = useState<AssignmentSubmission | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`/api/instructor/assignments?status=${activeTab}`);
      if (res.ok) setSubmissions(await res.json());
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchSubmissions();
  }, [fetchSubmissions]);

  const viewSubmission = async (id: string) => {
    setLoadingDetail(true);
    setError(null);
    setFeedback("");
    try {
      const res = await fetch(`/api/instructor/assignments?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
        if (data.feedback) setFeedback(data.feedback);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAction = async (action: "approve" | "request_revision") => {
    if (!selected) return;
    if (action === "request_revision" && !feedback.trim()) {
      setError("Feedback is required when requesting a revision");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/instructor/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selected.id,
          action,
          feedback: feedback.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }

      setSelected(null);
      setFeedback("");
      fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TABS = [
    { key: "pending" as const, label: "Pending", icon: Clock },
    { key: "needs_revision" as const, label: "Needs Revision", icon: AlertCircle },
    { key: "approved" as const, label: "Approved", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Assignment Reviews</h1>
        </div>
        <p className="text-foreground/40 text-sm">
          Review student assignment video submissions and provide feedback
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-foreground/[0.03] rounded-xl border border-foreground/[0.06] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelected(null); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground/40 hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List */}
        <div className={cn("space-y-3", selected ? "lg:col-span-4" : "lg:col-span-12")}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 border border-foreground/[0.06] rounded-xl bg-foreground/[0.02]">
              <FileVideo className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-foreground/40">No {activeTab.replace("_", " ")} assignments</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const config = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
              const ep = sub.episodes;
              return (
                <button
                  key={sub.id}
                  onClick={() => viewSubmission(sub.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all group",
                    selected?.id === sub.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0 border border-foreground/[0.06] group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                      <Play className="h-4 w-4 text-foreground/30 group-hover:text-primary fill-current transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {ep && (
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {ep.title}
                        </p>
                      )}
                      {ep?.courses && (
                        <p className="text-xs text-foreground/30 truncate mt-0.5 flex items-center gap-1">
                          <Film className="h-3 w-3 inline shrink-0" />
                          {ep.courses.title}
                        </p>
                      )}
                      {sub.notes && (
                        <p className="text-xs text-foreground/30 truncate mt-1">&ldquo;{sub.notes}&rdquo;</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={cn("text-[10px] h-5 px-2 font-medium border", config.color)}>
                          {config.label}
                        </Badge>
                        <span className="text-[11px] text-foreground/30">{formatDate(sub.created_at)}</span>
                        {ep && (
                          <span className="text-[11px] text-primary flex items-center gap-0.5 ml-auto">
                            <Trophy className="h-3 w-3" />
                            {ep.assignment_points} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden sticky top-4">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
                </div>
              ) : (
                <>
                  <div className="p-5 border-b border-foreground/[0.06] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{selected.episodes?.title}</h3>
                      {selected.episodes?.courses && (
                        <p className="text-xs text-foreground/40 mt-0.5">
                          {selected.episodes.courses.title}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setSelected(null)} className="h-8 w-8 rounded-lg hover:bg-foreground/[0.06] flex items-center justify-center">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {selected.notes && (
                      <div>
                        <p className="text-sm font-medium text-foreground/60 mb-1">Student Notes</p>
                        <p className="text-foreground/50 text-sm">{selected.notes}</p>
                      </div>
                    )}

                    {selected.video_url && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground/60">Submission Video</p>
                        <div className="aspect-video bg-black rounded-xl overflow-hidden">
                          <video
                            src={selected.video_url}
                            controls
                            className="w-full h-full object-contain"
                            preload="metadata"
                          />
                        </div>
                      </div>
                    )}

                    {/* Already reviewed */}
                    {selected.status === "approved" && (
                      <div className="flex items-center gap-2 text-green-500 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">Approved &mdash; {selected.points_awarded} pts awarded</span>
                      </div>
                    )}

                    {selected.feedback && selected.status !== "pending" && (
                      <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl p-4">
                        <p className="text-xs font-medium text-foreground/50 mb-1">Your Feedback</p>
                        <p className="text-sm text-foreground/70 whitespace-pre-wrap">{selected.feedback}</p>
                      </div>
                    )}

                    {/* Review form */}
                    {selected.status === "pending" && (
                      <div className="space-y-4 pt-4 border-t border-foreground/[0.06]">
                        <div>
                          <label className="block text-sm font-medium text-foreground/60 mb-1.5">
                            Feedback <span className="text-foreground/30">(required for revision, optional for approval)</span>
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Great work on the stance transitions! One thing to improve..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors resize-none text-sm"
                            disabled={isSubmitting}
                          />
                        </div>

                        {error && (
                          <p className="text-xs text-red-400 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {error}
                          </p>
                        )}

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAction("approve")}
                            disabled={isSubmitting}
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                          >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Approve (+{selected.episodes?.assignment_points ?? 0} pts)
                          </Button>
                          <Button
                            onClick={() => handleAction("request_revision")}
                            disabled={isSubmitting}
                            variant="outline"
                            className="flex-1 gap-2 border-orange-400/30 text-orange-400 hover:bg-orange-400/10"
                          >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                            Request Revision
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
