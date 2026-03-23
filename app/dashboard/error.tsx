"use client";

import { useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <MainLayout>
      <Section>
        <div className="text-center py-20">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            We couldn&apos;t load your dashboard. This might be a temporary issue.
          </p>
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </Section>
    </MainLayout>
  );
}
