import "server-only";
import { cache } from "react";
import { createSessionClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/auth";

/** Distinguishes "signed out" from "signed in without a CMS role" for the no-access screen. */
export const getAdminSession = cache(async () => {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, staff: null } as const;
  const staff = await getStaff();
  return { user, staff } as const;
});

export function displayName(fullName: string | null | undefined, email: string) {
  return fullName?.trim() || email.split("@")[0];
}

export const ROLE_LABEL: Record<string, string> = { super_admin: "Super Admin", editor: "Editor" };

/** Only same-site /admin paths are allowed as post-login destinations. */
export function safeNext(next: string | null | undefined, fallback = "/admin") {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.includes("://")) return fallback;
  if (next.startsWith("/admin/login")) return fallback;
  return next;
}
