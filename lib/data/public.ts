import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

type Tables = Database["public"]["Tables"];
export type Settings = Tables["site_settings"]["Row"];
export type Service = Tables["services"]["Row"];
export type Project = Tables["projects"]["Row"] & { category: { name: string; slug: string } | null };
export type ProjectImage = Tables["project_images"]["Row"];
export type ProjectCategory = Tables["project_categories"]["Row"];
export type Testimonial = Tables["testimonials"]["Row"];
export type BlogPost = Tables["blog_posts"]["Row"] & { category: { name: string; slug: string } | null };
export type BlogCategory = Tables["blog_categories"]["Row"];
export type SeoPage = Tables["seo_pages"]["Row"];
export type Faq = { q: string; a: string };

const PROJECT_FIELDS = "*, category:project_categories(name, slug)";
const POST_FIELDS = "*, category:blog_categories(name, slug)";

// All reads use the anonymous client, so Row Level Security decides what is public.

export const getSettings = cache(async (): Promise<Settings | null> => {
  const { data, error } = await createPublicClient().from("site_settings").select("*").limit(1).maybeSingle();
  if (error) console.error("getSettings", error.message);
  return data;
});

export const getSeoPage = cache(async (path: string): Promise<SeoPage | null> => {
  const { data } = await createPublicClient().from("seo_pages").select("*").eq("path", path).maybeSingle();
  return data;
});

export const getServices = cache(async (): Promise<Service[]> => {
  const { data, error } = await createPublicClient().from("services").select("*").eq("status", "published").order("sort_order");
  if (error) console.error("getServices", error.message);
  return data ?? [];
});

export const getService = cache(async (slug: string): Promise<Service | null> => {
  const { data } = await createPublicClient().from("services").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  return data;
});

export const getProjectCategories = cache(async (): Promise<ProjectCategory[]> => {
  const { data } = await createPublicClient().from("project_categories").select("*").order("sort_order");
  return data ?? [];
});

export const getProjects = cache(async (opts: { featured?: boolean; limit?: number; categorySlug?: string } = {}): Promise<Project[]> => {
  let query = createPublicClient().from("projects").select(PROJECT_FIELDS).eq("status", "published");
  if (opts.featured) query = query.eq("is_featured", true);
  query = query.order("is_featured", { ascending: false }).order("sort_order").order("completed_on", { ascending: false, nullsFirst: false });
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) console.error("getProjects", error.message);
  const rows = (data ?? []) as unknown as Project[];
  return opts.categorySlug ? rows.filter((p) => p.category?.slug === opts.categorySlug) : rows;
});

export const getProject = cache(async (slug: string) => {
  const client = createPublicClient();
  const { data } = await client.from("projects").select(PROJECT_FIELDS).eq("slug", slug).eq("status", "published").maybeSingle();
  if (!data) return null;
  const project = data as unknown as Project;
  const { data: images } = await client.from("project_images").select("*").eq("project_id", project.id).order("sort_order");
  return { project, images: images ?? [] };
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const { data } = await createPublicClient().from("testimonials").select("*").eq("status", "published").eq("is_approved", true).order("sort_order");
  return data ?? [];
});

export const getBlogCategories = cache(async (): Promise<BlogCategory[]> => {
  const { data } = await createPublicClient().from("blog_categories").select("*").order("sort_order");
  return data ?? [];
});

export const getPosts = cache(async (opts: { limit?: number } = {}): Promise<BlogPost[]> => {
  let query = createPublicClient().from("blog_posts").select(POST_FIELDS).eq("status", "published")
    .lte("published_at", new Date().toISOString()).order("is_featured", { ascending: false }).order("published_at", { ascending: false });
  if (opts.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) console.error("getPosts", error.message);
  return (data ?? []) as unknown as BlogPost[];
});

export const getPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const { data } = await createPublicClient().from("blog_posts").select(POST_FIELDS).eq("slug", slug).eq("status", "published")
    .lte("published_at", new Date().toISOString()).maybeSingle();
  return (data as unknown as BlogPost) ?? null;
});

export function asFaqs(value: unknown): Faq[] {
  return Array.isArray(value) ? value.filter((f): f is Faq => !!f && typeof f.q === "string" && typeof f.a === "string") : [];
}
