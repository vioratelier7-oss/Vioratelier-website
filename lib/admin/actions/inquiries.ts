"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff, requireSuperAdmin } from "@/lib/auth";
import { fail, friendlyDbError, guard, ok, str, type ActionState } from "@/lib/admin/action";
import { INQUIRY_STATUSES } from "@/lib/utils";

const statusEnum = z.enum(INQUIRY_STATUSES.map((s) => s.value) as [string, ...string[]]);

export async function updateInquiryStatusAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff();
    const id = z.string().uuid().parse(str(fd, "id"));
    const status = statusEnum.parse(str(fd, "status")) as (typeof INQUIRY_STATUSES)[number]["value"];
    const { error, count } = await staff.supabase.from("inquiries").update({ status }, { count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("That inquiry no longer exists.");
    revalidatePath("/admin", "layout");
    return ok(`Status set to ${INQUIRY_STATUSES.find((s) => s.value === status)?.label}.`);
  });
}

export async function addInquiryNoteAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff();
    const v = z.object({
      inquiry_id: z.string().uuid(),
      body: z.string().trim().min(1, "Write a note first.").max(5000, "Notes can be up to 5,000 characters."),
    }).parse({ inquiry_id: str(fd, "inquiry_id"), body: str(fd, "body") });
    const { error } = await staff.supabase.from("inquiry_notes").insert({ ...v, author_id: staff.userId });
    if (error) return fail(friendlyDbError(error));
    revalidatePath(`/admin/inquiries/${v.inquiry_id}`);
    return ok("Note added.");
  });
}

export async function deleteInquiryNoteAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff();
    const id = z.string().uuid().parse(str(fd, "id"));
    const { data: note } = await staff.supabase.from("inquiry_notes").select("id, author_id, inquiry_id").eq("id", id).maybeSingle();
    if (!note) return fail("That note no longer exists.");
    if (note.author_id !== staff.userId && staff.role !== "super_admin") return fail("You can only delete your own notes.");
    const { error, count } = await staff.supabase.from("inquiry_notes").delete({ count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("You can only delete your own notes.");
    revalidatePath(`/admin/inquiries/${note.inquiry_id}`);
    return ok("Note deleted.");
  });
}

export async function deleteInquiryAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  const res = await guard(async () => {
    const staff = await requireSuperAdmin();
    const id = z.string().uuid().parse(str(fd, "id"));
    const { error, count } = await staff.supabase.from("inquiries").delete({ count: "exact" }).eq("id", id);
    if (error) return fail(friendlyDbError(error));
    if (!count) return fail("That inquiry no longer exists, or you can't delete it.");
    revalidatePath("/admin", "layout");
    return ok("Inquiry deleted.");
  });
  if (res?.ok) redirect("/admin/inquiries?deleted=1");
  return res;
}
