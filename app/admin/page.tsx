import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import Link from "next/link";
import { Users, BarChart3 } from "lucide-react";

export default function AdminPage() {
  return (
    <MainLayout>
      <Section className="pb-24">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage platform settings, instructors, and analytics
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/instructors"
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
          >
            <Users className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              Manage Instructors
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create accounts, approve instructors, and assign courses
            </p>
          </Link>

          <div className="p-6 rounded-lg border border-border bg-card opacity-50">
            <BarChart3 className="h-8 w-8 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold">Platform Analytics</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Coming soon — view watch time, revenue, and engagement
            </p>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
