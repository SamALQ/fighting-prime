import { cn } from "@/lib/utils";
import { Container } from "./container";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function Section({ children, className, containerClassName }: SectionProps) {
  return (
    <section className={cn("py-12 md:py-16 lg:py-24", className)}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
