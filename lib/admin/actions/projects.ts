"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { bool, fail, friendlyDbError, guard, json, ok, str, type ActionState } from "@/lib/admin/action";
import { imageUrl, optText, optUrl, slugSchema, sortOrder, statusSchema, uuidOrEmpty } from "@/lib/admin/schemas";
import { revalidateSite } from "@/lib/admin/revalidate";

const galleryItem = z.object({
  id: z.string().uuid().optional(),
  image_url: z.string().min(1).max(2000),
  storage_path: z.string().max(500).nullable().optional(),
  alt_text: z.string().max(300, "Gallery alt text can be up to 300 characters.").nullable().optional(),
  caption: z.string().max(300, "Captions can be up to 300 characters.").nullable().optional(),
});

const projectSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(160, "Keep the title under 160 characters."),
  slug: slugSchema,
  client_name: optText(160, "Client name"),
  category_id: uuidOrEmpty,
  short_description: optText(400, "Short description"),
  overview: optText(20000), challenge: optText(20000), solution: optText(20000), results: optText(20000),
  results_verified: z.boolean(),
  cover_image_url: imageUrl,
  cover_image_alt: optText(300, "Alt text"),
  project_url: optUrl,
  technologies: z.array(z.string().trim().min(1).max(40, "Each technology tag can be up to 40 characters.")).max(30, "Up to 30 technologies."),
  completed_on: z.string().trim().refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), "Pick a valid date.").transform((v) => (v === "" ? null : v)),
  status: statusSchema,
  is_featured: z.boolean(),
  is_sample: z.boolean(),
  sort_order: sortOrder,
  seo_title: optText(120, "SEO title"),
  seo_description: optText(320, "SEO description"),
  og_image_url: imageUrl,
  gallery: z.array(galleryItem).max(60, "Up to 60 gallery images."),
});

export async function saveProjectAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  const res = await guard(async () => {
    const staff = await requireStaff();
    const id = str(fd, "id") || null;
    const v = projectSchema.parse({
      title: str(fd, "title"), slug: str(fd, "slug"), client_name: str(fd, "client_name"), category_id: str(fd, "category_id"),
      short_description: str(fd, "short_description"), overview: str(fd, "overview"), challenge: str(fd, "challenge"),
      solution: str(fd, "solution"), results: str(fd, "results"), results_verified: bool(fd, "results_verified"),
      cover_image_url: str(fd, "cover_image_url"), cover_image_alt: str(fd, "cover_image_alt"), project_url: str(fd, "project_url"),
      technologies: json<string[]>(fd, "technologies", []), completed_on: str(fd, "completed_on"),
      status: str(fd, "_intent") === "publish" ? "published" : str(fd, "_intent") === "unpublish" ? "draft" : str(fd, "status") || "draft",
      is_featured: bool(fd, "is_featured"), is_sample: bool(fd, "is_sample"), sort_order: str(fd, "sort_order"),
      seo_title: str(fd, "seo_title"), seo_description: str(fd, "seo_description"), og_image_url: str(fd, "og_image_url"),
      gallery: json<unknown[]>(fd, "gallery", []),
    });
    const { gallery, ...fields } = v;
    const db = staff.supabase;

    let projectId = id;
    let wasPublishedAt: string | null = null;
    if (id) {
      const { data: existing, error: readErr } = await db.from("projects").select("id, published_at").eq("id", id).single();
      if (readErr || !existing) return fail(friendlyDbError(readErr));
      wasPublishedAt = existing.published_at;
    }
    const published_at = fields.status === "published" ? wasPublishedAt ?? new Date().toISOString() : null;
    const row = { ...fields, published_at, updated_by: staff.userId };

    if (id) {
      const { error } = await db.from("projects").update(row).eq("id", id);
      if (error) return error.code === "23505" ? fail("Another project already uses this slug.", { slug: "Another project already uses this slug." }) : fail(friendlyDbError(error));
    } else {
      const { data, error } = await db.from("projects").insert({ ...row, created_by: staff.userId }).select("id").single();
      if (error) return error.code === "23505" ? fail("Another project already uses this slug.", { slug: "Another project already uses this slug." }) : fail(friendlyDbError(error));
      projectId = data.id;
      createdId = data.id;
    }

    // Sync the gallery to exactly what the form holds (order = sort_order).
    const { data: current } = await db.from("project_images").select("id").eq("project_id", projectId!);
    const keep = new Set(gallery.filter((g) => g.id).map((g) => g.id!));
    const remove = (current ?? []).map((r) => r.id).filter((x) => !keep.has(x));
    if (remove.length) {
      const { error } = await db.from("project_images").delete().in("id", remove);
      if (error) return fail(friendlyDbError(error));
    }
    for (const [i, g] of gallery.entries()) {
      const payload = { project_id: projectId!, image_url: g.image_url, storage_path: g.storage_path ?? null, alt_text: g.alt_text?.trim() || null, caption: g.caption?.trim() || null, sort_order: i };
      const { error } = g.id
        ? await db.from("project_images").update(payload).eq("id", g.id).eq("project_id", projectId!)
        : await db.from("project_images").insert(payload);
      if (error) return fail(friendlyDbError(error));
    }

    revalidateSite();
    const verb = fields.status === "published" ? (wasPublishedAt ? "Project saved and live." : "Project published. It's live on the website.") : id && wasPublishedAt ? "Project unpublished and saved as a draft." : "Draft saved.";
    return ok(verb, { status: fields.status });
  });
  if (createdId && res?.ok) redirect(`/admin/projects/${createdId}?created=1`);
  return res;
}

export async function deleteProjectAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await guard(async () => {
    const staff = await requireStaff();
    const id = z.string().uuid().parse(str(fd, "id"));
    const { error, count } = await staff.supabase.from("projects").delete({ count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("That project no longer exists.");
    revalidateSite();
    return ok("Project deleted.");
  });
  if (res?.ok && str(fd, "redirect") === "1") redirect("/admin/projects?deleted=1");
  return res;
}

/* ---------------------------------------------------------------- categories */
const categorySchema = z.object({
  name: z.string().trim().min(1, "Add a name.").max(80, "Keep the name under 80 characters."),
  slug: slugSchema,
  description: optText(400, "Description"),
  sort_order: sortOrder,
});

type CatTable = "project_categories" | "blog_categories";
function catTable(fd: FormData): CatTable {
  const t = str(fd, "table");
  if (t !== "project_categories" && t !== "blog_categories") throw new z.ZodError([{ code: "custom", path: ["table"], message: "Unknown category type." }]);
  return t;
}

export async function saveCategoryAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff();
    const table = catTable(fd);
    const id = str(fd, "id") || null;
    const v = categorySchema.parse({ name: str(fd, "name"), slug: str(fd, "slug"), description: str(fd, "description"), sort_order: str(fd, "sort_order") });
    const { error } = id ? await staff.supabase.from(table).update(v).eq("id", id) : await staff.supabase.from(table).insert(v);
    if (error) return error.code === "23505" ? fail("A category with that name or slug already exists.", { slug: "Already in use." }) : fail(friendlyDbError(error));
    revalidateSite();
    return ok(id ? "Category saved." : "Category added.");
  });
}

export async function deleteCategoryAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff();
    const table = catTable(fd);
    const id = z.string().uuid().parse(str(fd, "id"));
    const { error } = await staff.supabase.from(table).delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    revalidateSite();
    return ok("Category deleted. Items in it are now uncategorised.");
  });
}
