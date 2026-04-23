import type { VideoResolution } from "./episodes";

export interface Breakdown {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoUrl: string;
  /** Multi-resolution S3 keys (same shape as episodes). Optional until column exists in DB. */
  videoResolutions?: VideoResolution[];
  thumbnail: string;
  releaseDate: string;
  author: string;
}
