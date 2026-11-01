import type { Metadata } from "next";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Project categories" };

export default async function ProjectCategoriesPage() {
  const staff = await requireStaffPage();
  const [{ data: cats }, { data: projects }] = await Promise.all([
    staff.supabase.from("project_categories").select("id, name, slug, description, sort_order").order("sort_order").order("name"),
    staff.supabase.from("projects").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  (projects ?? []).forEach((p) => p.category_id && counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1));
  return (
    <>
      <PageHeader back={{ href: "/admin/projects", label: "Projects" }} eyebrow="Projects" title="Categories" description="Used for the filter on the Work page." />
      <CategoryManager table="project_categories" itemLabel="project" categories={(cats ?? []).map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))} />
    </>
  );
}
