"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import type { Breakdown } from "@/data/breakdowns";
import type { Episode } from "@/data/episodes";
import { useState, useMemo } from "react";
import { CommentSection } from "@/components/ui/comment-section";
import { BreakdownList } from "@/components/ui/breakdown-list";
import { Calendar, User, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/ui/video-player";

interface BreakdownsClientProps {
  breakdowns: Breakdown[];
}

export function BreakdownsClient({ breakdowns }: BreakdownsClientProps) {
  const [selectedId, setSelectedId] = useState<string>(() => breakdowns[0]?.id ?? "");

  const resolvedId = useMemo(() => {
    if (!breakdowns.length) return "";
    if (breakdowns.some((b) => b.id === selectedId)) return selectedId;
    return breakdowns[0].id;
  }, [breakdowns, selectedId]);

  const selectedBreakdown = useMemo(
    () => breakdowns.find((b) => b.id === resolvedId) ?? breakdowns[0],
    [breakdowns, resolvedId]
  );

  const episodeProxy = useMemo<Episode | null>(() => {
    if (!selectedBreakdown) return null;
    return {
      id: selectedBreakdown.id,
      slug: selectedBreakdown.slug,
      courseId: "__breakdown__",
      title: selectedBreakdown.title,
      order: 0,
      isFree: false,
      premium: true,
      videoUrl: selectedBreakdown.videoUrl,
      description: selectedBreakdown.description,
      videoResolutions: selectedBreakdown.videoResolutions ?? [],
      durationSeconds: 0,
      keyTakeaways: [],
      releaseDate: selectedBreakdown.releaseDate,
      thumbnail: selectedBreakdown.thumbnail,
    };
  }, [selectedBreakdown]);

  if (!breakdowns.length) {
    return (
      <MainLayout>
        <Section className="pb-24">
          <Container>
            <p className="text-foreground/40 text-center py-12">No breakdowns available yet.</p>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  if (!selectedBreakdown || !episodeProxy) {
    return (
      <MainLayout>
        <Section className="pb-24">
          <Container>
            <p className="text-foreground/40 text-center py-12">No breakdowns available yet.</p>
          </Container>
        </Section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Section className="pb-24">
        <Container>
          <div className="mb-12">
            <span className="text-xs font-bold tracking-[0.3em] text-primary/80 uppercase mb-4 block">
              Exclusive Content
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Monthly Technique Breakdowns</h1>
            <p className="text-lg text-foreground/50 max-w-2xl">
              Deep dives into advanced fighting techniques with expert analysis from Fighting Prime coaches.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-6">
                <VideoPlayer
                  episode={episodeProxy}
                  className="border border-foreground/[0.08] shadow-2xl shadow-primary/5"
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">{selectedBreakdown.title}</h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/40">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-primary/60" />
                        Released {new Date(selectedBreakdown.releaseDate).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-primary/60" />
                        By {selectedBreakdown.author}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary/60" />
                        15-20 min read
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-fit gap-2 border-foreground/[0.08]">
                    <Share2 className="h-4 w-4" />
                    Share Breakdown
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 space-y-6">
                <h3 className="text-xl font-bold border-b border-foreground/[0.06] pb-4">About This Breakdown</h3>
                <p className="text-foreground/50 leading-relaxed text-lg">
                  {selectedBreakdown.description}
                </p>
              </div>

              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8">
                <CommentSection
                  commentableType="breakdown"
                  commentableId={selectedBreakdown.id}
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
                  <BreakdownList
                    breakdowns={breakdowns}
                    selectedId={resolvedId}
                    onSelect={(id) => {
                      setSelectedId(id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
