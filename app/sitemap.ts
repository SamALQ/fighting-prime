import { MetadataRoute } from "next";
import { courses } from "@/data/courses";
import { episodes } from "@/data/episodes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fightingprime.com";

  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const episodeRoutes = episodes.map((episode) => {
    const course = courses.find((c) => c.id === episode.courseId);
    return {
      url: `${baseUrl}/courses/${course?.slug}/${episode.slug}`,
      lastModified: new Date(episode.releaseDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...courseRoutes,
    ...episodeRoutes,
  ];
}
