import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroProps {
  headline: string;
  subhead?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  className?: string;
}

export function Hero({ headline, subhead, primaryCta, secondaryCta, className }: HeroProps) {
  return (
    <section className={cn("relative py-24 md:py-32 lg:py-40", className)}>
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          {headline}
        </h1>
        {subhead && (
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl">
            {subhead}
          </p>
        )}
        {(primaryCta || secondaryCta) && (
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {primaryCta && (
              <Link href={primaryCta.href}>
                <Button size="lg" className="w-full sm:w-auto">
                  {primaryCta.text}
                </Button>
              </Link>
            )}
            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {secondaryCta.text}
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
