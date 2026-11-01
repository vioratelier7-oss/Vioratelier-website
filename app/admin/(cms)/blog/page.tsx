import type { Metadata } from "next";
import Link from "next/link";
import { PenLine, Plus, Tags } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { Badge, EmptyState, LinkButton, PageHeader, StatusBadge, dateTime } from "@/components/admin/ui";
import { ListToolbar, ilikeTerm } from "@/components/admin/ListToolbar";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Insights" };

export default async function BlogListPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const staff = await requireStaffPage();
  let query = staff.supabase.from("blog_posts").select("id, title, slug, status, is_featured, published_at, updated_at, reading_minutes, author_name, cover_image_url, blog_categories(name)").order("updated_at", { ascending: false });
  const term = ilikeTerm(sp.q);
  if (term) query = query.ilike("title", `%${term}%`);
  if (sp.status === "draft" || sp.status === "published") query = query.eq("status", sp.status);
  const { data: rows } = await query;
  const now = Date.now();
  return (
    <>
      {sp.deleted && <FlashToast message="Article deleted." />}
      <PageHeader eyebrow="Content" title="Insights" description="Articles for the website's Insights journal. Drafts stay private; a future publish date schedules the article."
        actions={<><LinkButton href="/admin/blog/categories"><Tags size={15} /> Categories</LinkButton><LinkButton href="/admin/blog/new" variant="primary"><Plus size={16} /> New article</LinkButton></>} />
      <ListToolbar q={sp.q} status={sp.status} placeholder="Search titles" statuses={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
      {!rows?.length ? (
        <EmptyState icon={<PenLine size={20} strokeWidth={1.5} />} title={term || sp.status ? "No articles match" : "No articles yet"} body="Write your first article. Save drafts as you go." action={<LinkButton href="/admin/blog/new" variant="primary"><Plus size={16} /> New article</LinkButton>} />
      ) : (
        <div className="adm-card overflow-hidden">
          <table className="adm-table">
            <thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Publish date</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const scheduled = r.status === "published" && r.published_at && new Date(r.published_at).getTime() > now;
                return (
                  <tr key={r.id}>
                    <td className="adm-td-main">
                      <Link href={`/admin/blog/${r.id}`} className="flex items-center gap-3.5">
                        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-[#F4F1EA]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {r.cover_image_url && <img src={r.cover_image_url} alt="" className="h-full w-full object-cover" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-[#1B2438] hover:underline">{r.title}</span>
                          <span className="block truncate text-[12.5px] adm-muted">{r.author_name ?? "No author"} · {r.reading_minutes} min read</span>
                        </span>
                      </Link>
                    </td>
                    <td data-label="Category" className="text-[13px]">{(r.blog_categories as { name: string } | null)?.name ?? <span className="adm-muted">—</span>}</td>
                    <td data-label="Status"><div className="inline-flex gap-1.5">{scheduled ? <Badge tone="featured">Scheduled</Badge> : <StatusBadge status={r.status} />}{r.is_featured && <Badge tone="featured">Featured</Badge>}</div></td>
                    <td data-label="Date" className="whitespace-nowrap text-[12.5px] adm-muted">{r.published_at ? dateTime(r.published_at) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
