"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Crown,
  Clock,
  Eye,
  CheckCircle2,
  Loader2,
  Play,
  MessageSquare,
  Send,
  Upload,
  FileVideo,
  ChevronLeft,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: "uploading" | "pending" | "in_review" | "responded";
  created_at: string;
  responded_at: string | null;
  assigned_instructor_id: string | null;
  video_key?: string;
  video_url?: string;
  response_video_key?: string;
  response_video_url?: string;
  response_text?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Awaiting Review", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Clock },
  in_review: { label: "In Review", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: Eye },
  responded: { label: "Responded", color: "text-green-500 bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function InstructorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "in_review" | "responded">("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [responseText, setResponseText] = useState("");
  const [responseFile, setResponseFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const responseFileRef = useRef<HTMLInputElement>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`/api/instructor/submissions?status=${activeTab}`);
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
    setResponseText("");
    setResponseFile(null);
    try {
      const res = await fetch(`/api/instructor/submissions?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSubmission(data);
        if (data.response_text) setResponseText(data.response_text);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingDetail(false);
    }
  };

  const claimSubmission = async () => {
    if (!selectedSubmission) return;
    try {
      const res = await fetch("/api/instructor/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: selectedSubmission.id, action: "claim" }),
      });
      if (res.ok) {
        setSelectedSubmission({ ...selectedSubmission, status: "in_review" });
        fetchSubmissions();
      }
    } catch {
      setError("Failed to claim submission");
    }
  };

  const submitResponse = async () => {
    if (!selectedSubmission) return;
    if (!responseText.trim() && !responseFile) {
      setError("Please write feedback or upload a response video");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      let responseVideoKey: string | undefined;

      if (responseFile) {
        const urlRes = await fetch("/api/instructor/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: selectedSubmission.id,
            action: "get_upload_url",
            contentType: responseFile.type,
          }),
        });

        if (!urlRes.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl, responseKey } = await urlRes.json();
        responseVideoKey = responseKey;

        const xhr = new XMLHttpRequest();
        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed: ${xhr.status}`));
          });
          xhr.addEventListener("error", () => reject(new Error("Upload failed")));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", responseFile.type);
          xhr.send(responseFile);
        });
      }

      const res = await fetch("/api/instructor/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          action: "respond",
          responseText: responseText.trim(),
          responseVideoKey,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit response");

      setSelectedSubmission(null);
      setResponseText("");
      setResponseFile(null);
      fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit response");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const TABS = [
    { key: "pending" as const, label: "Pending", icon: Clock },
    { key: "in_review" as const, label: "In Review", icon: Eye },
    { key: "responded" as const, label: "Responded", icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Elite Submissions</h1>
        </div>
        <p className="text-foreground/40 text-sm">
          Review and respond to Fighter Elite member video submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-foreground/[0.03] rounded-xl border border-foreground/[0.06] w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedSubmission(null); }}
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
        {/* Submission List */}
        <div className={cn("space-y-3", selectedSubmission ? "lg:col-span-4" : "lg:col-span-12")}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 border border-foreground/[0.06] rounded-xl bg-foreground/[0.02]">
              <FileVideo className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-foreground/40">No {activeTab.replace("_", " ")} submissions</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const config = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
              return (
                <button
                  key={sub.id}
                  onClick={() => viewSubmission(sub.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all group",
                    selectedSubmission?.id === sub.id
                      ? "border-primary/30 bg-primary/5"
                      : "border-foreground/[0.06] bg-foreground/[0.02] hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0 border border-foreground/[0.06] group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                      <Play className="h-4 w-4 text-foreground/30 group-hover:text-primary fill-current transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {sub.title}
                      </p>
                      {sub.description && (
                        <p className="text-xs text-foreground/30 truncate mt-0.5">{sub.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={cn("text-[10px] h-5 px-2 font-medium border", config.color)}>
                          {config.label}
                        </Badge>
                        <span className="text-[11px] text-foreground/30">{formatDate(sub.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail Panel */}
        {selectedSubmission && (
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden sticky top-4">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-6 w-6 animate-spin text-foreground/30" />
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-5 border-b border-foreground/[0.06] flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{selectedSubmission.title}</h3>
                      <p className="text-xs text-foreground/40 mt-0.5">
                        Submitted {formatDate(selectedSubmission.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="h-8 w-8 rounded-lg hover:bg-foreground/[0.06] flex items-center justify-center lg:hidden"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                    {selectedSubmission.description && (
                      <div>
                        <p className="text-sm font-medium text-foreground/60 mb-1">Student Notes</p>
                        <p className="text-foreground/50 text-sm">{selectedSubmission.description}</p>
                      </div>
                    )}

                    {/* Student's video */}
                    {selectedSubmission.video_url && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground/60">Student&apos;s Video</p>
                        <div className="aspect-video bg-black rounded-xl overflow-hidden">
                          <video
                            src={selectedSubmission.video_url}
                            controls
                            className="w-full h-full object-contain"
                            preload="metadata"
                          />
                        </div>
                      </div>
                    )}

                    {/* Existing response */}
                    {selectedSubmission.status === "responded" && (
                      <div className="space-y-3 pt-4 border-t border-foreground/[0.06]">
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="h-4 w-4" />
                          <p className="font-bold text-sm">Response Sent</p>
                        </div>
                        {selectedSubmission.response_text && (
                          <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl p-4">
                            <p className="text-foreground/60 text-sm whitespace-pre-wrap">
                              {selectedSubmission.response_text}
                            </p>
                          </div>
                        )}
                        {selectedSubmission.response_video_url && (
                          <div className="aspect-video bg-black rounded-xl overflow-hidden">
                            <video
                              src={selectedSubmission.response_video_url}
                              controls
                              className="w-full h-full object-contain"
                              preload="metadata"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Response form */}
                    {selectedSubmission.status !== "responded" && (
                      <div className="space-y-4 pt-4 border-t border-foreground/[0.06]">
                        <div className="flex items-center gap-2 text-primary">
                          <MessageSquare className="h-4 w-4" />
                          <p className="font-bold text-sm uppercase tracking-wider">Your Response</p>
                        </div>

                        {selectedSubmission.status === "pending" && (
                          <Button onClick={claimSubmission} variant="outline" className="w-full gap-2">
                            <Eye className="h-4 w-4" />
                            Claim &amp; Start Reviewing
                          </Button>
                        )}

                        {selectedSubmission.status === "in_review" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-foreground/60 mb-1.5">
                                Written Feedback
                              </label>
                              <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Share your analysis, areas for improvement, and what they're doing well..."
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors resize-none text-sm"
                                disabled={isSubmitting}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-foreground/60 mb-1.5">
                                Video Response <span className="text-foreground/30">(optional)</span>
                              </label>
                              {responseFile ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
                                  <FileVideo className="h-5 w-5 text-primary shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{responseFile.name}</p>
                                    <p className="text-xs text-foreground/40">{formatFileSize(responseFile.size)}</p>
                                  </div>
                                  {!isSubmitting && (
                                    <button
                                      onClick={() => setResponseFile(null)}
                                      className="h-7 w-7 rounded-lg hover:bg-foreground/[0.06] flex items-center justify-center"
                                    >
                                      <X className="h-3.5 w-3.5 text-foreground/40" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => responseFileRef.current?.click()}
                                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-foreground/[0.08] hover:border-primary/30 hover:bg-foreground/[0.03] transition-all text-sm text-foreground/40"
                                  disabled={isSubmitting}
                                >
                                  <Upload className="h-4 w-4" />
                                  Choose video file
                                </button>
                              )}
                              <input
                                ref={responseFileRef}
                                type="file"
                                accept="video/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) setResponseFile(f);
                                }}
                              />
                            </div>

                            {isSubmitting && responseFile && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-foreground/40">Uploading video...</span>
                                  <span className="text-primary font-bold">{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {error && (
                              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                {error}
                              </div>
                            )}

                            <Button
                              onClick={submitResponse}
                              disabled={isSubmitting || (!responseText.trim() && !responseFile)}
                              className="w-full gap-2"
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <Send className="h-4 w-4" />
                                  Send Response
                                </>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back button for mobile detail view */}
      {selectedSubmission && (
        <button
          onClick={() => setSelectedSubmission(null)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden bg-background border border-foreground/[0.08] shadow-xl rounded-full px-5 py-3 flex items-center gap-2 text-sm font-medium z-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to list
        </button>
      )}
    </div>
  );
}
