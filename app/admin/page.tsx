import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import Link from "next/link";
import { Users, BookOpen, Film, Newspaper, HardDrive, AlertTriangle, ClipboardCheck } from "lucide-react";

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

        {/* Testing Checklist */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Testing Checklist</h2>
            <span className="text-xs text-foreground/40 ml-2">Recent updates — test when ready</span>
          </div>
          <div className="rounded-lg border border-foreground/[0.06] bg-foreground/[0.02] divide-y divide-foreground/[0.06] text-sm">

            <TestSection title="S3 Video Delivery & Resolution Switching">
              <TestItem>Play an episode with multiple resolutions (e.g. Muay Thai Foundations &rarr; Into The Box) and switch between 720p / 1080p / 4K via the gear icon</TestItem>
              <TestItem>Play an episode with a single resolution (e.g. Low Kick Sharpshooter &rarr; Jedi Mind Tricks) — should play without a quality picker</TestItem>
              <TestItem>Play a Refine The Teep episode — these are S3-only with .mov files, verify they load</TestItem>
              <TestItem>Play the Accountability In Fighting episode</TestItem>
              <TestItem>Verify resume prompt appears when returning to a partially-watched episode</TestItem>
            </TestSection>

            <TestSection title="New Courses & Episode Data (from CSV sync)">
              <TestItem>Verify &ldquo;Refine The Teep&rdquo; course appears in /courses with 7 episodes, correct thumbnails, and descriptions</TestItem>
              <TestItem>Verify &ldquo;Accountability In Fighting&rdquo; course appears with 1 episode</TestItem>
              <TestItem>Check episode descriptions are populated (visible on episode detail pages)</TestItem>
              <TestItem>Confirm course/episode thumbnails load from S3 (fighting-prime-media bucket)</TestItem>
              <TestItem>Verify course poster and cover images load on course detail pages</TestItem>
            </TestSection>

            <TestSection title="Fighter Elite Upload System">
              <TestItem>As a Fighter Elite subscriber, go to /fighter-elite and upload a video (fill title, optional description, drag or pick a file)</TestItem>
              <TestItem>Verify upload progress bar works and submission appears in the sidebar as &ldquo;Awaiting Review&rdquo;</TestItem>
              <TestItem>Click a submission in the sidebar to view the uploaded video via presigned URL</TestItem>
              <TestItem>As a non-Elite user, verify /fighter-elite shows the upgrade prompt</TestItem>
            </TestSection>

            <TestSection title="Instructor Submissions Review">
              <TestItem>As an instructor, go to /instructor/submissions — verify the &ldquo;Elite Submissions&rdquo; tab appears in the sidebar</TestItem>
              <TestItem>Click a pending submission &rarr; watch the student&rsquo;s video &rarr; click &ldquo;Claim &amp; Start Reviewing&rdquo;</TestItem>
              <TestItem>Write text feedback and/or upload a response video, then click &ldquo;Send Response&rdquo;</TestItem>
              <TestItem>Switch to the &ldquo;Responded&rdquo; tab and verify the response is visible</TestItem>
              <TestItem>As the original student, check /fighter-elite — the submission should show &ldquo;Responded&rdquo; with coach feedback</TestItem>
            </TestSection>

            <TestSection title="Admin Media Browser">
              <TestItem>Go to /admin/media and browse the S3 bucket file tree</TestItem>
              <TestItem>Navigate into courses/ folder and verify episode video files and thumbnails are listed</TestItem>
              <TestItem>Upload a test file and then delete it</TestItem>
            </TestSection>

            <TestSection title="Assignment Submissions & Points">
              <TestItem>Open an MTF episode with an assignment (e.g. Stance Fundamentals) — verify the Assignment section shows with point value and upload form</TestItem>
              <TestItem>Upload a video assignment — verify progress bar works and status shows &ldquo;Submitted — Awaiting Review&rdquo;</TestItem>
              <TestItem>As a non-subscriber, verify the assignment section shows &ldquo;Subscribe to submit&rdquo; prompt</TestItem>
              <TestItem>As an instructor, go to /instructor/assignments — verify the Assignments tab appears in sidebar</TestItem>
              <TestItem>Review a pending assignment: watch the video, write feedback, and click Approve — verify points are awarded</TestItem>
              <TestItem>Request revision on a submission — verify the student sees &ldquo;Revision Requested&rdquo; with feedback and can resubmit</TestItem>
              <TestItem>Check /dashboard stats — verify assignment points appear in total points and the Assignments card shows approved/submitted count</TestItem>
              <TestItem>Episodes without assignments should not show the assignment section at all</TestItem>
            </TestSection>

            <TestSection title="Community Page">
              <TestItem>Go to /community — verify page loads and &ldquo;Community&rdquo; link appears in the main navbar (desktop + mobile)</TestItem>
              <TestItem>Leaderboard tab: verify it shows ranked fighters with points, levels, tiers, watch time, episodes completed, assignments approved</TestItem>
              <TestItem>Leaderboard tab: your own row should be highlighted with &ldquo;(you)&rdquo; label</TestItem>
              <TestItem>Leaderboard tab: top 3 podium cards render with crown/medal icons</TestItem>
              <TestItem>Showcase tab: verify approved assignment submissions display with video player, student name, episode link, and instructor feedback</TestItem>
              <TestItem>Showcase tab: click a card to expand the video player, click again to collapse</TestItem>
              <TestItem>Discussions tab: create a new post with a title, content, and category — verify it appears in the list</TestItem>
              <TestItem>Discussions tab: open a post and write a reply — verify the reply appears and reply count increments</TestItem>
              <TestItem>Discussions tab: filter posts by category (technique, training, etc.)</TestItem>
              <TestItem>Discussions tab: delete your own post and reply</TestItem>
            </TestSection>

            <TestSection title="General / Existing Features">
              <TestItem>Watch a course episode and return to /dashboard — verify it shows in &ldquo;courses in progress&rdquo;</TestItem>
              <TestItem>Test the comments section on any episode page</TestItem>
              <TestItem>Verify the mobile hamburger menu works on small screens</TestItem>
              <TestItem>Check the pricing page loads with correct Athlete Pro and Fighter Elite plans</TestItem>
            </TestSection>

          </div>
        </div>

        <div className="mt-4 text-xs text-foreground/30">
          Remove this checklist from <code className="bg-foreground/[0.06] px-1 py-0.5 rounded">app/admin/page.tsx</code> once testing is complete.
        </div>
      </Section>
    </MainLayout>
  );
}

function TestSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5">
      <h3 className="font-semibold text-foreground/80 mb-3">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function TestItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-foreground/50">
      <span className="mt-0.5 h-4 w-4 rounded border border-foreground/[0.12] shrink-0" />
      <span>{children}</span>
    </li>
  );
}
