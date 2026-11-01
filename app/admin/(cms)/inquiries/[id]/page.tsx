import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone, MessageCircle, Trash2 } from "lucide-react";
import { requireStaffPage } from "@/lib/auth";
import { PageHeader, dateTime, relativeTime } from "@/components/admin/ui";
import { StatusForm, NoteForm, DeleteNote } from "@/components/admin/InquiryControls";
import { ConfirmButton } from "@/components/admin/forms";
import { deleteInquiryAction } from "@/lib/admin/actions/inquiries";
import { displayName } from "@/lib/admin/session";
import { telHref, whatsappHref } from "@/lib/utils";

export const metadata: Metadata = { title: "Inquiry" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A786F]">{label}</dt>
      <dd className="text-[14px] text-[#343631] break-words">{children || <span className="adm-muted">—</span>}</dd>
    </div>
  );
}

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const staff = await requireStaffPage();
  const [{ data: q }, { data: notes }] = await Promise.all([
    staff.supabase.from("inquiries").select("*").eq("id", id).maybeSingle(),
    staff.supabase.from("inquiry_notes").select("id, body, author_id, created_at").eq("inquiry_id", id).order("created_at", { ascending: false }),
  ]);
  if (!q) notFound();
  const authorIds = [...new Set((notes ?? []).map((n) => n.author_id).filter(Boolean))] as string[];
  const { data: authors } = authorIds.length ? await staff.supabase.from("profiles").select("id, full_name, email").in("id", authorIds) : { data: [] as { id: string; full_name: string | null; email: string }[] };
  const nameOf = new Map((authors ?? []).map((a) => [a.id, displayName(a.full_name, a.email)]));
  const digits = (q.phone ?? "").replace(/\D/g, "").replace(/^0+/, "");
  // A bare 10-digit number is assumed to be Indian (+91); anything longer already carries its country code.
  const wa = digits.length >= 10 ? whatsappHref(digits.length === 10 ? "91" + digits : digits, `Hello ${q.full_name.split(" ")[0]}, thank you for contacting VIOR ATELIER.`) : undefined;

  return (
    <>
      <PageHeader back={{ href: "/admin/inquiries", label: "Inquiries" }} eyebrow={`Received ${dateTime(q.created_at)}`} title={q.full_name}
        description={q.business_name ?? undefined} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-6">
          <div className="adm-card adm-card-pad">
            <h2 className="adm-h2 mb-2">Project request</h2>
            <dl className="adm-divide">
              <Row label="Service">{q.service}</Row>
              <Row label="Budget">{q.budget}</Row>
              <Row label="Timeline">{q.timeline}</Row>
              <Row label="Description"><p className="whitespace-pre-wrap leading-relaxed">{q.description}</p></Row>
            </dl>
          </div>
          <div className="adm-card adm-card-pad">
            <h2 className="adm-h2">Internal notes</h2>
            <p className="mt-1 mb-5 text-[13px] adm-muted">Only visible to the studio team.</p>
            <NoteForm inquiryId={q.id} />
            <ul className="mt-6 grid gap-3" data-testid="notes">
              {(notes ?? []).length === 0 && <li className="text-[13px] adm-muted">No notes yet.</li>}
              {(notes ?? []).map((n) => (
                <li key={n.id} className="rounded-lg border border-[#E4DFD5] bg-[#FCFBF8] p-4">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[12px]"><span className="font-semibold text-[#1B2438]">{n.author_id ? nameOf.get(n.author_id) ?? "Former team member" : "Former team member"}</span> <span className="adm-muted">· {relativeTime(n.created_at)}</span></p>
                    {(n.author_id === staff.userId || staff.role === "super_admin") && <DeleteNote id={n.id} />}
                  </div>
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{n.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <aside className="grid content-start gap-6 lg:sticky lg:top-8">
          <div className="adm-card adm-card-pad">
            <p className="adm-label">Status</p>
            <StatusForm id={q.id} status={q.status} />
          </div>
          <div className="adm-card adm-card-pad">
            <p className="adm-label mb-3">Contact</p>
            <dl className="grid gap-3 text-[14px]">
              <div><dt className="text-[11px] adm-muted">Email</dt><dd className="break-all">{q.email}</dd></div>
              <div><dt className="text-[11px] adm-muted">Phone</dt><dd>{q.phone || <span className="adm-muted">Not given</span>}</dd></div>
            </dl>
            <div className="mt-5 grid gap-2">
              <a href={`mailto:${q.email}?subject=${encodeURIComponent("Your project inquiry · VIOR ATELIER")}`} className="adm-btn adm-btn-primary w-full"><Mail size={15} /> Email</a>
              {q.phone && <a href={telHref(q.phone)} className="adm-btn w-full"><Phone size={15} /> Call</a>}
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="adm-btn w-full"><MessageCircle size={15} /> WhatsApp</a>}
            </div>
          </div>
          <div className="adm-card adm-card-pad text-[12px] adm-muted">
            <p>Source: {q.source}</p>
            <p className="mt-1">Last updated {relativeTime(q.updated_at)}</p>
          </div>
          {staff.role === "super_admin" && (
            <ConfirmButton action={deleteInquiryAction} fields={{ id: q.id }} label="Delete inquiry" icon={<Trash2 size={15} />} className="w-full"
              confirmTitle="Delete this inquiry?" confirmBody="The inquiry and its notes are removed permanently. Consider exporting to CSV first." />
          )}
        </aside>
      </div>
    </>
  );
}
