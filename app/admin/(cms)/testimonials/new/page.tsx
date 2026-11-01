import type { Metadata } from "next";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const metadata: Metadata = { title: "New testimonial" };

export default async function NewTestimonialPage() {
  await requireStaffPage();
  return (<><PageHeader back={{ href: "/admin/testimonials", label: "Testimonials" }} title="New testimonial" /><TestimonialForm /></>);
}
