import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const staff = await requireStaffPage();
  const { data: t } = await staff.supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();
  return (
    <>
      {sp.created && <FlashToast message="Testimonial created." />}
      <PageHeader back={{ href: "/admin/testimonials", label: "Testimonials" }} eyebrow="Testimonial" title={t.client_name} />
      <TestimonialForm t={t} />
    </>
  );
}
