import type { Metadata } from "next";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Blog categories" };

export default async function BlogCategoriesPage() {
  const staff = await requireStaffPage();
  const [{ data: cats }, { data: posts }] = await Promise.all([
    staff.supabase.from("blog_categories").select("id, name, slug, description, sort_order").order("sort_order").order("name"),
    staff.supabase.from("blog_posts").select("category_id"),
  ]);
  const counts = new Map<string, number>();
  (posts ?? []).forEach((p) => p.category_id && counts.set(p.category_id, (counts.get(p.category_id) ?? 0) + 1));
  return (
    <>
      <PageHeader back={{ href: "/admin/blog", label: "Insights" }} eyebrow="Insights" title="Categories" />
      <CategoryManager table="blog_categories" itemLabel="article" categories={(cats ?? []).map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }))} />
    </>
  );
}
