import type { Metadata } from "next";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  const staff = await requireStaffPage();
  const { data: cats } = await staff.supabase.from("project_categories").select("id, name").order("sort_order").order("name");
  return (
    <>
      <PageHeader back={{ href: "/admin/projects", label: "Projects" }} title="New project" description="Save as a draft while you work. Publishing puts it on the website straight away." />
      <ProjectForm gallery={[]} categories={cats ?? []} />
    </>
  );
}
