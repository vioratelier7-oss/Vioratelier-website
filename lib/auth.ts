import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export type StaffContext = {
  userId: string;
  email: string;
  fullName: string | null;
  role: AppRole;
  supabase: Awaited<ReturnType<typeof createSessionClient>>;
};

/** Reads the verified user (getUser hits Supabase Auth, not just the cookie) and their role from the database. */
export const getStaff = cache(async (): Promise<StaffContext | null> => {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: roleRow }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);
  if (!roleRow) return null;
  return { userId: user.id, email: user.email ?? "", fullName: profile?.full_name ?? null, role: roleRow.role, supabase };
});

/** For pages: redirect to login when not staff. */
export async function requireStaffPage(): Promise<StaffContext> {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login?error=unauthorised");
  return staff;
}

export async function requireSuperAdminPage(): Promise<StaffContext> {
  const staff = await requireStaffPage();
  if (staff.role !== "super_admin") redirect("/admin?error=forbidden");
  return staff;
}

export class AuthError extends Error {}

/** For server actions: throw instead of redirecting. */
export async function requireStaff(): Promise<StaffContext> {
  const staff = await getStaff();
  if (!staff) throw new AuthError("You are not signed in as a CMS user.");
  return staff;
}

export async function requireSuperAdmin(): Promise<StaffContext> {
  const staff = await requireStaff();
  if (staff.role !== "super_admin") throw new AuthError("Only a Super Admin can do this.");
  return staff;
}
