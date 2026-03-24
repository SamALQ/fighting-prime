"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Technique {
  id: string;
  name: string;
  category: string;
  description: string;
  key_points: string[];
  related_episode_ids: string[];
  video_clip_url: string;
}

const CATEGORIES = ["all", "strikes", "kicks", "clinch", "defense", "footwork", "combos", "general"];

export default function TechniquesPage() {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Technique | null>(null);

  const fetchTechniques = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("q", search);
    try {
      const res = await fetch(`/api/techniques?${params}`);
      if (res.ok) {
        const d = await res.json();
        setTechniques(d.techniques ?? []);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [category, search]);

  useEffect(() => { fetchTechniques(); }, [fetchTechniques]);

  return (
    <MainLayout>
      <Section className="pb-24">
        <Container>
          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
              Reference
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Technique Library</h1>
            <p className="text-lg text-foreground/50">
              A searchable encyclopedia of individual techniques with key points and linked episodes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search techniques..."
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-sm"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border capitalize transition-all",
                    category === c
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-foreground/[0.08] text-foreground/50 hover:border-foreground/20"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {selected ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-foreground/40 hover:text-foreground flex items-center gap-1"
              >
                <ChevronRight className="h-4 w-4 rotate-180" /> Back to list
              </button>
              <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full border border-foreground/[0.08] text-foreground/50 capitalize">
                      {selected.category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selected.name}</h2>
                </div>
                {selected.description && (
                  <p className="text-foreground/60 leading-relaxed">{selected.description}</p>
                )}
                {selected.key_points.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/40 mb-3">Key Points</h3>
                    <ul className="space-y-2">
                      {selected.key_points.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-foreground/70">{kp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.video_clip_url && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/40 mb-3">Video Clip</h3>
                    <video
                      src={selected.video_clip_url}
                      controls
                      className="w-full max-w-lg rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-foreground/30">Loading techniques...</div>
          ) : techniques.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <BookOpen className="h-12 w-12 text-foreground/20 mx-auto" />
              <h3 className="text-lg font-semibold text-foreground/50">No Techniques Found</h3>
              <p className="text-sm text-foreground/30">
                {search ? `No results for "${search}"` : "The technique library is being built. Check back soon!"}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {techniques.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="text-left rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-4 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{t.name}</h3>
                      <span className="text-[10px] capitalize text-foreground/40">{t.category}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary transition-colors" />
                  </div>
                  {t.description && (
                    <p className="text-xs text-foreground/40 mt-2 line-clamp-2">{t.description}</p>
                  )}
                  {t.key_points.length > 0 && (
                    <div className="text-[10px] text-foreground/30 mt-2">
                      {t.key_points.length} key point{t.key_points.length > 1 ? "s" : ""}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </MainLayout>
  );
}
