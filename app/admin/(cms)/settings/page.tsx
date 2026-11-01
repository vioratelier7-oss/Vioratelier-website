import type { Metadata } from "next";
import { requireSuperAdminPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const staff = await requireSuperAdminPage();
  const { data: s } = await staff.supabase.from("site_settings").select("*").limit(1).maybeSingle();
  return (
    <>
      <PageHeader eyebrow="Super Admin" title="Website settings" description="Brand, contact details and defaults used across the whole website." />
      {s ? <SettingsForm s={s} /> : <p className="adm-inline-msg adm-inline-err">The settings row is missing. Run the database migrations.</p>}
    </>
  );
}
