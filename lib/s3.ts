import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

function getS3Client(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    region: process.env.AWS_S3_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  return _client;
}

function getBucket(): string {
  return process.env.AWS_S3_BUCKET || "fighting-prime-media";
}

export async function getPresignedViewUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
}

export async function listObjects(
  prefix: string,
  delimiter = "/"
): Promise<{ objects: S3Object[]; prefixes: string[] }> {
  const client = getS3Client();
  const command = new ListObjectsV2Command({
    Bucket: getBucket(),
    Prefix: prefix,
    Delimiter: delimiter,
  });
  const response = await client.send(command);

  const objects: S3Object[] = (response.Contents ?? [])
    .filter((obj) => obj.Key && obj.Key !== prefix)
    .map((obj) => ({
      key: obj.Key!,
      size: obj.Size ?? 0,
      lastModified: obj.LastModified?.toISOString() ?? "",
      isFolder: false,
    }));

  const prefixes = (response.CommonPrefixes ?? [])
    .map((p) => p.Prefix!)
    .filter(Boolean);

  return { objects, prefixes };
}

export async function headObject(key: string) {
  const client = getS3Client();
  const command = new HeadObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  const response = await client.send(command);
  return {
    contentType: response.ContentType ?? "application/octet-stream",
    contentLength: response.ContentLength ?? 0,
    lastModified: response.LastModified?.toISOString() ?? "",
  };
}

export async function deleteObject(key: string): Promise<void> {
  const client = getS3Client();
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await client.send(command);
}

export function getPublicUrl(key: string): string {
  const bucket = getBucket();
  const region = process.env.AWS_S3_REGION || "us-east-1";
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/** If `url` is a public URL for this app's bucket, return the S3 object key; otherwise null. */
export function tryExtractS3KeyFromUrl(url: string, bucket = getBucket()): string | null {
  if (!url || !url.startsWith("http")) return null;
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (host === `${bucket}.s3.amazonaws.com` || host.startsWith(`${bucket}.s3.`)) {
      const key = u.pathname.replace(/^\//, "");
      return key || null;
    }
    if (host.startsWith("s3.") && u.pathname.startsWith(`/${bucket}/`)) {
      return u.pathname.slice(`/${bucket}/`.length) || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * S3 key conventions:
 *
 * courses/{courseSlug}/episodes/{episodeSlug}/video-{resolution}.mp4
 * courses/{courseSlug}/episodes/{episodeSlug}/thumbnail.jpg
 * courses/{courseSlug}/cover.jpg
 * breakdowns/{breakdownSlug}/video.mp4
 * breakdowns/{breakdownSlug}/thumbnail.jpg
 * elite/{userId}/{submissionId}/upload.mp4
 * elite/{userId}/{submissionId}/response.mp4
 * assignments/{userId}/{episodeId}/{timestamp}.mp4
 */
export function buildEpisodeVideoKey(
  courseSlug: string,
  episodeSlug: string,
  resolution: string
): string {
  return `courses/${courseSlug}/episodes/${episodeSlug}/video-${resolution}.mp4`;
}

export function buildEpisodeThumbnailKey(
  courseSlug: string,
  episodeSlug: string
): string {
  return `courses/${courseSlug}/episodes/${episodeSlug}/thumbnail.jpg`;
}

export function buildBreakdownVideoKey(breakdownSlug: string): string {
  return `breakdowns/${breakdownSlug}/video.mp4`;
}

export function buildEliteUploadKey(
  userId: string,
  submissionId: string
): string {
  return `elite/${userId}/${submissionId}/upload.mp4`;
}

export function buildEliteResponseKey(
  userId: string,
  submissionId: string
): string {
  return `elite/${userId}/${submissionId}/response.mp4`;
}

export function buildAssignmentKey(
  userId: string,
  episodeId: string,
  timestamp: number
): string {
  return `assignments/${userId}/${episodeId}/${timestamp}.mp4`;
}
