"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import type { Breakdown } from "@/data/breakdowns";
import { useState } from "react";
import { CommentSection } from "@/components/ui/comment-section";
import { BreakdownList } from "@/components/ui/breakdown-list";
import { Calendar, User, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface BreakdownsClientProps {
  breakdowns: Breakdown[];
}

export function BreakdownsClient({ breakdowns }: BreakdownsClientProps) {
  const [selectedBreakdown, setSelectedBreakdown] = useState<Breakdown>(breakdowns[0]);

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
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-foreground/[0.08] group shadow-2xl shadow-primary/5">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background">
                    <Image
                      src={selectedBreakdown.thumbnail}
                      alt={selectedBreakdown.title}
                      fill
                      className="object-cover opacity-40 blur-sm"
                      unoptimized
                    />
                    <div className="relative z-10 text-center space-y-4 px-6">
                      <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto border border-primary/30 group-hover:scale-110 transition-transform duration-500">
                        <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                        </div>
                      </div>
                      <p className="text-lg font-medium text-white/80">Video will be added soon</p>
                    </div>
                  </div>
                </div>

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
                    selectedId={selectedBreakdown.id}
                    onSelect={(id) => {
                      const found = breakdowns.find((b) => b.id === id);
                      if (found) setSelectedBreakdown(found);
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
