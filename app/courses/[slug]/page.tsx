import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { fetchCourseBySlug, fetchEpisodesByCourseId } from "@/lib/db";
import { EpisodeList } from "@/components/ui/episode-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Play, Sparkles, User } from "lucide-react";
import { CourseJSONLD } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";
import { CourseHeroClient } from "./course-hero-client";

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

function formatCourseDuration(episodes: { durationSeconds: number }[]): string {
  const totalSec = episodes.reduce((s, e) => s + e.durationSeconds, 0);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours} Hour, ${minutes} Min` : `${hours} Hour`;
  return `${minutes} Min`;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await fetchCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const episodes = await fetchEpisodesByCourseId(course.id);
  const freeEpisodes = episodes.filter((e) => e.isFree).length;
  const totalDuration = formatCourseDuration(episodes);
  const firstEpisodeSlug = episodes[0]?.slug || "";

  return (
    <MainLayout>
      <CourseJSONLD course={course} />

      {/* Cinematic splash hero */}
      <section className="relative min-h-[85vh] flex items-end overflow-hidden">
        {/* Background poster */}
        <div className="absolute inset-0">
          {(course.coverImage || course.posterImage) ? (
            <Image
              src={course.coverImage || course.posterImage}
              alt={course.title}
              fill
              className="object-cover object-top"
              priority
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-[#0a0a0a] to-[#0a0a0a]" />
          )}

          {/* Multi-layer gradient for cinematic depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

          {/* Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />

          {/* Subtle film grain texture */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-48">
            <div className="max-w-3xl">
              {/* Release date badge */}
              {course.releaseDate && (
                <div className="mb-5">
                  <span className="inline-block px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md border border-white/15 bg-white/[0.06] backdrop-blur-sm text-white/70">
                    {new Date(course.releaseDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.9] text-white mb-6 drop-shadow-2xl">
                {course.title}
              </h1>

              {/* Difficulty indicator */}
              <div className="flex items-end gap-2.5 mb-5">
                {course.difficultyMeterImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.difficultyMeterImage}
                    alt={`${course.difficulty} difficulty`}
                    width={80}
                    height={20}
                    className="block h-6 w-auto shrink-0 object-contain object-bottom drop-shadow-lg"
                  />
                ) : null}
                <span className="text-xs font-black uppercase tracking-widest text-white/60 leading-none">
                  {course.difficulty}
                </span>
              </div>

              {/* Tagline */}
              <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-6 max-w-2xl">
                {course.tagline}
              </p>

              {/* Accent line */}
              <div className="w-20 h-[2px] bg-primary mb-8" />

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-sm text-[12px] font-bold uppercase tracking-wider text-white/60">
                  {episodes.length} Episodes
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-sm text-[12px] font-bold uppercase tracking-wider text-white/60">
                  {totalDuration}
                </span>
                {(course.totalPoints ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-sm text-[12px] font-bold uppercase tracking-wider text-white/60">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    {course.totalPoints} Points
                  </span>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-10">
                {course.instructor.image ? (
                  <Image
                    src={course.instructor.image}
                    alt={course.instructor.name}
                    width={36}
                    height={36}
                    className="rounded-full object-cover ring-2 ring-white/10"
                    unoptimized
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white/[0.08] flex items-center justify-center ring-2 ring-white/10">
                    <User className="h-4 w-4 text-white/40" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white/80">{course.instructor.name}</p>
                  {course.instructor.title && (
                    <p className="text-xs text-white/35">{course.instructor.title}</p>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link href={`/courses/${course.slug}/${firstEpisodeSlug}`}>
                  <Button size="lg" className="h-14 px-10 text-base font-black uppercase tracking-wider shadow-2xl shadow-primary/30">
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Start Course
                  </Button>
                </Link>
                {course.trailerUrl && (
                  <CourseHeroClient trailerUrl={course.trailerUrl} />
                )}
              </div>

              {/* Progress bar (client component handles this) */}
            </div>
          </div>
        </div>

        {/* Bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
      </section>

      {/* Course content below the splash */}
      <Section className="!pt-0 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Learning outcomes */}
          <div className="lg:col-span-2 space-y-10">
            {course.learningOutcomes.length > 0 && (
              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-8">
                <h2 className="text-2xl font-bold mb-6 uppercase tracking-tight">What You&apos;ll Learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/60 leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {freeEpisodes > 0 && (
              <p className="text-xs text-foreground/30 uppercase tracking-wider font-bold">
                {freeEpisodes} free episode{freeEpisodes > 1 ? "s" : ""} available — no subscription needed
              </p>
            )}
          </div>

          {/* Episode sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
                <h3 className="font-bold mb-5 uppercase text-sm tracking-wider">Course Episodes</h3>
                <EpisodeList episodes={episodes} courseSlug={course.slug} />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
