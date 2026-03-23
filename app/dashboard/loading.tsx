import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";

export default function DashboardLoading() {
  return (
    <MainLayout>
      <Section>
        <div className="space-y-8 animate-pulse">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 w-40 bg-muted rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-xl" />
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-48 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
