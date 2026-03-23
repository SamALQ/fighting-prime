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

export function Hero({
  headline,
  subhead,
  primaryCta,
  secondaryCta,
  className,
}: HeroProps) {
  const words = headline.split(". ");

  return (
    <section
      className={cn(
        "relative min-h-[85vh] flex items-center justify-center overflow-hidden grain",
        className
      )}
    >
      {/* Atmospheric background layers */}
      <div className="absolute inset-0 bg-background" />

      {/* Main spotlight -- top right */}
      <div className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full bg-primary/[0.07] blur-[120px] animate-pulse-glow" />

      {/* Secondary glow -- bottom left */}
      <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />

      {/* Subtle radial from center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,18,18,0.03)_0%,transparent_70%)]" />

      {/* Horizontal accent line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6">
          <span className="inline-block text-xs font-bold tracking-[0.3em] text-primary/80 uppercase">
            Fighting Prime Academy
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tight">
          {words.map((part, i) => (
            <span key={i} className="block">
              {i === words.length - 1 ? (
                <span className="text-gradient-hero">{part}.</span>
              ) : (
                <span className="text-foreground">{part}.</span>
              )}
            </span>
          ))}
        </h1>

        {subhead && (
          <p className="mt-8 text-lg sm:text-xl md:text-2xl text-foreground/60 max-w-2xl mx-auto leading-relaxed font-light">
            {subhead}
          </p>
        )}

        {(primaryCta || secondaryCta) && (
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            {primaryCta && (
              <Link href={primaryCta.href}>
                <Button
                  size="lg"
                  className="h-14 px-10 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                >
                  {primaryCta.text}
                </Button>
              </Link>
            )}
            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-base font-bold border-foreground/10 bg-foreground/[0.03] backdrop-blur-sm hover:bg-foreground/[0.06] hover:border-foreground/20"
                >
                  {secondaryCta.text}
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Scroll indicator */}
        <div className="mt-16 flex justify-center">
          <div className="w-5 h-8 rounded-full border border-foreground/20 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-foreground/40 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
