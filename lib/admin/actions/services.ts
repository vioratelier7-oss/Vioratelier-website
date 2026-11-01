"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff, requireSuperAdmin } from "@/lib/auth";
import { fail, friendlyDbError, guard, json, lines, ok, str, type ActionState } from "@/lib/admin/action";
import { imageUrl, optText, slugSchema, statusSchema, uuidOrEmpty } from "@/lib/admin/schemas";
import { revalidateSite } from "@/lib/admin/revalidate";

const lineArr = (label: string) => z.array(z.string().max(300, `Each ${label} line can be up to 300 characters.`)).max(40, `Up to 40 ${label} lines.`);

const serviceSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(160),
  slug: slugSchema,
  category_id: uuidOrEmpty,
  summary: optText(400, "Summary"),
  hero_heading: optText(200, "Hero heading"),
  overview: optText(20000),
  scope: lineArr("scope"), problems: lineArr("problem"), benefits: lineArr("benefit"), deliverables: lineArr("deliverable"),
  faqs: z.array(z.object({ q: z.string().trim().min(1, "Every FAQ needs a question.").max(300), a: z.string().trim().min(1, "Every FAQ needs an answer.").max(3000) })).max(30),
  image_url: imageUrl,
  image_alt: optText(300, "Alt text"),
  status: statusSchema,
  seo_title: optText(120, "SEO title"),
  seo_description: optText(320, "SEO description"),
  og_image_url: imageUrl,
});

export async function saveServiceAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  const res = await guard(async () => {
    const staff = await requireStaff();
    const id = str(fd, "id") || null;
    const intent = str(fd, "_intent");
    const faqs = json<{ q: string; a: string }[]>(fd, "faqs", []).filter((f) => f.q?.trim() || f.a?.trim());
    const v = serviceSchema.parse({
      title: str(fd, "title"), slug: str(fd, "slug"), category_id: str(fd, "category_id"), summary: str(fd, "summary"),
      hero_heading: str(fd, "hero_heading"), overview: str(fd, "overview"),
      scope: lines(fd, "scope"), problems: lines(fd, "problems"), benefits: lines(fd, "benefits"), deliverables: lines(fd, "deliverables"),
      faqs, image_url: str(fd, "image_url"), image_alt: str(fd, "image_alt"),
      status: intent === "publish" ? "published" : intent === "unpublish" ? "draft" : str(fd, "status") || "draft",
      seo_title: str(fd, "seo_title"), seo_description: str(fd, "seo_description"), og_image_url: str(fd, "og_image_url"),
    });
    const db = staff.supabase;
    if (id) {
      const { error } = await db.from("services").update(v).eq("id", id);
      if (error) return error.code === "23505" ? fail("Another service uses this slug.", { slug: "Another service uses this slug." }) : fail(friendlyDbError(error));
    } else {
      const { data: last } = await db.from("services").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
      const { data, error } = await db.from("services").insert({ ...v, sort_order: (last?.sort_order ?? 0) + 1 }).select("id").single();
      if (error) return error.code === "23505" ? fail("Another service uses this slug.", { slug: "Another service uses this slug." }) : fail(friendlyDbError(error));
      createdId = data.id;
    }
    revalidateSite();
    return ok(v.status === "published" ? "Service saved. It's live on the website." : "Service saved as a draft.", { status: v.status });
  });
  if (createdId && res?.ok) redirect(`/admin/services/${createdId}?created=1`);
  return res;
}

export async function reorderServicesAction(ids: string[]): Promise<{ ok: boolean; message: string }> {
  try {
    const staff = await requireStaff();
    const v = z.array(z.string().uuid()).min(1).max(200).parse(ids);
    for (const [i, id] of v.entries()) {
      const { error } = await staff.supabase.from("services").update({ sort_order: i + 1 }).eq("id", id);
      if (error) return { ok: false, message: friendlyDbError(error) };
    }
    revalidateSite();
    return { ok: true, message: "Order saved." };
  } catch (e) {
    return { ok: false, message: e instanceof Error && e.name === "Error" ? e.message : "Couldn't save the order." };
  }
}

export async function deleteServiceAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await guard(async () => {
    const staff = await requireSuperAdmin(); // editors can't delete services (RLS agrees)
    const id = z.string().uuid().parse(str(fd, "id"));
    const { error, count } = await staff.supabase.from("services").delete({ count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("That service no longer exists, or you can't delete it.");
    revalidateSite();
    return ok("Service deleted.");
  });
  if (res?.ok) redirect("/admin/services?deleted=1");
  return res;
}
