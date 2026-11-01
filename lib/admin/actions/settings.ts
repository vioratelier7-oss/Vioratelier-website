"use server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { fail, friendlyDbError, guard, json, lines, ok, str, type ActionState } from "@/lib/admin/action";
import { imageUrl, optText, optUrl } from "@/lib/admin/schemas";
import { revalidateSite } from "@/lib/admin/revalidate";

const schema = z.object({
  brand_name: z.string().trim().min(1, "Add the brand name.").max(80),
  tagline: z.string().trim().min(1, "Add a tagline.").max(160),
  logo_url: imageUrl,
  intro: optText(1000, "Intro"),
  footer_text: optText(600, "Footer text"),
  contact_phone: optText(32, "Phone"),
  whatsapp_number: z.string().trim().transform((v) => v.replace(/[\s+()-]/g, "")).refine((v) => v === "" || /^[0-9]{8,15}$/.test(v), "Digits only, with the country code, e.g. 919412406016.").transform((v) => (v === "" ? null : v)),
  whatsapp_message: optText(300, "WhatsApp message"),
  contact_email: z.string().trim().refine((v) => v === "" || z.string().email().safeParse(v).success, "Enter a valid email address.").transform((v) => (v === "" ? null : v.toLowerCase())),
  website_url: optUrl,
  social_links: z.array(z.object({
    label: z.string().trim().min(1, "Each social link needs a label.").max(40),
    url: z.string().trim().regex(/^https:\/\/\S+$/i, "Social links must start with https://").max(500),
  })).max(12),
  budget_options: z.array(z.string().max(120)).max(20),
  timeline_options: z.array(z.string().max(120)).max(20),
  default_seo_title: optText(120, "Default SEO title"),
  default_seo_description: optText(320, "Default SEO description"),
  default_og_image_url: imageUrl,
});

export async function saveSettingsAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireSuperAdmin(); // editors cannot change settings (RLS agrees)
    const id = z.string().uuid().parse(str(fd, "id"));
    const v = schema.parse({
      brand_name: str(fd, "brand_name"), tagline: str(fd, "tagline"), logo_url: str(fd, "logo_url"), intro: str(fd, "intro"), footer_text: str(fd, "footer_text"),
      contact_phone: str(fd, "contact_phone"), whatsapp_number: str(fd, "whatsapp_number"), whatsapp_message: str(fd, "whatsapp_message"),
      contact_email: str(fd, "contact_email"), website_url: str(fd, "website_url"),
      social_links: json<{ label: string; url: string }[]>(fd, "social_links", []).filter((s) => s.label?.trim() || s.url?.trim()),
      budget_options: lines(fd, "budget_options"), timeline_options: lines(fd, "timeline_options"),
      default_seo_title: str(fd, "default_seo_title"), default_seo_description: str(fd, "default_seo_description"), default_og_image_url: str(fd, "default_og_image_url"),
    });
    const { error, count } = await staff.supabase.from("site_settings").update({ ...v, updated_by: staff.userId }, { count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("Settings couldn't be saved. Only a Super Admin can change them.");
    revalidateSite();
    return ok("Settings saved. The website is updated.");
  });
}
