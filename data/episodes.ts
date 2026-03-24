export interface VideoResolution {
  label: string;
  key: string;
}

export interface Episode {
  id: string;
  slug: string;
  courseId: string;
  title: string;
  order: number;
  isFree: boolean;
  premium: boolean;
  videoUrl: string;
  description: string;
  videoResolutions: VideoResolution[];
  durationSeconds: number;
  keyTakeaways: string[];
  releaseDate: string;
  hasAssignment?: boolean;
  assignmentPoints?: number;
  thumbnail?: string;
}
