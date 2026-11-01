"use client";
import { useState } from "react";
import { Trash2, Star } from "lucide-react";
import { saveTestimonialAction, deleteTestimonialAction } from "@/lib/admin/actions/testimonials";
import { ActionForm, ConfirmButton, Switch, TextArea, TextInput } from "@/components/admin/forms";
import { ImageField } from "@/components/admin/MediaPicker";
import { PublishBox } from "@/components/admin/PublishBox";
import type { Database } from "@/lib/database.types";

type T = Database["public"]["Tables"]["testimonials"]["Row"];

function Rating({ defaultValue }: { defaultValue: number | null }) {
  const [v, setV] = useState<number | null>(defaultValue);
  return (
    <div>
      <p className="adm-label">Rating <span className="font-normal adm-muted">(optional)</span></p>
      <input type="hidden" name="rating" value={v ?? ""} />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setV(v === n ? null : n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={v !== null && n <= v} className="p-1">
            <Star size={22} strokeWidth={1.4} className={v !== null && n <= v ? "fill-[#C9B78F] text-[#C9B78F]" : "text-[#D6D0C4]"} />
          </button>
        ))}
        {v !== null && <button type="button" onClick={() => setV(null)} className="ml-2 text-[12px] adm-muted hover:text-[#1B2438]">Clear</button>}
      </div>
    </div>
  );
}

export function TestimonialForm({ t }: { t?: T }) {
  const [status, setStatus] = useState<"draft" | "published">(t?.status ?? "draft");
  return (
    <>
      <ActionForm action={saveTestimonialAction} onSuccess={(r) => { const st = r.data?.status; if (st === "draft" || st === "published") setStatus(st); }} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {t && <input type="hidden" name="id" value={t.id} />}
        <div className="adm-card adm-card-pad grid content-start gap-5">
          <TextArea label="Testimonial" name="body" defaultValue={t?.body ?? ""} rows={6} maxLength={2000} hint="Use the client's exact words. Only publish testimonials you have permission to share." />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="Client name" name="client_name" defaultValue={t?.client_name ?? ""} maxLength={120} />
            <TextInput label="Designation" name="designation" defaultValue={t?.designation ?? ""} maxLength={120} placeholder="e.g. Founder" />
          </div>
          <TextInput label="Business name" name="business_name" defaultValue={t?.business_name ?? ""} maxLength={160} />
          <Rating defaultValue={t?.rating ?? null} />
        </div>
        <aside className="grid content-start gap-6 lg:sticky lg:top-8">
          <PublishBox status={status} isNew={!t}>
            <div className="rounded-lg border border-[#E4DFD5] bg-[#FCFBF8] p-3">
              <Switch name="is_approved" label="Approved by the client" defaultChecked={t?.is_approved ?? false} />
              <p className="mt-2 text-[12px] leading-relaxed adm-muted">The website shows a testimonial only when it is both approved and published.</p>
            </div>
          </PublishBox>
          <div className="adm-card adm-card-pad grid gap-5">
            <ImageField name="avatar_url" label="Photo (optional)" defaultUrl={t?.avatar_url} compact />
            <TextInput label="Sort order" name="sort_order" type="number" defaultValue={String(t?.sort_order ?? 0)} hint="Lower numbers appear first." />
          </div>
        </aside>
      </ActionForm>
      {t && (
        <div className="mt-10 flex justify-end border-t border-[#E4DFD5] pt-6">
          <ConfirmButton action={deleteTestimonialAction} fields={{ id: t.id }} label="Delete testimonial" icon={<Trash2 size={15} />} confirmTitle="Delete this testimonial?" confirmBody="It's removed from the website permanently." />
        </div>
      )}
    </>
  );
}
