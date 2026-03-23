import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";

export default function PricingLoading() {
  return (
    <MainLayout>
      <Section>
        <div className="animate-pulse space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="h-10 w-64 bg-muted rounded mx-auto" />
            <div className="h-4 w-96 bg-muted rounded mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl" />
            ))}
          </div>

          <div className="space-y-4 pt-8">
            <div className="h-6 w-40 bg-muted rounded mx-auto" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl max-w-2xl mx-auto" />
            ))}
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
