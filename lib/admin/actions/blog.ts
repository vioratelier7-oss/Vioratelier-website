"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { bool, fail, friendlyDbError, guard, ok, str, type ActionState } from "@/lib/admin/action";
import { imageUrl, optText, slugSchema, uuidOrEmpty } from "@/lib/admin/schemas";
import { sanitizeArticle } from "@/lib/admin/sanitize";
import { revalidateSite } from "@/lib/admin/revalidate";
import { readingMinutes } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(200),
  slug: slugSchema,
  excerpt: optText(500, "Excerpt"),
  content_html: z.string().max(200000, "The article is too long."),
  cover_image_url: imageUrl,
  cover_image_alt: optText(300, "Alt text"),
  category_id: uuidOrEmpty,
  author_name: optText(120, "Author name"),
  is_featured: z.boolean(),
  published_at: z.string().trim().refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Pick a valid date and time."),
  seo_title: optText(120, "SEO title"),
  seo_description: optText(320, "SEO description"),
  og_image_url: imageUrl,
});

export async function saveBlogPostAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  const res = await guard(async () => {
    const staff = await requireStaff();
    const id = str(fd, "id") || null;
    const intent = str(fd, "_intent"); // save | publish | unpublish
    const v = schema.parse({
      title: str(fd, "title"), slug: str(fd, "slug"), excerpt: str(fd, "excerpt"), content_html: String(fd.get("content_html") ?? ""),
      cover_image_url: str(fd, "cover_image_url"), cover_image_alt: str(fd, "cover_image_alt"), category_id: str(fd, "category_id"),
      author_name: str(fd, "author_name"), is_featured: bool(fd, "is_featured"), published_at: str(fd, "published_at"),
      seo_title: str(fd, "seo_title"), seo_description: str(fd, "seo_description"), og_image_url: str(fd, "og_image_url"),
    });
    const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : (str(fd, "status") === "published" ? "published" : "draft");
    const content_html = sanitizeArticle(v.content_html);
    const plain = content_html.replace(/<[^>]+>/g, " ").trim();
    if (status === "published" && plain.length < 20) return fail("Write the article before publishing it.", { content_html: "The article is empty." });
    // datetime-local arrives without a zone: it's entered in India time.
    const tz = (s: string) => (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) ? `${s}:00+05:30` : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s) ? `${s}+05:30` : s);
    const chosen = v.published_at ? new Date(tz(v.published_at)).toISOString() : null;
    let existingPublishedAt: string | null = null;
    if (id) {
      const { data: cur } = await staff.supabase.from("blog_posts").select("published_at").eq("id", id).maybeSingle();
      existingPublishedAt = cur?.published_at ?? null;
    }
    // Empty date field: keep the original publish date when there is one, otherwise "now".
    const published_at = status === "published" ? chosen ?? existingPublishedAt ?? new Date().toISOString() : chosen;
    const row = {
      ...v, content_html, status: status as "draft" | "published", published_at,
      reading_minutes: Math.min(240, readingMinutes(content_html)),
      author_name: v.author_name,
    };
    const db = staff.supabase;
    if (id) {
      const { error } = await db.from("blog_posts").update(row).eq("id", id);
      if (error) return error.code === "23505" ? fail("Another article uses this slug.", { slug: "Another article uses this slug." }) : fail(friendlyDbError(error));
    } else {
      const { data, error } = await db.from("blog_posts").insert({ ...row, author_id: staff.userId }).select("id").single();
      if (error) return error.code === "23505" ? fail("Another article uses this slug.", { slug: "Another article uses this slug." }) : fail(friendlyDbError(error));
      createdId = data.id;
    }
    revalidateSite();
    const scheduled = status === "published" && published_at && new Date(published_at) > new Date();
    const msg = status === "published" ? (scheduled ? `Scheduled. It goes live on ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(published_at!))}.` : "Published. The article is live.") : "Draft saved.";
    return ok(msg, { status, published_at });
  });
  if (createdId && res?.ok) redirect(`/admin/blog/${createdId}?created=1`);
  return res;
}

export async function deleteBlogPostAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await guard(async () => {
    const staff = await requireStaff();
    const id = z.string().uuid().parse(str(fd, "id"));
    const { error, count } = await staff.supabase.from("blog_posts").delete({ count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("That article no longer exists.");
    revalidateSite();
    return ok("Article deleted.");
  });
  if (res?.ok) redirect("/admin/blog?deleted=1");
  return res;
}
