import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader, SectionTitle } from "@/components/admin/ui";
import { SeoPageEditor } from "@/components/admin/SeoPageEditor";

export const metadata: Metadata = { title: "SEO" };

function Health({ title, desc }: { title: string | null; desc: string | null }) {
  const issues: string[] = [];
  if (!title) issues.push("no SEO title");
  else if (title.length > 60) issues.push("title long");
  if (!desc) issues.push("no description");
  else if (desc.length > 160) issues.push("description long");
  return issues.length === 0
    ? <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#3F6B4F]"><CheckCircle2 size={14} /> Complete</span>
    : <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#8C7443]"><AlertCircle size={14} /> {issues.join(", ")}</span>;
}

export default async function SeoPage() {
  const staff = await requireStaffPage();
  const db = staff.supabase;
  const [{ data: pages }, { data: settings }, { data: projects }, { data: services }, { data: posts }] = await Promise.all([
    db.from("seo_pages").select("*").order("path"),
    db.from("site_settings").select("default_seo_title").limit(1).maybeSingle(),
    db.from("projects").select("id, title, status, seo_title, seo_description").order("title"),
    db.from("services").select("id, title, status, seo_title, seo_description").order("sort_order"),
    db.from("blog_posts").select("id, title, status, seo_title, seo_description").order("updated_at", { ascending: false }),
  ]);
  const content = [
    ...(services ?? []).map((r) => ({ ...r, kind: "Service", href: `/admin/services/${r.id}` })),
    ...(projects ?? []).map((r) => ({ ...r, kind: "Project", href: `/admin/projects/${r.id}` })),
    ...(posts ?? []).map((r) => ({ ...r, kind: "Article", href: `/admin/blog/${r.id}` })),
  ];
  return (
    <>
      <PageHeader eyebrow="Studio" title="SEO" description="How each page appears in Google and when shared. Empty fields fall back to sensible defaults from Settings." />
      <SectionTitle title="Site pages" description="Fixed pages like Home, Work and Contact." />
      <ul className="grid gap-3">
        {(pages ?? []).map((p) => <SeoPageEditor key={p.id} row={p} defaultTitle={settings?.default_seo_title ?? "VIOR ATELIER · Crafting Digital Experiences"} />)}
      </ul>
      <div className="mt-12">
        <SectionTitle title="Content SEO" description="Services, projects and articles each carry their own SEO fields in their editor." />
        <div className="adm-card overflow-hidden">
          <table className="adm-table">
            <thead><tr><th>Page</th><th>Type</th><th>SEO status</th><th className="w-0" /></tr></thead>
            <tbody>
              {content.map((r) => (
                <tr key={r.kind + r.id}>
                  <td className="adm-td-main"><Link href={r.href} className="font-semibold text-[#1B2438] hover:underline">{r.title}</Link>{r.status === "draft" && <span className="ml-2 text-[11px] adm-muted">(draft)</span>}</td>
                  <td data-label="Type" className="text-[13px]">{r.kind}</td>
                  <td data-label="SEO"><Health title={r.seo_title} desc={r.seo_description} /></td>
                  <td className="adm-td-actions text-right"><Link href={r.href} className="adm-btn adm-btn-sm">Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
