"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface EpisodeRatingProps {
  episodeId: string;
}

export function EpisodeRating({ episodeId }: EpisodeRatingProps) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/ratings?episodeId=${episodeId}`)
      .then((r) => r.json())
      .then((d) => {
        setAverage(d.average ?? 0);
        setCount(d.count ?? 0);
        setUserRating(d.userRating ?? null);
      })
      .catch(() => {});
  }, [episodeId]);

  const submitRating = async (rating: number) => {
    setSubmitting(true);
    setUserRating(rating);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, rating }),
      });
      const res = await fetch(`/api/ratings?episodeId=${episodeId}`);
      const d = await res.json();
      setAverage(d.average ?? 0);
      setCount(d.count ?? 0);
    } catch { /* silent */ }
    setSubmitting(false);
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            disabled={submitting}
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => submitRating(i)}
            className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                i <= displayRating ? "text-yellow-400 fill-yellow-400" : "text-foreground/20"
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-foreground/40">
        {average > 0 ? `${average} (${count})` : "No ratings yet"}
      </span>
    </div>
  );
}
