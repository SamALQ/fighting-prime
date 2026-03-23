import Script from "next/script";
import type { Course } from "@/data/courses";

export function OrganizationJSONLD() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fighting Prime Academy",
    description: "Elite Muay Thai courses led by ONE Championship athlete Jake Peacock",
    url: "https://fightingprime.com",
    logo: "https://fightingprime.com/logo.png",
    sameAs: [
      "https://instagram.com/fightingprime",
      "https://twitter.com/fightingprime",
      "https://youtube.com/@fightingprime",
    ],
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function CourseJSONLD({ course }: { course: Course }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.tagline,
    provider: {
      "@type": "Organization",
      name: "Fighting Prime Academy",
    },
    courseCode: course.slug,
    educationalLevel: course.difficulty,
    timeRequired: `P${course.durationWeeks}W`,
  };

  return (
    <Script
      id={`course-${course.slug}-jsonld`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function FAQJSONLD({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
