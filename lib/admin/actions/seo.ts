"use server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { bool, fail, friendlyDbError, guard, ok, str, type ActionState } from "@/lib/admin/action";
import { imageUrl, optText, optUrl } from "@/lib/admin/schemas";
import { revalidateSite } from "@/lib/admin/revalidate";

const schema = z.object({
  id: z.string().uuid(),
  meta_title: optText(120, "Meta title"),
  meta_description: optText(320, "Meta description"),
  canonical_url: optUrl,
  og_title: optText(120, "OG title"),
  og_description: optText(320, "OG description"),
  og_image_url: imageUrl,
  robots_index: z.boolean(),
  robots_follow: z.boolean(),
});

export async function saveSeoPageAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff(); // editors may edit page SEO (RLS allows update for staff)
    const v = schema.parse({
      id: str(fd, "id"), meta_title: str(fd, "meta_title"), meta_description: str(fd, "meta_description"), canonical_url: str(fd, "canonical_url"),
      og_title: str(fd, "og_title"), og_description: str(fd, "og_description"), og_image_url: str(fd, "og_image_url"),
      robots_index: bool(fd, "robots_index"), robots_follow: bool(fd, "robots_follow"),
    });
    const { id, ...rest } = v;
    const { error, count } = await staff.supabase.from("seo_pages").update(rest, { count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("That page no longer exists.");
    revalidateSite();
    return ok("SEO saved.");
  });
}
