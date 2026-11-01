import type { Metadata } from "next";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const metadata: Metadata = { title: "New service" };

export default async function NewServicePage() {
  const staff = await requireStaffPage();
  const { data: cats } = await staff.supabase.from("service_categories").select("id, name").order("sort_order");
  return (
    <>
      <PageHeader back={{ href: "/admin/services", label: "Services" }} title="New service" />
      <ServiceForm categories={cats ?? []} canDelete={staff.role === "super_admin"} />
    </>
  );
}
