import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";

export default function EpisodeLoading() {
  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-40 bg-muted rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-video bg-muted rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-8 w-2/3 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-5 w-36 bg-muted rounded" />
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 w-full bg-muted rounded" />
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded" />
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
