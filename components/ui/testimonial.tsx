import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("h-full", className)}>
      <CardContent className="pt-6">
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <p className="text-muted-foreground mb-4 italic">&ldquo;{quote}&rdquo;</p>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{location}</p>
        </div>
      </CardContent>
    </Card>
  );
}
