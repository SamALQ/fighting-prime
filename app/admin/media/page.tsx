"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import {
  Folder,
  File,
  Upload,
  Trash2,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  Film,
  Image as ImageIcon,
  FileText,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface S3Item {
  key: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  if (["mp4", "mov", "webm", "avi", "mkv"].includes(ext ?? ""))
    return <Film className="h-5 w-5 text-blue-400" />;
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext ?? ""))
    return <ImageIcon className="h-5 w-5 text-green-400" />;
  return <FileText className="h-5 w-5 text-foreground/40" />;
}

function getFileName(key: string): string {
  const parts = key.split("/");
  return parts[parts.length - 1] || key;
}

function getFolderName(prefix: string): string {
  const trimmed = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
  const parts = trimmed.split("/");
  return parts[parts.length - 1] || prefix;
}

export default function AdminMediaPage() {
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [objects, setObjects] = useState<S3Item[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchContents = useCallback(async (prefix: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?prefix=${encodeURIComponent(prefix)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setObjects(data.objects ?? []);
      setFolders(data.prefixes ?? []);
    } catch (err) {
      console.error("Failed to load media:", err);
      setObjects([]);
      setFolders([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContents(currentPrefix);
  }, [currentPrefix, fetchContents]);

  const navigateToFolder = (prefix: string) => {
    setCurrentPrefix(prefix);
    setDeleteConfirm(null);
  };

  const navigateUp = () => {
    const parts = currentPrefix.split("/").filter(Boolean);
    parts.pop();
    setCurrentPrefix(parts.length > 0 ? parts.join("/") + "/" : "");
    setDeleteConfirm(null);
  };

  const breadcrumbs = currentPrefix
    .split("/")
    .filter(Boolean)
    .map((part, i, arr) => ({
      name: part,
      prefix: arr.slice(0, i + 1).join("/") + "/",
    }));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = currentPrefix + file.name;
      setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`);

      try {
        const presignRes = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, contentType: file.type }),
        });

        if (!presignRes.ok) throw new Error("Failed to get upload URL");
        const { uploadUrl } = await presignRes.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
      }
    }

    setUploading(false);
    setUploadProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchContents(currentPrefix);
  };

  const handleDelete = async (key: string) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteConfirm(null);
      fetchContents(currentPrefix);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <MainLayout>
      <Section className="pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Media Browser</h1>
            <p className="text-foreground/50 text-sm">
              Manage files in the S3 bucket
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchContents(currentPrefix)}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm mb-4 px-1">
          <button
            className="flex items-center gap-1 text-foreground/60 hover:text-foreground transition-colors"
            onClick={() => navigateToFolder("")}
          >
            <HardDrive className="h-4 w-4" />
            <span>Root</span>
          </button>
          {breadcrumbs.map((bc) => (
            <div key={bc.prefix} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 text-foreground/30" />
              <button
                className="text-foreground/60 hover:text-foreground transition-colors"
                onClick={() => navigateToFolder(bc.prefix)}
              >
                {bc.name}
              </button>
            </div>
          ))}
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="mb-4 px-4 py-3 rounded-lg border border-primary/20 bg-primary/5 text-sm text-primary">
            {uploadProgress}
          </div>
        )}

        {/* Contents */}
        <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_100px_160px_60px] gap-4 px-4 py-2.5 border-b border-foreground/[0.06] text-xs font-medium text-foreground/40 uppercase tracking-wider">
            <span>Name</span>
            <span>Size</span>
            <span>Modified</span>
            <span />
          </div>

          {loading && (
            <div className="py-12 text-center text-foreground/40 text-sm">
              Loading...
            </div>
          )}

          {!loading && folders.length === 0 && objects.length === 0 && (
            <div className="py-12 text-center text-foreground/40 text-sm">
              {currentPrefix
                ? "This folder is empty"
                : "Bucket is empty. Upload files or create folders via AWS CLI."}
            </div>
          )}

          {/* Back button */}
          {currentPrefix && !loading && (
            <button
              className="w-full grid grid-cols-[1fr_100px_160px_60px] gap-4 px-4 py-3 hover:bg-foreground/[0.03] transition-colors text-left border-b border-foreground/[0.04]"
              onClick={navigateUp}
            >
              <div className="flex items-center gap-3 text-sm text-foreground/60">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </div>
              <span />
              <span />
              <span />
            </button>
          )}

          {/* Folders */}
          {!loading &&
            folders.map((prefix) => (
              <button
                key={prefix}
                className="w-full grid grid-cols-[1fr_100px_160px_60px] gap-4 px-4 py-3 hover:bg-foreground/[0.03] transition-colors text-left border-b border-foreground/[0.04]"
                onClick={() => navigateToFolder(prefix)}
              >
                <div className="flex items-center gap-3 text-sm">
                  <Folder className="h-5 w-5 text-yellow-500" />
                  <span className="truncate">{getFolderName(prefix)}</span>
                </div>
                <span className="text-xs text-foreground/30">--</span>
                <span className="text-xs text-foreground/30">--</span>
                <span />
              </button>
            ))}

          {/* Files */}
          {!loading &&
            objects.map((obj) => (
              <div
                key={obj.key}
                className="grid grid-cols-[1fr_100px_160px_60px] gap-4 px-4 py-3 hover:bg-foreground/[0.03] transition-colors border-b border-foreground/[0.04] items-center"
              >
                <div className="flex items-center gap-3 text-sm min-w-0">
                  {getFileIcon(obj.key)}
                  <span className="truncate">{getFileName(obj.key)}</span>
                </div>
                <span className="text-xs text-foreground/50">
                  {formatFileSize(obj.size)}
                </span>
                <span className="text-xs text-foreground/50">
                  {obj.lastModified
                    ? new Date(obj.lastModified).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </span>
                <div className="flex justify-end">
                  {deleteConfirm === obj.key ? (
                    <button
                      className="text-xs text-red-400 hover:text-red-300 font-medium"
                      onClick={() => handleDelete(obj.key)}
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded hover:bg-red-500/10 text-foreground/30 hover:text-red-400 transition-colors"
                      onClick={() => setDeleteConfirm(obj.key)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Key structure reference */}
        <div className="mt-8 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
          <h3 className="text-sm font-semibold mb-3">S3 Key Structure</h3>
          <div className="font-mono text-xs text-foreground/50 space-y-1">
            <p>courses/&#123;courseSlug&#125;/episodes/&#123;episodeSlug&#125;/video-&#123;resolution&#125;.mp4</p>
            <p>courses/&#123;courseSlug&#125;/episodes/&#123;episodeSlug&#125;/thumbnail.jpg</p>
            <p>courses/&#123;courseSlug&#125;/cover.jpg</p>
            <p>breakdowns/&#123;breakdownSlug&#125;/video.mp4</p>
            <p>elite/&#123;userId&#125;/&#123;submissionId&#125;/upload.mp4</p>
            <p>assignments/&#123;userId&#125;/&#123;episodeId&#125;/&#123;timestamp&#125;.mp4</p>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
