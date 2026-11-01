// Shared between browser and server: the media rules.
export const MEDIA_BUCKET = "media";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"] as const;
export type AllowedMime = (typeof ALLOWED_MIME)[number];
export const MEDIA_PATH_RE = /^uploads\/\d{4}\/\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[a-z0-9-]{1,80}\.(webp|jpg|png|avif|gif|svg)$/;
export const EXT_BY_MIME: Record<AllowedMime, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif", "image/svg+xml": "svg",
};

export type MediaRow = {
  id: string; path: string; public_url: string; file_name: string; mime_type: string;
  size_bytes: number; width: number | null; height: number | null; alt_text: string | null; created_at: string;
};

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
