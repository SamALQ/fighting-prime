import { createClient } from "@/lib/supabase/server";
import type { Course, Difficulty } from "@/data/courses";
import type { Episode } from "@/data/episodes";
import type { Breakdown } from "@/data/breakdowns";
import type { Testimonial } from "@/data/testimonials";
import type { FAQ } from "@/data/faq";

// ── Row mappers ──────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapCourse(row: any): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? "",
    difficulty: (row.difficulty ?? "Beginner") as Difficulty,
    durationWeeks: row.duration_weeks ?? 0,
    featured: row.featured ?? false,
    trailerUrl: row.trailer_url ?? "",
    syllabus: row.syllabus ?? [],
    instructor: {
      name: row.instructor_name ?? "",
      title: row.instructor_title ?? "",
      image: row.instructor_image ?? "",
    },
    coverImage: row.cover_image ?? "",
    posterImage: row.poster_image ?? "",
    teaserPortraitImage: row.teaser_portrait_image ?? "",
    difficultyMeterImage: row.difficulty_meter_image ?? "",
    learningOutcomes: row.learning_outcomes ?? [],
    released: row.released ?? false,
    releaseDate: row.release_date ?? "",
    totalPoints: row.total_points ?? 0,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapEpisode(row: any): Episode {
  return {
    id: row.id,
    slug: row.slug,
    courseId: row.course_id,
    title: row.title,
    order: row.episode_order ?? 0,
    isFree: row.is_free ?? false,
    premium: row.premium ?? false,
    videoUrl: row.video_url ?? "",
    description: row.description ?? "",
    videoResolutions: row.video_resolutions ?? [],
    durationSeconds: row.duration_seconds ?? 0,
    keyTakeaways: row.key_takeaways ?? [],
    releaseDate: row.release_date ?? "",
    hasAssignment: row.has_assignment ?? false,
    assignmentPoints: row.assignment_points ?? 0,
    thumbnail: row.thumbnail ?? "",
  };
}

function mapBreakdown(row: any): Breakdown {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    videoUrl: row.video_url ?? "",
    videoResolutions: row.video_resolutions ?? [],
    thumbnail: row.thumbnail ?? "",
    releaseDate: row.release_date ?? "",
    author: row.author ?? "",
  };
}

function mapTestimonial(row: any): Testimonial {
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? "",
    quote: row.quote,
    rating: row.rating ?? 5,
    sortOrder: row.sort_order ?? 0,
  };
}

function mapFaq(row: any): FAQ {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order ?? 0,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Course queries ───────────────────────────────────────────

export async function fetchCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order");
  return (data ?? []).map(mapCourse);
}

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapCourse(data) : null;
}

// ── Episode queries ──────────────────────────────────────────

export async function fetchEpisodes(): Promise<Episode[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("*")
    .order("episode_order");
  return (data ?? []).map(mapEpisode);
}

export async function fetchEpisodesByCourseId(courseId: string): Promise<Episode[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("*")
    .eq("course_id", courseId)
    .order("episode_order");
  return (data ?? []).map(mapEpisode);
}

export async function fetchEpisodeBySlug(slug: string): Promise<Episode | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("episodes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapEpisode(data) : null;
}

// ── Breakdown queries ────────────────────────────────────────

export async function fetchBreakdowns(): Promise<Breakdown[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("breakdowns")
    .select("*")
    .order("release_date", { ascending: false });
  return (data ?? []).map(mapBreakdown);
}

// ── Testimonial queries ──────────────────────────────────────

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order");
  return (data ?? []).map(mapTestimonial);
}

// ── FAQ queries ──────────────────────────────────────────────

export async function fetchFaqs(): Promise<FAQ[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faq")
    .select("*")
    .order("sort_order");
  return (data ?? []).map(mapFaq);
}

// ── Progress queries ─────────────────────────────────────────

export interface EpisodeProgressRow {
  episodeId: string;
  percentWatched: number;
  watchTimeSeconds: number;
  completed: boolean;
}

export async function fetchUserProgress(userId: string): Promise<EpisodeProgressRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_progress")
    .select("episode_id, percent_watched, watch_time_seconds, completed")
    .eq("user_id", userId);

  return (data ?? []).map((row) => ({
    episodeId: row.episode_id,
    percentWatched: row.percent_watched ?? 0,
    watchTimeSeconds: row.watch_time_seconds ?? 0,
    completed: row.completed ?? false,
  }));
}

export async function upsertEpisodeProgress(
  userId: string,
  episodeId: string,
  percent: number,
  watchTimeSeconds: number
) {
  const supabase = await createClient();
  const completed = percent >= 95;

  const { data: existing } = await supabase
    .from("user_progress")
    .select("percent_watched, watch_time_seconds, completed")
    .eq("user_id", userId)
    .eq("episode_id", episodeId)
    .maybeSingle();

  const bestPercent = Math.max(percent, existing?.percent_watched ?? 0);
  const bestWatch = Math.max(watchTimeSeconds, existing?.watch_time_seconds ?? 0);
  const wasCompleted = existing?.completed ?? false;

  await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      episode_id: episodeId,
      percent_watched: bestPercent,
      watch_time_seconds: bestWatch,
      completed: completed || wasCompleted,
      completed_at: (completed && !wasCompleted) ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,episode_id" }
  );
}
