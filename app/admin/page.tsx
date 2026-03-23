import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import Link from "next/link";
import { Users, BookOpen, Film, Newspaper } from "lucide-react";

export default function AdminPage() {
  return (
    <MainLayout>
      <Section className="pb-24">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage platform content, instructors, and settings
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/courses"
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
          >
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              Courses
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create, edit, and manage courses
            </p>
          </Link>

          <Link
            href="/admin/episodes"
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
          >
            <Film className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              Episodes
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage episodes across all courses
            </p>
          </Link>

          <Link
            href="/admin/breakdowns"
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
          >
            <Newspaper className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              Breakdowns
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and edit technique breakdowns
            </p>
          </Link>

          <Link
            href="/admin/instructors"
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
          >
            <Users className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              Instructors
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage instructor accounts and assignments
            </p>
          </Link>
        </div>
      </Section>
    </MainLayout>
  );
}
