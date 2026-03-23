"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Save,
  X,
  Trash2,
  Calendar,
  User as UserIcon,
} from "lucide-react";

interface BreakdownRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail: string;
  release_date: string;
  author: string;
}

type FormMode = "closed" | "create" | "edit";

export default function AdminBreakdownsPage() {
  const [breakdowns, setBreakdowns] = useState<BreakdownRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [author, setAuthor] = useState("");

  const fetchBreakdowns = useCallback(async () => {
    const res = await fetch("/api/admin/breakdowns");
    if (res.ok) setBreakdowns((await res.json()).breakdowns);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBreakdowns();
  }, [fetchBreakdowns]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setVideoUrl("");
    setThumbnail("");
    setReleaseDate(new Date().toISOString().slice(0, 10));
    setAuthor("");
    setEditId(null);
    setFormMode("closed");
  };

  const startCreate = () => {
    resetForm();
    setReleaseDate(new Date().toISOString().slice(0, 10));
    setFormMode("create");
  };

  const startEdit = (b: BreakdownRow) => {
    setTitle(b.title);
    setSlug(b.slug);
    setDescription(b.description ?? "");
    setVideoUrl(b.video_url ?? "");
    setThumbnail(b.thumbnail ?? "");
    setReleaseDate(b.release_date ?? "");
    setAuthor(b.author ?? "");
    setEditId(b.id);
    setFormMode("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { title, slug, description, videoUrl, thumbnail, releaseDate, author };
    const method = formMode === "create" ? "POST" : "PATCH";
    const body = formMode === "edit" ? { id: editId, ...payload } : payload;

    const res = await fetch("/api/admin/breakdowns", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      resetForm();
      fetchBreakdowns();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this breakdown? This cannot be undone.")) return;
    await fetch("/api/admin/breakdowns", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchBreakdowns();
  };

  const autoSlug = (t: string) =>
    t
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <MainLayout>
      <Section className="pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Breakdowns</h1>
            <p className="text-muted-foreground text-sm">
              {breakdowns.length} breakdown{breakdowns.length !== 1 ? "s" : ""}
            </p>
          </div>
          {formMode === "closed" && (
            <Button onClick={startCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add Breakdown
            </Button>
          )}
        </div>

        {/* Form */}
        {formMode !== "closed" && (
          <div className="border border-border rounded-xl bg-card p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {formMode === "create" ? "New Breakdown" : "Edit Breakdown"}
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
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Author</label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Release Date</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
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
                <label className="text-sm font-medium mb-1 block">Thumbnail URL</label>
                <input
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !title.trim() || !slug.trim()}
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

        {/* Breakdown list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {breakdowns.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{b.title}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        {b.author || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {b.release_date
                          ? new Date(b.release_date).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(b)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(b.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {breakdowns.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No breakdowns yet. Click &quot;Add Breakdown&quot; to create one.
                </div>
              )}
            </div>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}
