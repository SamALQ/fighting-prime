"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, BookOpen, Film, MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchResult {
  courses: { id: string; title: string; slug: string; thumbnail?: string }[];
  episodes: { id: string; title: string; slug: string; courseSlug: string }[];
  discussions: { id: string; title: string; category: string }[];
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) setResults(await res.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const close = () => {
    setOpen(false);
    setQuery("");
    setResults(null);
  };

  const totalResults = results
    ? results.courses.length + results.episodes.length + results.discussions.length
    : 0;

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 h-8 px-3 rounded-lg border border-foreground/[0.08] bg-foreground/[0.03] text-foreground/40 hover:border-foreground/20 transition-colors text-xs"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline text-[10px] font-mono bg-foreground/[0.06] px-1 py-0.5 rounded">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 dark:bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-background border border-foreground/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/[0.06]">
            <Search className="h-4 w-4 text-foreground/40 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Search courses, episodes, discussions..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/30"
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults(null); }} className="text-foreground/40 hover:text-foreground/60">
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="text-[10px] font-mono text-foreground/30 bg-foreground/[0.06] px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>

          {loading && (
            <div className="px-4 py-6 text-center text-sm text-foreground/40">Searching...</div>
          )}

          {!loading && results && totalResults === 0 && (
            <div className="px-4 py-6 text-center text-sm text-foreground/40">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && results && totalResults > 0 && (
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-foreground/[0.04]">
              {results.courses.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/30">
                    Courses
                  </div>
                  {results.courses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-foreground/[0.04] transition-colors"
                    >
                      <BookOpen className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">{c.title}</span>
                    </Link>
                  ))}
                </div>
              )}
              {results.episodes.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/30">
                    Episodes
                  </div>
                  {results.episodes.map((e) => (
                    <Link
                      key={e.id}
                      href={`/courses/${e.courseSlug}/${e.slug}`}
                      onClick={close}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-foreground/[0.04] transition-colors"
                    >
                      <Film className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">{e.title}</span>
                    </Link>
                  ))}
                </div>
              )}
              {results.discussions.length > 0 && (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground/30">
                    Discussions
                  </div>
                  {results.discussions.map((d) => (
                    <Link
                      key={d.id}
                      href="/community"
                      onClick={close}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-foreground/[0.04] transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm truncate">{d.title}</span>
                      <span className="text-[10px] text-foreground/30 ml-auto">{d.category}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
