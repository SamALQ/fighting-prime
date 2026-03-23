import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { fetchCourseBySlug, fetchEpisodesByCourseId } from "@/lib/db";
import { EpisodeList } from "@/components/ui/episode-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, User } from "lucide-react";
import { CourseJSONLD } from "@/components/seo/json-ld";

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

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await fetchCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const episodes = await fetchEpisodesByCourseId(course.id);
  const freeEpisodes = episodes.filter((e) => e.isFree).length;

  const difficultyColors = {
    Beginner: "bg-green-500/20 text-green-400",
    Intermediate: "bg-yellow-500/20 text-yellow-400",
    Advanced: "bg-red-500/20 text-red-400",
    Professional: "bg-purple-500/20 text-purple-400",
  };

  return (
    <MainLayout>
      <CourseJSONLD course={course} />
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={difficultyColors[course.difficulty]}>
                  {course.difficulty}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {course.durationWeeks} weeks &bull; {episodes.length} episodes
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{course.tagline}</p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{course.instructor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{course.durationWeeks} weeks</span>
                </div>
              </div>

              <Link href={`/courses/${course.slug}/${episodes[0]?.slug || ""}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  Start Course
                </Button>
              </Link>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">What You&apos;ll Learn</h2>
              <ul className="space-y-3">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Course Episodes</h3>
                <EpisodeList episodes={episodes} courseSlug={course.slug} />
                {freeEpisodes > 0 && (
                  <p className="text-xs text-muted-foreground mt-4">
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
