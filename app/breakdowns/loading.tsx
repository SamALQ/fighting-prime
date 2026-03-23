import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";

export default function BreakdownsLoading() {
  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="animate-pulse space-y-8">
            <div className="space-y-2">
              <div className="h-10 w-80 bg-muted rounded" />
              <div className="h-4 w-96 bg-muted rounded" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-6">
                <div className="aspect-video bg-muted rounded-2xl" />
                <div className="h-8 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="h-6 w-32 bg-muted rounded" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
