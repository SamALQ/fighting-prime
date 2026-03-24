"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  Play,
  Clock,
  Crown,
  ChevronRight,
  ArrowUpCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Eye,
  X,
  FileVideo,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSubscription } from "@/lib/hooks/use-subscription";

interface Submission {
  id: string;
  title: string;
  description?: string;
  status: "uploading" | "pending" | "in_review" | "responded";
  created_at: string;
  responded_at: string | null;
  video_url?: string;
  response_video_url?: string;
  response_text?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  uploading: { label: "Uploading", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Loader2 },
  pending: { label: "Awaiting Review", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Clock },
  in_review: { label: "In Review", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: Eye },
  responded: { label: "Responded", color: "text-green-500 bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FighterEliteDashboard() {
  const { isElite, isActive, isLoading } = useSubscription();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch("/api/elite/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    if (isElite) fetchSubmissions();
  }, [isElite, fetchSubmissions]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a video file");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setUploadError("File too large (max 500MB)");
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const res = await fetch("/api/elite/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create submission");
      }

      const { id: submissionId, uploadUrl } = await res.json();

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", selectedFile.type);
        xhr.send(selectedFile);
      });

      await fetch("/api/elite/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, action: "confirm_upload" }),
      });

      setTitle("");
      setDescription("");
      setSelectedFile(null);
      setUploadProgress(0);
      fetchSubmissions();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const viewSubmission = async (id: string) => {
    try {
      const res = await fetch(`/api/elite/submissions?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSubmission(data);
      }
    } catch {
      /* ignore */
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Section className="pb-24 pt-12">
          <Container>
            <div className="space-y-6">
              <div className="h-12 w-64 bg-foreground/[0.03] animate-pulse rounded-lg" />
              <div className="h-6 w-96 bg-foreground/[0.03] animate-pulse rounded" />
              <div className="h-96 bg-foreground/[0.03] animate-pulse rounded-2xl border border-foreground/[0.06]" />
            </div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  if (!isElite) {
    return (
      <MainLayout>
        <Section className="pb-24 pt-12">
          <Container>
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Crown className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Fighter Elite +</h1>
              <p className="text-xl text-foreground/50">
                {isActive
                  ? "Upgrade to Fighter Elite+ to unlock personalized video breakdowns from Jake Peacock."
                  : "Subscribe to Fighter Elite+ to get personalized coaching and video analysis."}
              </p>
              <Link href="/pricing">
                <Button className="h-12 px-8 text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  {isActive ? "Upgrade Plan" : "View Plans"}
                </Button>
              </Link>
            </div>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Section className="pb-24 pt-12">
        <Container>
          {/* Header */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/20 text-primary border-primary/30 py-1 px-3 flex gap-2 items-center">
                <Crown className="h-3.5 w-3.5" />
                Fighter Elite +
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Your Elite Dashboard</h1>
              <p className="text-xl text-foreground/50 max-w-3xl leading-relaxed">
                Upload your sparring or training footage for personalized analysis and feedback from the Fighting Prime coaching team.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Column */}
            <div className="lg:col-span-8 space-y-10">

              {/* Upload Section */}
              <div className="rounded-3xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 space-y-6">
                <div className="flex items-center gap-2 text-primary">
                  <ArrowUpCircle className="h-5 w-5" />
                  <h2 className="text-xl font-bold uppercase tracking-widest">Submit Video</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/60 mb-1.5">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Sparring Session - Counter Attack Practice"
                      className="w-full h-11 px-4 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors"
                      disabled={isUploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/60 mb-1.5">
                      Description <span className="text-foreground/30">(optional)</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Any context for the coach — what to focus on, what you're working on, etc."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors resize-none"
                      disabled={isUploading}
                    />
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={cn(
                    "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer",
                    selectedFile ? "border-primary/40 bg-primary/5 p-5" : "p-8",
                    isDragging
                      ? "border-primary bg-primary/5 scale-[0.99]"
                      : !selectedFile && "border-foreground/[0.08] hover:border-primary/30 hover:bg-foreground/[0.03]"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                    disabled={isUploading}
                  />

                  {selectedFile ? (
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileVideo className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-sm text-foreground/40">
                          {formatFileSize(selectedFile.size)} &middot; {selectedFile.type}
                        </p>
                      </div>
                      {!isUploading && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                          className="h-8 w-8 rounded-lg hover:bg-foreground/[0.06] flex items-center justify-center"
                        >
                          <X className="h-4 w-4 text-foreground/40" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold mb-1">Drop your video here</p>
                        <p className="text-sm text-foreground/40">
                          or <span className="text-primary font-medium">click to browse</span> &middot; Max 500MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/60 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Uploading...
                      </span>
                      <span className="text-primary font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-foreground/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {uploadError}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !title.trim() || isUploading}
                  className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading ({uploadProgress}%)
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>

              {/* Viewed Submission Detail */}
              {selectedSubmission && (
                <div className="rounded-3xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
                  <div className="p-6 border-b border-foreground/[0.06] flex items-center justify-between">
                    <h3 className="text-lg font-bold">{selectedSubmission.title}</h3>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="h-8 w-8 rounded-lg hover:bg-foreground/[0.06] flex items-center justify-center"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {selectedSubmission.description && (
                      <p className="text-foreground/50">{selectedSubmission.description}</p>
                    )}

                    {/* User's video */}
                    {selectedSubmission.video_url && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground/60">Your Submission</p>
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

                    {/* Instructor response */}
                    {selectedSubmission.status === "responded" && (
                      <div className="space-y-4 pt-4 border-t border-foreground/[0.06]">
                        <div className="flex items-center gap-2 text-primary">
                          <MessageSquare className="h-5 w-5" />
                          <p className="font-bold uppercase tracking-wider text-sm">Coach Feedback</p>
                        </div>

                        {selectedSubmission.response_text && (
                          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                            <p className="text-foreground/70 leading-relaxed whitespace-pre-wrap">
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
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Submission History */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-3xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
                <div className="flex items-center gap-2 mb-6 text-primary">
                  <Clock className="h-5 w-5" />
                  <h2 className="text-lg font-bold uppercase tracking-widest">Submissions</h2>
                </div>

                {isLoadingSubmissions ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-foreground/[0.03] animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <FileVideo className="h-10 w-10 text-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-foreground/40">No submissions yet</p>
                    <p className="text-xs text-foreground/25 mt-1">Upload your first video above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => {
                      const config = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.pending;
                      const StatusIcon = config.icon;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => viewSubmission(sub.id)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border transition-all group",
                            selectedSubmission?.id === sub.id
                              ? "border-primary/30 bg-primary/5"
                              : "border-foreground/[0.06] hover:border-primary/20 hover:bg-foreground/[0.03]"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-foreground/[0.04] flex items-center justify-center shrink-0 border border-foreground/[0.06] group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                              <Play className="h-4 w-4 text-foreground/30 group-hover:text-primary fill-current transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {sub.title}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className={cn("text-[10px] h-5 px-2 font-medium border", config.color)}>
                                  <StatusIcon className={cn("h-3 w-3 mr-1", sub.status === "uploading" && "animate-spin")} />
                                  {config.label}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-foreground/30">
                                {formatDate(sub.created_at)}
                                {sub.responded_at && ` · Replied ${formatDate(sub.responded_at)}`}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors shrink-0 mt-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
