"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  Lock,
  Unlock,
  Clock,
} from "lucide-react";

interface EpisodeRow {
  id: string;
  slug: string;
  course_id: string;
  title: string;
  episode_order: number;
  is_free: boolean;
  premium: boolean;
  video_url: string;
  duration_seconds: number;
  key_takeaways: string[];
  thumbnail: string;
}

interface CourseOption {
  id: string;
  title: string;
  slug: string;
}

type FormMode = "closed" | "create" | "edit";

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function AdminEpisodesContent() {
  const searchParams = useSearchParams();
  const filterCourseId = searchParams.get("courseId");

  const [episodes, setEpisodes] = useState<EpisodeRow[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [courseId, setCourseId] = useState("");
  const [order, setOrder] = useState(0);
  const [isFree, setIsFree] = useState(false);
  const [premium, setPremium] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [keyTakeaways, setKeyTakeaways] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const fetchData = useCallback(async () => {
    const [epRes, cRes] = await Promise.all([
      fetch(
        filterCourseId
          ? `/api/admin/episodes?courseId=${filterCourseId}`
          : "/api/admin/episodes"
      ),
      fetch("/api/admin/courses"),
    ]);
    if (epRes.ok) setEpisodes((await epRes.json()).episodes);
    if (cRes.ok) setCourses((await cRes.json()).courses);
    setLoading(false);
  }, [filterCourseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setCourseId(filterCourseId ?? "");
    setOrder(0);
    setIsFree(false);
    setPremium(false);
    setVideoUrl("");
    setDurationSeconds(0);
    setKeyTakeaways("");
    setThumbnail("");
    setEditId(null);
    setFormMode("closed");
  };

  const startCreate = () => {
    resetForm();
    setCourseId(filterCourseId ?? (courses[0]?.id ?? ""));
    setOrder(episodes.length + 1);
    setFormMode("create");
  };

  const startEdit = (e: EpisodeRow) => {
    setTitle(e.title);
    setSlug(e.slug);
    setCourseId(e.course_id);
    setOrder(e.episode_order);
    setIsFree(e.is_free);
    setPremium(e.premium);
    setVideoUrl(e.video_url);
    setDurationSeconds(e.duration_seconds);
    setKeyTakeaways((e.key_takeaways ?? []).join("\n"));
    setThumbnail(e.thumbnail ?? "");
    setEditId(e.id);
    setFormMode("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title,
      slug,
      courseId,
      order,
      isFree,
      premium,
      videoUrl,
      durationSeconds,
      keyTakeaways: keyTakeaways
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      thumbnail,
    };

    const method = formMode === "create" ? "POST" : "PATCH";
    const body = formMode === "edit" ? { id: editId, ...payload } : payload;

    const res = await fetch("/api/admin/episodes", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      resetForm();
      fetchData();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this episode? This cannot be undone.")) return;
    await fetch("/api/admin/episodes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  };

  const autoSlug = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const courseName = (id: string) =>
    courses.find((c) => c.id === id)?.title ?? "Unknown";

  return (
    <MainLayout>
      <Section className="pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/courses">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              Episodes
              {filterCourseId && courses.length > 0 && (
                <span className="text-muted-foreground font-normal text-lg ml-2">
                  — {courseName(filterCourseId)}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
            </p>
          </div>
          {formMode === "closed" && (
            <Button onClick={startCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Episode
            </Button>
          )}
        </div>

        {/* Form */}
        {formMode !== "closed" && (
          <div className="border border-border rounded-xl bg-card p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {formMode === "create" ? "New Episode" : "Edit Episode"}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formMode === "create") setSlug(autoSlug(e.target.value));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Course</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Episode Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Video URL</label>
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duration (seconds)</label>
                <input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Thumbnail URL</label>
                <input
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded"
                  />
                  Free
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={premium}
                    onChange={(e) => setPremium(e.target.checked)}
                    className="rounded"
                  />
                  Premium
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  Key Takeaways (one per line)
                </label>
                <textarea
                  value={keyTakeaways}
                  onChange={(e) => setKeyTakeaways(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !slug.trim() || !courseId}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Episode list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {episodes.map((ep) => (
                <div
                  key={ep.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20"
                >
                  <span className="w-8 text-center text-sm font-bold text-muted-foreground">
                    {ep.episode_order}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ep.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /{ep.slug}
                      {!filterCourseId && (
                        <span> &middot; {courseName(ep.course_id)}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(ep.duration_seconds)}
                    </span>
                    {ep.is_free ? (
                      <Unlock className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(ep)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(ep.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {episodes.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No episodes yet. Click &quot;Add Episode&quot; to create one.
                </div>
              )}
            </div>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}

export default function AdminEpisodesPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <Section className="pb-24">
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-48 bg-muted rounded" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-muted rounded-lg" />
              ))}
            </div>
          </Section>
        </MainLayout>
      }
    >
      <AdminEpisodesContent />
    </Suspense>
  );
}
