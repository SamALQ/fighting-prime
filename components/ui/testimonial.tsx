import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialProps {
  name: string;
  location: string;
  quote: string;
  rating: number;
  className?: string;
}

export function Testimonial({ name, location, quote, rating, className }: TestimonialProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8 hover:border-primary/20 transition-all duration-300",
        className
      )}
    >
      <span className="absolute top-6 right-8 text-6xl font-serif text-foreground/[0.04] leading-none select-none">
        &rdquo;
      </span>

      <div className="relative">
        <div className="flex gap-0.5 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < rating ? "fill-primary text-primary" : "text-foreground/10"
              )}
            />
          ))}
        </div>

        <p className="text-foreground/70 mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-xs text-foreground/40">{location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
