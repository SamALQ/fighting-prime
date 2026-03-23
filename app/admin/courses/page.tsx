"use client";

import { useEffect, useState, useCallback } from "react";
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
  Star,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  difficulty: string;
  duration_weeks: number;
  featured: boolean;
  released: boolean;
  sort_order: number;
  cover_image: string;
  poster_image: string;
  instructor_name: string;
}

type FormMode = "closed" | "create" | "edit";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [durationWeeks, setDurationWeeks] = useState(0);
  const [featured, setFeatured] = useState(false);
  const [released, setReleased] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [coverImage, setCoverImage] = useState("");
  const [posterImage, setPosterImage] = useState("");
  const [instructorName, setInstructorName] = useState("");

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/admin/courses");
    if (res.ok) {
      const data = await res.json();
      setCourses(data.courses);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setTagline("");
    setDifficulty("Beginner");
    setDurationWeeks(0);
    setFeatured(false);
    setReleased(false);
    setSortOrder(0);
    setCoverImage("");
    setPosterImage("");
    setInstructorName("");
    setEditId(null);
    setFormMode("closed");
  };

  const startEdit = (c: CourseRow) => {
    setTitle(c.title);
    setSlug(c.slug);
    setTagline(c.tagline);
    setDifficulty(c.difficulty);
    setDurationWeeks(c.duration_weeks);
    setFeatured(c.featured);
    setReleased(c.released);
    setSortOrder(c.sort_order);
    setCoverImage(c.cover_image ?? "");
    setPosterImage(c.poster_image ?? "");
    setInstructorName(c.instructor_name ?? "");
    setEditId(c.id);
    setFormMode("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title,
      slug,
      tagline,
      difficulty,
      durationWeeks,
      featured,
      released,
      sortOrder,
      coverImage,
      posterImage,
      instructorName,
    };

    const method = formMode === "create" ? "POST" : "PATCH";
    const body =
      formMode === "edit" ? { id: editId, ...payload } : payload;

    const res = await fetch("/api/admin/courses", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      resetForm();
      fetchCourses();
    }
    setSaving(false);
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
            <h1 className="text-2xl font-bold">Courses</h1>
            <p className="text-muted-foreground text-sm">
              {courses.length} course{courses.length !== 1 ? "s" : ""}
            </p>
          </div>
          {formMode === "closed" && (
            <Button onClick={() => setFormMode("create")} className="gap-2">
              <Plus className="h-4 w-4" /> Add Course
            </Button>
          )}
        </div>

        {/* Create/Edit form */}
        {formMode !== "closed" && (
          <div className="border border-border rounded-xl bg-card p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">
                {formMode === "create" ? "New Course" : "Edit Course"}
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
                <label className="text-sm font-medium mb-1 block">Tagline</label>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Duration (weeks)</label>
                <input
                  type="number"
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Instructor Name</label>
                <input
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cover Image URL</label>
                <input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Poster Image URL</label>
                <input
                  value={posterImage}
                  onChange={(e) => setPosterImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded"
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={released}
                    onChange={(e) => setReleased(e.target.checked)}
                    className="rounded"
                  />
                  Released
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !title.trim() || !slug.trim()} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Course list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{c.title}</p>
                      {c.featured && (
                        <Star className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      /{c.slug} &middot; {c.difficulty} &middot; {c.duration_weeks}w
                      {c.instructor_name && ` &middot; ${c.instructor_name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        c.released
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {c.released ? "Released" : "Draft"}
                    </span>
                    <Link href={`/admin/episodes?courseId=${c.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        Episodes
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEdit(c)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No courses yet. Click &quot;Add Course&quot; to create one.
                </div>
              )}
            </div>
          </div>
        )}
      </Section>
    </MainLayout>
  );
}
