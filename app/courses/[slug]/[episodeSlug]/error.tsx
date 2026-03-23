"use client";

import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function EpisodeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Episode error:", error);
  }, [error]);

  return (
    <MainLayout>
      <Section>
        <div className="text-center py-20">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Failed to Load Episode</h2>
          <p className="text-sm text-muted-foreground mb-6">
            There was a problem loading this episode. Please try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/courses">
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
            <Button onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
