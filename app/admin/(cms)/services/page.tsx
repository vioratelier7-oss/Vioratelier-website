import type { Metadata } from "next";
import { Layers, Plus } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { EmptyState, LinkButton, PageHeader } from "@/components/admin/ui";
import { ServiceOrderList } from "@/components/admin/ServiceOrderList";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const staff = await requireStaffPage();
  const { data } = await staff.supabase.from("services").select("id, title, slug, summary, status, image_url, sort_order").order("sort_order").order("title");
  return (
    <>
      {sp.deleted && <FlashToast message="Service deleted." />}
      <PageHeader eyebrow="Content" title="Services" description="Drag rows or use the arrows to set the order they appear on the website." actions={<LinkButton href="/admin/services/new" variant="primary"><Plus size={16} /> New service</LinkButton>} />
      {!data?.length ? <EmptyState icon={<Layers size={20} strokeWidth={1.5} />} title="No services yet" body="Add the services the studio offers." /> : <ServiceOrderList rows={data} />}
    </>
  );
}
