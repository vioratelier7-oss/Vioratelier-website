import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, FilePen, Inbox, Sparkles, PenLine, Quote, Plus, Activity } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { displayName } from "@/lib/admin/session";
import { Card, LinkButton, relativeTime, SectionTitle } from "@/components/admin/ui";
import { FlashToast } from "@/components/admin/forms";
import { INQUIRY_STATUSES } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const ENTITY_LABEL: Record<string, string> = {
  projects: "project", project_categories: "project category", services: "service", inquiries: "inquiry", testimonials: "testimonial",
  blog_posts: "article", blog_categories: "blog category", media_assets: "media file", site_settings: "site settings", seo_pages: "page SEO", user_roles: "user role",
};
const ENTITY_HREF: Record<string, (id: string) => string> = {
  projects: (id) => `/admin/projects/${id}`, services: (id) => `/admin/services/${id}`, inquiries: (id) => `/admin/inquiries/${id}`,
  testimonials: (id) => `/admin/testimonials/${id}`, blog_posts: (id) => `/admin/blog/${id}`,
};

function verb(action: string) {
  if (action === "insert") return "created";
  if (action === "update") return "updated";
  if (action === "delete") return "deleted";
  if (action.startsWith("status:")) {
    const s = action.slice(7);
    const label = INQUIRY_STATUSES.find((x) => x.value === s)?.label ?? s;
    return s === "published" ? "published" : s === "draft" ? "moved to draft" : `marked “${label}” on`;
  }
  return action;
}

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const staff = await requireStaffPage();
  const db = staff.supabase;
  const head = { count: "exact" as const, head: true };

  const [pub, draft, inqAll, inqNew, posts, testi, recentInq, logs] = await Promise.all([
    db.from("projects").select("id", head).eq("status", "published"),
    db.from("projects").select("id", head).eq("status", "draft"),
    db.from("inquiries").select("id", head),
    db.from("inquiries").select("id", head).eq("status", "new"),
    db.from("blog_posts").select("id", head).eq("status", "published").lte("published_at", new Date().toISOString()),
    db.from("testimonials").select("id", head),
    db.from("inquiries").select("id, full_name, business_name, service, status, created_at").order("created_at", { ascending: false }).limit(5),
    db.from("activity_logs").select("id, actor_id, action, entity_type, entity_id, summary, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  const actorIds = [...new Set((logs.data ?? []).map((l) => l.actor_id).filter(Boolean))] as string[];
  const { data: actors } = actorIds.length
    ? await db.from("profiles").select("id, full_name, email").in("id", actorIds)
    : { data: [] as { id: string; full_name: string | null; email: string }[] };
  const actorName = new Map((actors ?? []).map((a) => [a.id, displayName(a.full_name, a.email)]));

  const stats = [
    { label: "Published projects", value: pub.count ?? 0, href: "/admin/projects?status=published", icon: FolderKanban },
    { label: "Draft projects", value: draft.count ?? 0, href: "/admin/projects?status=draft", icon: FilePen },
    { label: "Total inquiries", value: inqAll.count ?? 0, href: "/admin/inquiries", icon: Inbox },
    { label: "New inquiries", value: inqNew.count ?? 0, href: "/admin/inquiries?status=new", icon: Sparkles, accent: true },
    { label: "Published articles", value: posts.count ?? 0, href: "/admin/blog", icon: PenLine },
    { label: "Testimonials", value: testi.count ?? 0, href: "/admin/testimonials", icon: Quote },
  ];
  const name = displayName(staff.fullName, staff.email).split(" ")[0];
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(new Date());

  return (
    <>
      {sp.password === "updated" && <FlashToast message="Password updated. Welcome in." />}
      {sp.error === "forbidden" && <FlashToast ok={false} message="That area is for Super Admins only." />}
      <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="adm-eyebrow mb-3">{today}</p>
          <h1 className="adm-title">{greeting()}, {name}.</h1>
          <p className="mt-3 text-[14px] adm-muted">Here&apos;s what&apos;s happening across the studio today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/admin/blog/new"><PenLine size={15} /> New article</LinkButton>
          <LinkButton href="/admin/projects/new" variant="primary"><Plus size={16} /> New project</LinkButton>
        </div>
      </div>

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group adm-card relative flex min-h-[132px] flex-col overflow-hidden p-4 transition hover:border-[#C9B78F] md:min-h-[168px] md:p-6" data-testid={`stat-${s.label}`}>
            <div className="flex items-start justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A786F] md:text-[11.5px]">{s.label}</p>
              <s.icon size={16} strokeWidth={1.6} className={s.accent && s.value > 0 ? "text-[#A8946A]" : "text-[#C3BDB1]"} />
            </div>
            <p className="adm-stat-num mt-auto pt-4">{s.value}</p>
            <div className="absolute bottom-6 right-6 flex items-center gap-1 text-[12px] font-medium text-[#A8946A] opacity-0 transition group-hover:opacity-100 max-md:hidden">View <ArrowUpRight size={13} /></div>
            {s.accent && s.value > 0 && <span className="absolute left-0 top-0 h-full w-[3px] bg-[#C9B78F]" />}
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-6 md:mt-8 xl:grid-cols-[1.25fr_1fr]">
        <Card>
          <SectionTitle title="Recent inquiries" description="The latest five project requests." action={<LinkButton href="/admin/inquiries" size="sm" variant="ghost">View all <ArrowUpRight size={13} /></LinkButton>} />
          {(recentInq.data ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#D6D0C4] px-6 py-10 text-center">
              <Inbox size={20} strokeWidth={1.5} className="mx-auto text-[#A8946A]" />
              <p className="mt-3 font-serif text-[1.25rem] text-[#1B2438]">No inquiries yet</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] adm-muted">When someone sends the contact form on the website, it lands here instantly.</p>
            </div>
          ) : (
            <ul className="-mx-2">
              {recentInq.data!.map((q) => (
                <li key={q.id}>
                  <Link href={`/admin/inquiries/${q.id}`} className="flex items-center gap-4 rounded-lg px-2 py-3 transition hover:bg-[#FAF8F3]">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F4F1EA] font-serif text-[17px] text-[#1B2438]">{q.full_name.slice(0, 1).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-[#1B2438]">{q.full_name}{q.business_name && <span className="font-normal adm-muted"> · {q.business_name}</span>}</p>
                      <p className="truncate text-[12.5px] adm-muted">{q.service}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {q.status === "new" ? <span className="adm-badge adm-badge-new">New</span> : <span className="adm-badge">{INQUIRY_STATUSES.find((s) => s.value === q.status)?.label}</span>}
                      <span className="text-[11.5px] adm-muted">{relativeTime(q.created_at)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <SectionTitle title="Recent activity" description="Every change made in the CMS." />
          {(logs.data ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#D6D0C4] px-6 py-10 text-center">
              <Activity size={20} strokeWidth={1.5} className="mx-auto text-[#A8946A]" />
              <p className="mt-3 font-serif text-[1.25rem] text-[#1B2438]">A clean slate</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] adm-muted">Edits, publishes and new inquiries will appear here as they happen.</p>
            </div>
          ) : (
            <ol className="relative">
              {logs.data!.map((l, i) => {
                const who = l.actor_id ? actorName.get(l.actor_id) ?? "A team member" : l.entity_type === "inquiries" && l.action === "insert" ? "Website visitor" : "System";
                const href = l.entity_id && l.action !== "delete" ? ENTITY_HREF[l.entity_type]?.(l.entity_id) : undefined;
                const label = l.entity_type === "user_roles"
                  ? `user role (${l.summary === "super_admin" ? "Super Admin" : l.summary === "editor" ? "Editor" : "removed"})`
                  : l.entity_type === "site_settings" ? "site settings"
                  : l.summary ? `“${l.summary}”` : ENTITY_LABEL[l.entity_type] ?? l.entity_type;
                return (
                  <li key={l.id} className="relative flex gap-3.5 pb-4 last:pb-0">
                    {i < logs.data!.length - 1 && <span className="absolute left-[5px] top-4 bottom-0 w-px bg-[#E4DFD5]" />}
                    <span className={`relative mt-[6px] h-[11px] w-[11px] shrink-0 rounded-full border-2 ${i === 0 ? "border-[#C9B78F] bg-[#C9B78F]" : "border-[#D6D0C4] bg-white"}`} />
                    <div className="min-w-0 text-[13px] leading-snug">
                      <p className="text-[#343631]">
                        <span className="font-semibold text-[#1B2438]">{who}</span> {verb(l.action)} {ENTITY_LABEL[l.entity_type] && l.summary && !["user_roles", "site_settings"].includes(l.entity_type) ? `${ENTITY_LABEL[l.entity_type]} ` : ""}
                        {href ? <Link href={href} className="adm-link">{label}</Link> : <span>{label}</span>}
                      </p>
                      <p className="mt-0.5 text-[11.5px] adm-muted">{relativeTime(l.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
