import { notFound } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Section } from "@/components/layout/section";
import { fetchCourseBySlug, fetchEpisodeBySlug, fetchEpisodesByCourseId } from "@/lib/db";
import { VideoPlayer } from "@/components/ui/video-player";
import { EpisodeList } from "@/components/ui/episode-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { CommentSection } from "@/components/ui/comment-section";

interface EpisodeDetailPageProps {
  params: Promise<{ slug: string; episodeSlug: string }>;
}

export default async function EpisodeDetailPage({ params }: EpisodeDetailPageProps) {
  const { slug, episodeSlug } = await params;
  const course = await fetchCourseBySlug(slug);
  const episode = await fetchEpisodeBySlug(episodeSlug);

  if (!course || !episode || episode.courseId !== course.id) {
    notFound();
  }

  const episodes = await fetchEpisodesByCourseId(course.id);
  const currentIndex = episodes.findIndex((e) => e.slug === episodeSlug);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  return (
    <MainLayout>
      <Section>
        <Container>
          <div className="mb-6">
            <Link
              href={`/courses/${course.slug}`}
              className="text-sm text-foreground/40 hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to {course.title}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <VideoPlayer episode={episode} />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-foreground/40">
                    Episode {episode.order}
                  </span>
                  {episode.premium && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-bold">
                      Premium
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{episode.title}</h1>
                <p className="text-foreground/40">
                  Duration: {Math.floor(episode.durationSeconds / 60)}:{String(episode.durationSeconds % 60).padStart(2, "0")}
                </p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

              <div>
                <h2 className="text-xl font-bold mb-5">Key Takeaways</h2>
                <ul className="space-y-3">
                  {episode.keyTakeaways.map((takeaway, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/60">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
                <h2 className="text-xl font-bold mb-2">Assignment</h2>
                <p className="text-foreground/50 mb-4">
                  Practice the techniques shown in this episode and submit a video for feedback.
                </p>
                <Button variant="outline" disabled className="border-foreground/[0.08]">
                  Submit Assignment (Coming Soon)
                </Button>
              </div>

              <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
                <CommentSection
                  commentableType="episode"
                  commentableId={episode.id}
                />
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-foreground/[0.06]">
                {prevEpisode ? (
                  <Link href={`/courses/${course.slug}/${prevEpisode.slug}`}>
                    <Button variant="outline" className="border-foreground/[0.08] hover:border-primary/30">
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous Episode
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {nextEpisode ? (
                  <Link href={`/courses/${course.slug}/${nextEpisode.slug}`}>
                    <Button className="shadow-lg shadow-primary/25">
                      Next Episode
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] p-6">
                  <h3 className="font-bold mb-5 uppercase text-sm tracking-wider">Course Episodes</h3>
                  <EpisodeList episodes={episodes} courseSlug={course.slug} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </MainLayout>
  );
}
