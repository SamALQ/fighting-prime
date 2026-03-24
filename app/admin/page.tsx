import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import Link from "next/link";
import { Users, BookOpen, Film, Newspaper, HardDrive, AlertTriangle } from "lucide-react";

export default function AdminPage() {
  return (
    <MainLayout>
      <Section className="pb-24">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">
          Manage platform content, instructors, and settings
        </p>

        <div className="mb-6 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-yellow-500">Rotate AWS Secret Key</p>
            <p className="text-foreground/50 mt-1">
              The AWS access key for <code className="text-xs bg-foreground/[0.06] px-1 py-0.5 rounded">fighting-prime-admin</code> was
              exposed in a Cursor chat transcript. Go to IAM &rarr; Users &rarr; fighting-prime-admin &rarr;
              Security credentials &rarr; Create access key, then deactivate the old one. Update <code className="text-xs bg-foreground/[0.06] px-1 py-0.5 rounded">.env.local</code> and
              run <code className="text-xs bg-foreground/[0.06] px-1 py-0.5 rounded">aws configure set aws_secret_access_key &lt;new-secret&gt;</code> afterward.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          <Link
            href="/admin/media"
            className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group"
          >
            <HardDrive className="h-8 w-8 text-primary mb-3" />
            <h2 className="text-lg font-semibold group-hover:text-primary transition-colors">
              Media
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse, upload, and manage S3 media files
            </p>
          </Link>
        </div>
      </Section>
    </MainLayout>
  );
}
