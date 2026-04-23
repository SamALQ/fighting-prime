"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B0B0B] text-foreground flex flex-col items-center justify-center p-6">
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground text-sm text-center max-w-md mb-6">
          We&apos;ve been notified. Try again, or return to the home page.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 inline-flex items-center justify-center"
          >
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
