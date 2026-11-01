import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const staff = await requireStaffPage();
  const [{ data: service }, { data: cats }] = await Promise.all([
    staff.supabase.from("services").select("*").eq("id", id).maybeSingle(),
    staff.supabase.from("service_categories").select("id, name").order("sort_order"),
  ]);
  if (!service) notFound();
  return (
    <>
      {sp.created && <FlashToast message="Service created." />}
      <PageHeader back={{ href: "/admin/services", label: "Services" }} eyebrow="Service" title={service.title} />
      <ServiceForm service={service} categories={cats ?? []} canDelete={staff.role === "super_admin"} />
    </>
  );
}
