"use server";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { fail, friendlyDbError, guard, ok, str, type ActionState } from "@/lib/admin/action";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, MEDIA_BUCKET, MEDIA_PATH_RE, type MediaRow } from "@/lib/admin/media-shared";
import { revalidatePath } from "next/cache";

const recordSchema = z.object({
  path: z.string().regex(MEDIA_PATH_RE, "Unexpected file path."),
  fileName: z.string().min(1).max(255),
  mime: z.enum(ALLOWED_MIME),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "Files must be 10 MB or smaller."),
  width: z.number().int().positive().max(20000).nullable(),
  height: z.number().int().positive().max(20000).nullable(),
  alt: z.string().max(300, "Alt text can be up to 300 characters.").optional(),
});

const COLS = "id, path, public_url, file_name, mime_type, size_bytes, width, height, alt_text, created_at";

/** Called by the browser right after a direct-to-Storage upload. */
export async function recordMediaAction(input: z.input<typeof recordSchema>): Promise<{ ok: boolean; message: string; row?: MediaRow }> {
  try {
    const staff = await requireStaff();
    const v = recordSchema.parse(input);
    // Confirm the object really exists in the bucket before recording it.
    const dir = v.path.slice(0, v.path.lastIndexOf("/"));
    const name = v.path.slice(v.path.lastIndexOf("/") + 1);
    const { data: listed, error: listErr } = await staff.supabase.storage.from(MEDIA_BUCKET).list(dir, { search: name, limit: 5 });
    if (listErr || !listed?.some((o) => o.name === name)) return { ok: false, message: "The upload didn't reach storage. Please try again." };
    const { data: pub } = staff.supabase.storage.from(MEDIA_BUCKET).getPublicUrl(v.path);
    const { data, error } = await staff.supabase.from("media_assets").insert({
      bucket: MEDIA_BUCKET, path: v.path, public_url: pub.publicUrl, file_name: v.fileName, mime_type: v.mime,
      size_bytes: v.size, width: v.width, height: v.height, alt_text: v.alt || null, uploaded_by: staff.userId,
    }).select(COLS).single();
    if (error) return { ok: false, message: friendlyDbError(error) };
    revalidatePath("/admin/media");
    return { ok: true, message: "Uploaded.", row: data as MediaRow };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, message: e.issues[0]?.message ?? "Invalid upload." };
    if (e instanceof Error && e.name !== "Error") return { ok: false, message: e.message };
    return { ok: false, message: e instanceof Error ? e.message : "Upload couldn't be recorded." };
  }
}

/** For the picker: newest first, optional search on file name / alt. */
export async function listMediaAction(q?: string, offset = 0): Promise<{ ok: boolean; rows: MediaRow[]; total: number; message?: string }> {
  try {
    const staff = await requireStaff();
    let query = staff.supabase.from("media_assets").select(COLS, { count: "exact" }).order("created_at", { ascending: false }).range(offset, offset + 59);
    const term = (q ?? "").trim().replace(/[%,()]/g, " ").slice(0, 80);
    if (term) query = query.or(`file_name.ilike.%${term}%,alt_text.ilike.%${term}%`);
    const { data, error, count } = await query;
    if (error) return { ok: false, rows: [], total: 0, message: friendlyDbError(error) };
    return { ok: true, rows: (data ?? []) as MediaRow[], total: count ?? 0 };
  } catch (e) {
    return { ok: false, rows: [], total: 0, message: e instanceof Error ? e.message : "Couldn't load media." };
  }
}

export async function updateMediaAltAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff();
    const v = z.object({ id: z.string().uuid(), alt: z.string().max(300, "Alt text can be up to 300 characters.") }).parse({ id: str(fd, "id"), alt: str(fd, "alt") });
    const { error } = await staff.supabase.from("media_assets").update({ alt_text: v.alt || null }).eq("id", v.id);
    if (error) return fail(friendlyDbError(error));
    revalidatePath("/admin/media");
    return ok("Alt text saved.");
  });
}

export async function deleteMediaAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireStaff();
    const id = z.string().uuid().parse(str(fd, "id"));
    const { data: row, error: readErr } = await staff.supabase.from("media_assets").select("id, path, public_url").eq("id", id).single();
    if (readErr || !row) return fail(friendlyDbError(readErr));
    // Warn instead of silently breaking pages that still use this file.
    const url = `"${row.public_url.replace(/"/g, "")}"`;
    const uses = await Promise.all([
      staff.supabase.from("projects").select("id", { count: "exact", head: true }).or(`cover_image_url.eq.${url},og_image_url.eq.${url}`),
      staff.supabase.from("project_images").select("id", { count: "exact", head: true }).eq("image_url", row.public_url),
      staff.supabase.from("services").select("id", { count: "exact", head: true }).or(`image_url.eq.${url},og_image_url.eq.${url}`),
      staff.supabase.from("blog_posts").select("id", { count: "exact", head: true }).or(`cover_image_url.eq.${url},og_image_url.eq.${url}`),
      staff.supabase.from("testimonials").select("id", { count: "exact", head: true }).eq("avatar_url", row.public_url),
    ]);
    const used = uses.reduce((n, r) => n + (r.count ?? 0), 0);
    if (used > 0 && str(fd, "force") !== "1") {
      return fail(`This image is used in ${used} place${used > 1 ? "s" : ""}. Replace it there first, then delete it.`);
    }
    const { error: rmErr } = await staff.supabase.storage.from(MEDIA_BUCKET).remove([row.path]);
    if (rmErr) return fail("Couldn't remove the file from storage. Please try again.");
    const { error } = await staff.supabase.from("media_assets").delete().eq("id", id);
    if (error) return fail(friendlyDbError(error));
    revalidatePath("/admin/media");
    return ok("Image deleted.");
  });
}
