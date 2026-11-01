"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/env";
import { fail, friendlyDbError, guard, ok, str, type ActionState } from "@/lib/admin/action";

const roleEnum = z.enum(["super_admin", "editor"], { errorMap: () => ({ message: "Choose a role." }) });

export async function inviteUserAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireSuperAdmin();
    const v = z.object({
      email: z.string().trim().toLowerCase().email("Enter a valid email address."),
      full_name: z.string().trim().min(1, "Add their name.").max(120),
      role: roleEnum,
    }).parse({ email: str(fd, "email"), full_name: str(fd, "full_name"), role: str(fd, "role") });

    // Service role is used ONLY here, server-side, after the Super Admin check above.
    const admin = createAdminClient();
    let userId: string | null = null;
    let existing = false;
    const { data, error } = await admin.auth.admin.inviteUserByEmail(v.email, {
      data: { full_name: v.full_name },
      redirectTo: `${SITE_URL}/admin/auth/callback?next=/admin/reset-password`,
    });
    if (error) {
      if (!/already|registered|exists/i.test(error.message)) {
        if (/rate/i.test(error.message)) return fail("Too many invitations just now. Please wait a minute.");
        console.error("[invite]", error.message);
        return fail("Couldn't send the invitation. Check the email address and try again.");
      }
      // Already has an auth account: find it and just grant the role.
      const { data: prof } = await admin.from("profiles").select("id").eq("email", v.email).maybeSingle();
      if (!prof) return fail("That email already has an account, but it couldn't be found. Try again.");
      userId = prof.id;
      existing = true;
    } else {
      userId = data.user.id;
    }

    const { data: hasRole } = await staff.supabase.from("user_roles").select("id, role").eq("user_id", userId!).maybeSingle();
    if (hasRole) return fail(`${v.email} already has CMS access as ${hasRole.role === "super_admin" ? "Super Admin" : "Editor"}.`);
    const { error: roleErr } = await staff.supabase.from("user_roles").insert({ user_id: userId!, role: v.role, created_by: staff.userId });
    if (roleErr) return fail(friendlyDbError(roleErr));
    await staff.supabase.from("profiles").update({ full_name: v.full_name }).eq("id", userId!);
    revalidatePath("/admin/users");
    return ok(existing ? `${v.email} already had an account; CMS access granted.` : `Invitation sent to ${v.email}.`);
  });
}

export async function changeRoleAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireSuperAdmin();
    const v = z.object({ user_id: z.string().uuid(), role: roleEnum }).parse({ user_id: str(fd, "user_id"), role: str(fd, "role") });
    const { error, count } = await staff.supabase.from("user_roles").update({ role: v.role }, { count: "exact" }).eq("user_id", v.user_id);
    if (error) return fail(error.code === "P0001" ? "At least one Super Admin must remain. Make someone else a Super Admin first." : friendlyDbError(error));
    if (!count) return fail("That user no longer has CMS access.");
    revalidatePath("/admin", "layout");
    return ok(`Role changed to ${v.role === "super_admin" ? "Super Admin" : "Editor"}.`);
  });
}

export async function removeAccessAction(_p: ActionState, fd: FormData): Promise<ActionState> {
  return guard(async () => {
    const staff = await requireSuperAdmin();
    const userId = z.string().uuid().parse(str(fd, "user_id"));
    if (userId === staff.userId) return fail("You can't remove your own access. Ask another Super Admin.");
    const { error, count } = await staff.supabase.from("user_roles").delete({ count: "exact" }).eq("user_id", userId);
    if (error) return fail(error.code === "P0001" ? "At least one Super Admin must remain. Make someone else a Super Admin first." : friendlyDbError(error));
    if (!count) return fail("That user already has no access.");
    revalidatePath("/admin/users");
    return ok("Access removed. They can no longer open the CMS.");
  });
}
