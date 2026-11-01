"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { bool, fail, friendlyDbError, guard, ok, str, type ActionState } from "@/lib/admin/action";
import { imageUrl, optText, sortOrder, statusSchema } from "@/lib/admin/schemas";
import { revalidateSite } from "@/lib/admin/revalidate";

const schema = z.object({
  client_name: z.string().trim().min(1, "Add the client's name.").max(120),
  business_name: optText(160, "Business name"),
  designation: optText(120, "Designation"),
  body: z.string().trim().min(5, "The testimonial is too short.").max(2000, "Keep it under 2,000 characters."),
  rating: z.string().trim().refine((v) => v === "" || /^[1-5]$/.test(v), "Rating must be 1–5.").transform((v) => (v === "" ? null : Number(v))),
  avatar_url: imageUrl,
  is_approved: z.boolean(),
  status: statusSchema,
  sort_order: sortOrder,
});

export async function saveTestimonialAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  let createdId: string | null = null;
  const res = await guard(async () => {
    const staff = await requireStaff();
    const id = str(fd, "id") || null;
    const intent = str(fd, "_intent");
    const v = schema.parse({
      client_name: str(fd, "client_name"), business_name: str(fd, "business_name"), designation: str(fd, "designation"), body: str(fd, "body"),
      rating: str(fd, "rating"), avatar_url: str(fd, "avatar_url"), is_approved: bool(fd, "is_approved"),
      status: intent === "publish" ? "published" : intent === "unpublish" ? "draft" : str(fd, "status") || "draft", sort_order: str(fd, "sort_order"),
    });
    const { data, error } = id
      ? await staff.supabase.from("testimonials").update(v).eq("id", id).select("id").single()
      : await staff.supabase.from("testimonials").insert(v).select("id").single();
    if (error) return fail(friendlyDbError(error));
    if (!id) createdId = data.id;
    revalidateSite();
    const live = v.status === "published" && v.is_approved;
    const msg = live ? "Saved. It's showing on the website." : v.status === "published" ? "Saved, but it stays hidden until you mark it approved." : "Saved as a draft.";
    return ok(msg, { status: v.status });
  });
  if (createdId && res?.ok) redirect(`/admin/testimonials/${createdId}?created=1`);
  return res;
}

export async function deleteTestimonialAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await guard(async () => {
    const staff = await requireStaff();
    const id = z.string().uuid().parse(str(fd, "id"));
    const { error, count } = await staff.supabase.from("testimonials").delete({ count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("That testimonial no longer exists.");
    revalidateSite();
    return ok("Testimonial deleted.");
  });
  if (res?.ok) redirect("/admin/testimonials?deleted=1");
  return res;
}
