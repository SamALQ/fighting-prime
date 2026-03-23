import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";

export default function CoursesLoading() {
  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="space-y-8 animate-pulse">
            <div className="space-y-2">
              <div className="h-10 w-72 bg-muted rounded" />
              <div className="h-4 w-96 bg-muted rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[4/3] bg-muted rounded-xl" />
                  <div className="h-5 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
