"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  FileVideo,
  X,
  RotateCcw,
  Trophy,
  MessageSquare,
} from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/hooks/use-subscription";

interface AssignmentUploadProps {
  episodeId: string;
  episodeTitle: string;
  assignmentPoints: number;
}

interface SubmissionData {
  id: string;
  status: "uploading" | "pending" | "approved" | "needs_revision";
  notes: string;
  feedback: string | null;
  points_awarded: number;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  uploading: { label: "Uploading", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: Loader2 },
  pending: { label: "Submitted — Awaiting Review", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Clock },
  approved: { label: "Approved", color: "text-green-500 bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
  needs_revision: { label: "Revision Requested", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: AlertCircle },
};

export function AssignmentUpload({ episodeId, episodeTitle, assignmentPoints }: AssignmentUploadProps) {
  const { isActive } = useSubscription();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSubmission = useCallback(async () => {
    try {
      const res = await fetch(`/api/assignments?episodeId=${episodeId}`);
      if (res.ok) {
        const data = await res.json();
        setSubmission(data.submission);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    if (isActive) fetchSubmission();
    else setIsLoading(false);
  }, [isActive, fetchSubmission]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please select a video file");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("File too large (max 500MB)");
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId,
          notes: notes.trim(),
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
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
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

      await fetch("/api/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, action: "confirm_upload" }),
      });

      setSelectedFile(null);
      setNotes("");
      setUploadProgress(0);
      fetchSubmission();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
        <h2 className="text-xl font-bold mb-2">Assignment</h2>
        <p className="text-foreground/50 mb-4">
          Subscribe to submit assignments and earn points.
        </p>
        <Button variant="outline" asChild className="border-foreground/[0.08]">
          <a href="/pricing">View Plans</a>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
        <div className="h-6 w-32 bg-foreground/[0.04] rounded animate-pulse mb-4" />
        <div className="h-4 w-48 bg-foreground/[0.04] rounded animate-pulse" />
      </div>
    );
  }

  const canResubmit = submission?.status === "needs_revision";
  const isApproved = submission?.status === "approved";
  const isPending = submission?.status === "pending";
  const showUploadForm = !submission || canResubmit;

  return (
    <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Assignment</h2>
        <div className="flex items-center gap-1.5 text-sm">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="font-bold text-primary">{assignmentPoints} pts</span>
        </div>
      </div>

      {/* Existing submission status */}
      {submission && (
        <div className="space-y-3">
          {(() => {
            const config = STATUS_CONFIG[submission.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = config.icon;
            return (
              <div className={cn("flex items-center gap-2 text-sm px-3 py-2 rounded-xl border", config.color)}>
                <StatusIcon className={cn("h-4 w-4", submission.status === "uploading" && "animate-spin")} />
                <span className="font-medium">{config.label}</span>
                {isApproved && submission.points_awarded > 0 && (
                  <Badge className="ml-auto bg-green-500/10 text-green-500 border-green-500/20">
                    +{submission.points_awarded} pts
                  </Badge>
                )}
              </div>
            );
          })()}

          {/* Instructor feedback */}
          {submission.feedback && (
            <div className="bg-foreground/[0.03] border border-foreground/[0.06] rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/50">
                <MessageSquare className="h-3.5 w-3.5" />
                Instructor Feedback
              </div>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap">{submission.feedback}</p>
            </div>
          )}

          {/* View submitted video */}
          {submission.video_url && (isPending || isApproved) && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <video
                src={submission.video_url}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              />
            </div>
          )}
        </div>
      )}

      {/* Upload form */}
      {showUploadForm && (
        <div className="space-y-4">
          <p className="text-foreground/50 text-sm">
            {canResubmit
              ? "Upload a revised video addressing the instructor's feedback."
              : `Practice the techniques from "${episodeTitle}" and upload your video for review.`}
          </p>

          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
              selectedFile ? "border-primary/40 bg-primary/5 p-4" : "p-6",
              isDragging ? "border-primary bg-primary/5" : !selectedFile && "border-foreground/[0.08] hover:border-primary/30"
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
              <div className="flex items-center gap-3">
                <FileVideo className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-foreground/40">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                {!isUploading && (
                  <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-1 rounded hover:bg-foreground/[0.06]">
                    <X className="h-4 w-4 text-foreground/40" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Upload className="h-8 w-8 text-foreground/20" />
                <p className="text-sm text-foreground/40">
                  Drop video here or <span className="text-primary font-medium">browse</span>
                </p>
              </div>
            )}
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes for the reviewer..."
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-foreground/[0.04] border border-foreground/[0.08] text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/40 focus:outline-none transition-colors resize-none"
            disabled={isUploading}
          />

          {isUploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-foreground/50 flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Uploading...
                </span>
                <span className="text-primary font-bold">{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full gap-2"
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Uploading ({uploadProgress}%)</>
            ) : canResubmit ? (
              <><RotateCcw className="h-4 w-4" /> Resubmit Assignment</>
            ) : (
              <><Upload className="h-4 w-4" /> Submit Assignment</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
