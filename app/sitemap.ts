import { MetadataRoute } from "next";
import { fetchCourses, fetchEpisodes } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, episodes] = await Promise.all([
    fetchCourses(),
    fetchEpisodes(),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fightingprime.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/breakdowns`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const coursePages: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const episodePages: MetadataRoute.Sitemap = episodes.map((episode) => {
    const course = courses.find((c) => c.id === episode.courseId);
    return {
      url: `${baseUrl}/courses/${course?.slug ?? "unknown"}/${episode.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    };
  });

  return [...staticPages, ...coursePages, ...episodePages];
}
