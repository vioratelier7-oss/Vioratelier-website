import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["", "/work", "/services", "/about", "/insights", "/contact", "/privacy", "/terms"].map((p) => ({
    url: `${SITE_URL}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.7,
  }));
  try {
    const db = createPublicClient();
    const [services, projects, posts, seo] = await Promise.all([
      db.from("services").select("slug, updated_at").eq("status", "published"),
      db.from("projects").select("slug, updated_at").eq("status", "published"),
      db.from("blog_posts").select("slug, updated_at").eq("status", "published").lte("published_at", new Date().toISOString()),
      db.from("seo_pages").select("path, robots_index"),
    ]);
    const noindex = new Set((seo.data ?? []).filter((r) => !r.robots_index).map((r) => r.path));
    return [
      ...statics.filter((s) => !noindex.has(s.url.replace(SITE_URL, "") || "/")),
      ...(services.data ?? []).map((s) => ({ url: `${SITE_URL}/services/${s.slug}`, lastModified: s.updated_at, priority: 0.8 })),
      ...(projects.data ?? []).map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
      ...(posts.data ?? []).map((p) => ({ url: `${SITE_URL}/insights/${p.slug}`, lastModified: p.updated_at, priority: 0.6 })),
    ];
  } catch {
    return statics;
  }
}
