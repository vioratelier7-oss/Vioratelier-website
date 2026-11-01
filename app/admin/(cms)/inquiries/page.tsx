import type { Metadata } from "next";
import Link from "next/link";
import { Download, Inbox } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { EmptyState, PageHeader, relativeTime } from "@/components/admin/ui";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { FlashToast } from "@/components/admin/forms";
import { inquiryQuery } from "@/lib/admin/inquiry-query";
import { INQUIRY_STATUSES } from "@/lib/utils";

export const metadata: Metadata = { title: "Inquiries" };

type Row = { id: string; full_name: string; email: string; business_name: string | null; service: string; budget: string | null; status: string; created_at: string };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const staff = await requireStaffPage();
  const { data, error } = await inquiryQuery(staff, "id, full_name, email, business_name, service, budget, status, created_at", sp).limit(500);
  const rows = (data ?? []) as unknown as Row[];
  const exportQs = new URLSearchParams(Object.entries({ q: sp.q ?? "", status: sp.status ?? "" }).filter(([, v]) => v)).toString();
  return (
    <>
      {sp.deleted && <FlashToast message="Inquiry deleted." />}
      <PageHeader eyebrow="Studio" title="Inquiries" description="Project requests from the website's contact form, newest first."
        actions={<a href={`/admin/inquiries/export${exportQs ? `?${exportQs}` : ""}`} className="adm-btn" data-testid="export-csv"><Download size={15} /> Export CSV</a>} />
      <ListToolbar q={sp.q} status={sp.status} placeholder="Search name, email or business" statuses={INQUIRY_STATUSES.map((s) => ({ value: s.value, label: s.label }))} />
      {error ? <p className="adm-inline-msg adm-inline-err">Couldn&apos;t load inquiries. Please refresh.</p> : rows.length === 0 ? (
        <EmptyState icon={<Inbox size={20} strokeWidth={1.5} />} title={sp.q || sp.status ? "No inquiries match" : "No inquiries yet"}
          body={sp.q || sp.status ? "Try a different search or status." : "When a visitor sends the project form on the website, it appears here instantly."} />
      ) : (
        <div className="adm-card overflow-hidden">
          <table className="adm-table">
            <thead><tr><th>From</th><th>Service</th><th>Budget</th><th>Status</th><th>Received</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={r.status === "new" ? "adm-row-new" : ""}>
                  <td className="adm-td-main">
                    <Link href={`/admin/inquiries/${r.id}`} className="block min-w-0">
                      <span className={`block truncate text-[#1B2438] hover:underline ${r.status === "new" ? "font-bold" : "font-semibold"}`}>{r.full_name}</span>
                      <span className="block truncate text-[12.5px] adm-muted">{r.business_name ? `${r.business_name} · ` : ""}{r.email}</span>
                    </Link>
                  </td>
                  <td data-label="Service" className="text-[13px]">{r.service}</td>
                  <td data-label="Budget" className="text-[13px]">{r.budget ?? <span className="adm-muted">—</span>}</td>
                  <td data-label="Status">{r.status === "new" ? <span className="adm-badge adm-badge-new">New</span> : <span className="adm-badge">{INQUIRY_STATUSES.find((s) => s.value === r.status)?.label}</span>}</td>
                  <td data-label="Received" className="whitespace-nowrap text-[12.5px] adm-muted">{relativeTime(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
