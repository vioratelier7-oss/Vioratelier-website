import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Plus, Tags } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { Badge, EmptyState, LinkButton, PageHeader, relativeTime, StatusBadge } from "@/components/admin/ui";
import { ListToolbar, ilikeTerm } from "@/components/admin/ListToolbar";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const staff = await requireStaffPage();
  let query = staff.supabase.from("projects")
    .select("id, title, slug, client_name, status, is_featured, is_sample, cover_image_url, updated_at, sort_order, project_categories(name)")
    .order("sort_order", { ascending: true }).order("updated_at", { ascending: false });
  const term = ilikeTerm(sp.q);
  if (term) query = query.or(`title.ilike.%${term}%,client_name.ilike.%${term}%,slug.ilike.%${term}%`);
  if (sp.status === "draft" || sp.status === "published") query = query.eq("status", sp.status);
  const { data: rows, error } = await query;

  return (
    <>
      {sp.deleted && <FlashToast message="Project deleted." />}
      <PageHeader eyebrow="Content" title="Projects" description="Your portfolio and case studies. Published projects appear on the website's Work page immediately."
        actions={<><LinkButton href="/admin/projects/categories"><Tags size={15} /> Categories</LinkButton><LinkButton href="/admin/projects/new" variant="primary"><Plus size={16} /> New project</LinkButton></>} />
      <ListToolbar q={sp.q} status={sp.status} placeholder="Search title or client" statuses={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
      {error ? <p className="adm-inline-msg adm-inline-err">Couldn&apos;t load projects. Please refresh.</p> : !rows?.length ? (
        <EmptyState icon={<FolderKanban size={20} strokeWidth={1.5} />} title={term || sp.status ? "No projects match" : "No projects yet"}
          body={term || sp.status ? "Try a different search or filter." : "Add your first case study. Save it as a draft until it's ready."}
          action={!term && !sp.status ? <LinkButton href="/admin/projects/new" variant="primary"><Plus size={16} /> New project</LinkButton> : undefined} />
      ) : (
        <div className="adm-card overflow-hidden">
          <table className="adm-table">
            <thead><tr><th>Project</th><th>Category</th><th>Status</th><th>Updated</th><th className="w-0" /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="adm-td-main">
                    <Link href={`/admin/projects/${r.id}`} className="flex items-center gap-3.5">
                      <span className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-[#F4F1EA]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {r.cover_image_url && <img src={r.cover_image_url} alt="" className="h-full w-full object-cover" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-[#1B2438] hover:underline">{r.title}</span>
                        <span className="block truncate text-[12.5px] adm-muted">{r.client_name || "No client set"}</span>
                      </span>
                    </Link>
                  </td>
                  <td data-label="Category" className="text-[13px]">{(r.project_categories as { name: string } | null)?.name ?? <span className="adm-muted">—</span>}</td>
                  <td data-label="Status">
                    <div className="inline-flex flex-wrap gap-1.5">
                      <StatusBadge status={r.status} />
                      {r.is_featured && <Badge tone="featured">Featured</Badge>}
                      {r.is_sample && <Badge tone="sample">Sample</Badge>}
                    </div>
                  </td>
                  <td data-label="Updated" className="whitespace-nowrap text-[12.5px] adm-muted">{relativeTime(r.updated_at)}</td>
                  <td className="adm-td-actions text-right"><LinkButton href={`/admin/projects/${r.id}`} size="sm">Edit</LinkButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
