"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Play, X } from "lucide-react";

interface CourseHeroClientProps {
  trailerUrl: string;
}

export function CourseHeroClient({ trailerUrl }: CourseHeroClientProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!showTrailer) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowTrailer(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showTrailer]);

  useEffect(() => {
    if (showTrailer && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [showTrailer]);

  const modal = showTrailer ? (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
      onClick={() => setShowTrailer(false)}
    >
      <button
        onClick={() => setShowTrailer(false)}
        className="absolute top-6 right-6 z-10 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <X className="h-5 w-5 text-white" />
      </button>
      <div
        className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={trailerUrl}
          className="w-full h-full"
          controls
          autoPlay
          playsInline
          preload="auto"
        />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setShowTrailer(true)}
        className="inline-flex items-center gap-2 h-14 px-8 rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-sm text-sm font-black uppercase tracking-wider text-white/80 hover:bg-white/[0.08] hover:border-white/25 transition-all duration-300"
      >
        Watch Trailer
        <Play className="h-4 w-4 fill-current" />
      </button>
      {mounted && modal && createPortal(modal, document.body)}
    </>
  );
}
