import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { fetchCourseBySlug, fetchEpisodesByCourseId } from "@/lib/db";
import { EpisodeList } from "@/components/ui/episode-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, User } from "lucide-react";
import { CourseJSONLD } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourseBySlug(slug);

  if (!course) {
    return {};
  }

  return {
    title: course.title,
    description: course.tagline,
    openGraph: {
      title: course.title,
      description: course.tagline,
      type: "website",
    },
  };
}

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-500/15 text-green-400 border-green-500/20",
  Intermediate: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Advanced: "bg-red-500/15 text-red-400 border-red-500/20",
  Professional: "bg-purple-500/15 text-purple-400 border-purple-500/20",
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await fetchCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const episodes = await fetchEpisodesByCourseId(course.id);
  const freeEpisodes = episodes.filter((e) => e.isFree).length;

  return (
    <MainLayout>
      <CourseJSONLD course={course} />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
                    difficultyColors[course.difficulty] || "border-foreground/[0.1] text-foreground/50"
                  )}
                >
                  {course.difficulty}
                </span>
                <span className="text-sm text-foreground/40">
                  {course.durationWeeks} weeks &bull; {episodes.length} episodes
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{course.title}</h1>
              <p className="text-lg text-foreground/50 mb-6 leading-relaxed">{course.tagline}</p>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-foreground/30" />
                  <span className="text-sm">{course.instructor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-foreground/30" />
                  <span className="text-sm">{course.durationWeeks} weeks</span>
                </div>
              </div>

              <Link href={`/courses/${course.slug}/${episodes[0]?.slug || ""}`}>
                <Button size="lg" className="h-14 px-10 text-base font-bold shadow-lg shadow-primary/25">
                  Start Course
                </Button>
              </Link>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

            <div>
              <h2 className="text-2xl font-bold mb-6">What You&apos;ll Learn</h2>
              <ul className="space-y-4">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/60">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
                <h3 className="font-bold mb-5 uppercase text-sm tracking-wider">Course Episodes</h3>
                <EpisodeList episodes={episodes} courseSlug={course.slug} />
                {freeEpisodes > 0 && (
                  <p className="text-xs text-foreground/40 mt-4">
                    {freeEpisodes} free episode{freeEpisodes > 1 ? "s" : ""} available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
