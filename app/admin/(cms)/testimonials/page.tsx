import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Quote, Star } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { Badge, EmptyState, LinkButton, PageHeader, StatusBadge } from "@/components/admin/ui";
import { FlashToast } from "@/components/admin/forms";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const staff = await requireStaffPage();
  const { data } = await staff.supabase.from("testimonials").select("id, client_name, business_name, designation, body, rating, is_approved, status, avatar_url").order("sort_order").order("created_at", { ascending: false });
  return (
    <>
      {sp.deleted && <FlashToast message="Testimonial deleted." />}
      <PageHeader eyebrow="Content" title="Testimonials" description="Only genuine words from real clients. A testimonial appears on the website once it is approved and published."
        actions={<LinkButton href="/admin/testimonials/new" variant="primary"><Plus size={16} /> New testimonial</LinkButton>} />
      {!data?.length ? (
        <EmptyState icon={<Quote size={20} strokeWidth={1.5} />} title="No testimonials yet" body="When a client shares kind words, add them here. The website's testimonial section stays hidden until there's at least one." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.map((t) => {
            const live = t.status === "published" && t.is_approved;
            return (
              <li key={t.id}>
                <Link href={`/admin/testimonials/${t.id}`} className="adm-card adm-card-pad flex h-full flex-col transition hover:border-[#C9B78F]">
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={t.status} />
                    {t.is_approved ? <Badge tone="published">Approved</Badge> : <Badge tone="featured">Awaiting approval</Badge>}
                    {live && <span className="ml-auto text-[11px] font-semibold text-[#3F6B4F]">On website</span>}
                  </div>
                  <p className="line-clamp-4 flex-1 font-serif text-[1.15rem] leading-snug text-[#1B2438]">“{t.body}”</p>
                  <div className="mt-4 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {t.avatar_url ? <img src={t.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-[#F4F1EA] font-serif text-[#1B2438]">{t.client_name[0]}</span>}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#1B2438]">{t.client_name}</p>
                      <p className="truncate text-[12px] adm-muted">{[t.designation, t.business_name].filter(Boolean).join(", ")}</p>
                    </div>
                    {t.rating && <span className="flex items-center gap-0.5 text-[12px] text-[#A8946A]"><Star size={13} className="fill-current" />{t.rating}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
