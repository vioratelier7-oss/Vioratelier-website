"use client";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { ALLOWED_MIME, EXT_BY_MIME, MAX_UPLOAD_BYTES, MEDIA_BUCKET, type AllowedMime } from "@/lib/admin/media-shared";
import { recordMediaAction } from "@/lib/admin/actions/media";
import type { MediaRow } from "@/lib/admin/media-shared";

const MAX_DIM = 2400;

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = () => { reject(new Error("This image couldn't be read. Try another file.")); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

async function svgSize(file: File): Promise<{ width: number | null; height: number | null }> {
  try {
    const text = await file.text();
    const vb = text.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
    const w = text.match(/<svg[^>]*\swidth=["']([\d.]+)/i); const h = text.match(/<svg[^>]*\sheight=["']([\d.]+)/i);
    return { width: w ? Math.round(+w[1]) : null, height: h ? Math.round(+h[1]) : null };
  } catch { return { width: null, height: null }; }
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type as AllowedMime)) return `“${file.name}” isn't a supported image. Use JPG, PNG, WebP, AVIF, GIF or SVG.`;
  if (file.size > MAX_UPLOAD_BYTES) return `“${file.name}” is larger than 10 MB.`;
  if (file.size === 0) return `“${file.name}” is empty.`;
  return null;
}

/** Downscale to 2400px max and re-encode as WebP (SVG and GIF are kept as they are). */
export async function optimise(file: File): Promise<{ blob: Blob; mime: AllowedMime; width: number | null; height: number | null }> {
  const mime = file.type as AllowedMime;
  if (mime === "image/svg+xml") return { blob: file, mime, ...(await svgSize(file)) };
  const img = await loadImage(file);
  const w0 = img.naturalWidth, h0 = img.naturalHeight;
  if (mime === "image/gif") return { blob: file, mime, width: w0, height: h0 };
  const scale = Math.min(1, MAX_DIM / Math.max(w0, h0));
  const w = Math.round(w0 * scale), h = Math.round(h0 * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { blob: file, mime, width: w0, height: h0 };
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.86));
  // Keep the original if the browser can't encode WebP, or if WebP came out bigger with no resize.
  if (!blob || blob.type !== "image/webp") return { blob: file, mime, width: w0, height: h0 };
  if (scale === 1 && blob.size >= file.size && mime === "image/webp") return { blob: file, mime, width: w0, height: h0 };
  return { blob, mime: "image/webp", width: w, height: h };
}

function uuid() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16));
}

/** Validates, optimises, uploads straight to Storage with the user's session, then records the row server-side. */
export async function uploadImage(file: File, alt?: string): Promise<MediaRow> {
  const invalid = validateFile(file);
  if (invalid) throw new Error(invalid);
  const { blob, mime, width, height } = await optimise(file);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error(`“${file.name}” is still larger than 10 MB after optimising.`);
  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "image";
  const now = new Date();
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${uuid()}-${base}.${EXT_BY_MIME[mime]}`;
  const supabase = createBrowserSupabase();
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, { contentType: mime, cacheControl: "31536000", upsert: false });
  if (error) {
    if (/row-level security|unauthori|403/i.test(error.message)) throw new Error("Upload refused: your session doesn't have CMS access. Sign in again.");
    throw new Error(`Upload failed: ${error.message}`);
  }
  const fileName = `${base}.${EXT_BY_MIME[mime]}`;
  const res = await recordMediaAction({ path, fileName, mime, size: blob.size, width, height, alt: alt ?? "" });
  if (!res.ok || !res.row) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]).catch(() => {});
    throw new Error(res.message);
  }
  return res.row;
}
