-- Optional: multi-resolution breakdown videos (same JSON shape as episodes.video_resolutions).
-- Run in Supabase SQL Editor only if you need multiple qualities per breakdown.
-- Example: [{"label":"1080p","key":"breakdowns/my-slug/video-1080p.mp4"},{"label":"720p","key":"breakdowns/my-slug/video-720p.mp4"}]

ALTER TABLE breakdowns
ADD COLUMN IF NOT EXISTS video_resolutions jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN breakdowns.video_resolutions IS 'Array of {label, key} for S3 presigned playback; empty = derive from video_url or slug path';
