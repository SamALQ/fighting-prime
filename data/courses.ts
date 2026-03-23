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
  sortOrder?: number;
}
