export type Difficulty = "Beginner" | "Intermediate" | "Advanced" | "Professional";

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  difficulty: Difficulty;
  durationWeeks: number;
  featured: boolean;
  trailerUrl: string;
  syllabus: string[];
  instructor: {
    name: string;
    title: string;
    image?: string;
  };
  coverImage: string;
  learningOutcomes: string[];
  released: boolean;
  releaseDate?: string;
  totalPoints?: number;
  difficultyMeterImage?: string;
  posterImage?: string;
}

export const courses: Course[] = [
  {
    id: "1",
    slug: "muay-thai-foundations",
    title: "Muay Thai Foundations",
    tagline: "Enter the box - build your foundations. Practice makes permanent.",
    difficulty: "Beginner",
    durationWeeks: 8, // Approximate based on 20 episodes
    featured: false,
    trailerUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Muay+Thai+Foundations/Intro%3A+Into+The+Box/MTF+-+Into+the+box+1080+h265+3000+kbs.mov",
    syllabus: [
      "into-the-box",
      "professional-hand-wraps",
      "gaurd-for-kicks",
      "elbow-mentality",
      "dynamic-guard",
      "goals",
      "sting-like-a-knee",
      "training-plan",
      "realistic-training",
      "shadowboxing",
      "skeleton-frame",
      "stance",
      "the-6-punches",
      "the-roundhouse-kick",
      "the-system",
    ],
    instructor: {
      name: "Jake Peacock",
      title: "ONE Championship Athlete",
    },
    coverImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/689dbcdb56b82a21fdc704c6_MTF%20test%20lowq.jpg",
    learningOutcomes: [
      "Master the foundational system of elite Muay Thai",
      "Learn proper technique for punches, kicks, elbows, and knees",
      "Develop a strong stance and guard",
      "Build effective training habits and goal-setting skills",
    ],
    released: true,
    releaseDate: "2025-08-24",
    totalPoints: 200,
    difficultyMeterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/681d4de50935f594b1b13521_Difficulty%20(Biginner%3AIntermediate).png",
    posterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/689dbcdb56b82a21fdc704c6_MTF%20test%20lowq.jpg",
  },
  {
    id: "2",
    slug: "low-kick-sharpshooter",
    title: "Low Kick Sharpshooter",
    tagline: "The bigger they are, the harder they fall. Chop them legs!",
    difficulty: "Intermediate",
    durationWeeks: 2, // Approximate based on 6 episodes
    featured: true,
    trailerUrl: "https://fp-course-content.s3.us-east-1.amazonaws.com/Low+Kick+Sharpshooter/Trailer-Intro/LKS+Trailer+1080+3000kbs+h265.mp4",
    syllabus: [
      "introduction",
      "points-of-contact",
      "maximizing-force",
      "angles-of-attack",
      "defence",
      "weight-manipulation",
      "jedi-mind-tricks",
    ],
    instructor: {
      name: "Jake Peacock",
      title: "ONE Championship Athlete",
    },
    coverImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d2812cb8d4226d9752c03d_Still%202025-09-23%20051413_3.13.1.jpg",
    learningOutcomes: [
      "Master low kick angles and setups",
      "Learn to maximize force and precision",
      "Develop defensive awareness while attacking",
      "Use weight manipulation for 100% land rate",
    ],
    released: true,
    releaseDate: "2025-09-27",
    difficultyMeterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/6836d407490e27760a055dfe_Difficulty%20Meter%20(Intermediate).png",
    posterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68d2812cb8d4226d9752c03d_Still%202025-09-23%20051413_3.13.1.jpg",
  },
  {
    id: "3",
    slug: "elite-ringcraft",
    title: "Elite Ringcraft",
    tagline: "Master the art of ringcraft - dominate your opponents and stay out of danger.",
    difficulty: "Advanced",
    durationWeeks: 3, // Approximate based on 6 chapters
    featured: false,
    trailerUrl: "",
    syllabus: [],
    instructor: {
      name: "Jake Peacock",
      title: "ONE Championship Athlete",
    },
    coverImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b18a227128cc7bc8eb9ebe_Jake-Peacock-L-ONE-Championship-2.jpg",
    learningOutcomes: [
      "Master the art of ringcraft and distance management",
      "Control the ring and dictate the pace",
      "Consistently outmaneuver your opponents",
    ],
    released: false,
    releaseDate: "2025-11-26",
    difficultyMeterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/681d4dfc5213dec3d357fa77_Difficulty%20Meter%20(Advanced).png",
    posterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b18a227128cc7bc8eb9ebe_Jake-Peacock-L-ONE-Championship-2.jpg",
  },
  {
    id: "4",
    slug: "fighter-finances",
    title: "Fighter Finances",
    tagline: "Compete as an athlete, and don't go broke.",
    difficulty: "Intermediate",
    durationWeeks: 4, // Approximate based on 8 chapters
    featured: false,
    trailerUrl: "",
    syllabus: [],
    instructor: {
      name: "Jake Peacock",
      title: "ONE Championship Athlete",
    },
    coverImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b18ab2d399351ebeb9ce67_452701399_1300036514291518_5453883559087983507_n.jpg",
    learningOutcomes: [
      "Build financial discipline as a fighter",
      "Manage finances while competing",
      "Maintain financial health alongside physical health",
    ],
    released: false,
    releaseDate: "2026-01-29",
    difficultyMeterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/6836d407490e27760a055dfe_Difficulty%20Meter%20(Intermediate).png",
    posterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b18ab2d399351ebeb9ce67_452701399_1300036514291518_5453883559087983507_n.jpg",
  },
  {
    id: "5",
    slug: "winning-mindset",
    title: "Winning Mindset",
    tagline: "Unlock your inner champion by harnessing mental resilience.",
    difficulty: "Professional",
    durationWeeks: 4, // Approximate based on 5 chapters
    featured: false,
    trailerUrl: "",
    syllabus: [],
    instructor: {
      name: "Jake Peacock",
      title: "ONE Championship Athlete",
    },
    coverImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b188ff49d940874bb117b0_IMG_6751.jpg",
    learningOutcomes: [
      "Master the mental game of fighting",
      "Build discipline, resilience, and focus",
      "Train like a champion and fight with purpose",
    ],
    released: false,
    releaseDate: "2025-12-26",
    difficultyMeterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68369039cd25e9cf6e0ea589_Difficulty%20Meter%20(Pro).png",
    posterImage: "https://cdn.prod.website-files.com/6808d6bc1b6e8ba63b703680/68b188ff49d940874bb117b0_IMG_6751.jpg",
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((course) => course.slug === slug);
}

export function getCoursesByDifficulty(difficulty: Difficulty): Course[] {
  return courses.filter((course) => course.difficulty === difficulty);
}
