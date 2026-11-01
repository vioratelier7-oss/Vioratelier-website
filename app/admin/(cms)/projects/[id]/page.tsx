import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Edit project" };

export default async function EditProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const staff = await requireStaffPage();
  const [{ data: project }, { data: images }, { data: cats }] = await Promise.all([
    staff.supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    staff.supabase.from("project_images").select("id, image_url, storage_path, alt_text, caption").eq("project_id", id).order("sort_order"),
    staff.supabase.from("project_categories").select("id, name").order("sort_order").order("name"),
  ]);
  if (!project) notFound();
  return (
    <>
      {sp.created && <FlashToast message={project.status === "published" ? "Project created and published." : "Project created as a draft."} />}
      <PageHeader back={{ href: "/admin/projects", label: "Projects" }} eyebrow={project.client_name ?? "Project"} title={project.title} />
      <ProjectForm project={project} gallery={images ?? []} categories={cats ?? []} />
    </>
  );
}
