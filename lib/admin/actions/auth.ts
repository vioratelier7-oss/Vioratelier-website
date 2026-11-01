"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSessionClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/env";
import { fail, ok, type ActionState } from "@/lib/admin/action";
import { safeNext } from "@/lib/admin/session";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (/rate|too many/i.test(error.message)) return fail("Too many attempts. Please wait a minute and try again.");
    return fail("That email and password don't match an account.");
  }
  redirect(safeNext(String(fd.get("next") ?? "")));
}

export async function logoutAction() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login?signed_out=1");
}

const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

export async function forgotPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = forgotSchema.safeParse({ email: fd.get("email") });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${SITE_URL}/admin/auth/callback?next=/admin/reset-password`,
  });
  if (error && /rate|seconds/i.test(error.message)) return fail("Please wait a moment before requesting another link.");
  // Same answer whether or not the account exists, so the form can't be used to probe emails.
  return ok("If that email belongs to a CMS account, a reset link is on its way. Check your inbox.");
}

const resetSchema = z
  .object({
    password: z.string().min(10, "Use at least 10 characters.").max(128, "That's too long."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don't match.", path: ["confirm"] });

export async function resetPasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const parsed = resetSchema.safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Your reset link has expired. Request a new one.");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (/different from the old/i.test(error.message)) return fail("Choose a password you haven't used before.");
    if (/weak|pwned/i.test(error.message)) return fail("That password is too easy to guess. Try a longer one.");
    return fail("Couldn't update your password. Please request a new link.");
  }
  redirect("/admin?password=updated");
}
