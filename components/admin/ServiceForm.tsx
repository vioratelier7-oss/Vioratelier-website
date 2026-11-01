"use client";
import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { saveServiceAction, deleteServiceAction } from "@/lib/admin/actions/services";
import { ActionForm, ConfirmButton, Select, TextArea, TextInput } from "@/components/admin/forms";
import { TitleSlug, LineList, SeoFields } from "@/components/admin/fields";
import { FaqRepeater } from "@/components/admin/FaqRepeater";
import { ImageField } from "@/components/admin/MediaPicker";
import { PublishBox } from "@/components/admin/PublishBox";
import type { Database } from "@/lib/database.types";

type Service = Database["public"]["Tables"]["services"]["Row"];

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="adm-card adm-card-pad">
      <h2 className="adm-h2">{title}</h2>
      {description && <p className="mt-1 text-[13px] adm-muted">{description}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

export function ServiceForm({ service, categories, canDelete }: { service?: Service; categories: { id: string; name: string }[]; canDelete: boolean }) {
  const s = service;
  const [status, setStatus] = useState<"draft" | "published">(s?.status ?? "draft");
  const faqs = Array.isArray(s?.faqs) ? (s!.faqs as { q?: string; a?: string }[]).map((f) => ({ q: String(f?.q ?? ""), a: String(f?.a ?? "") })) : [];
  return (
    <>
      <ActionForm action={saveServiceAction} onSuccess={(r) => { const st = r.data?.status; if (st === "draft" || st === "published") setStatus(st); }} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {s && <input type="hidden" name="id" value={s.id} />}
        <div className="grid min-w-0 gap-6">
          <Section title="Basics">
            <TitleSlug defaultTitle={s?.title} defaultSlug={s?.slug} basePath="/services" placeholder="e.g. Website Design & Development" />
            <TextInput label="Hero heading" name="hero_heading" defaultValue={s?.hero_heading ?? ""} maxLength={200} hint="The large headline at the top of the service page." />
            <TextArea label="Summary" name="summary" defaultValue={s?.summary ?? ""} rows={2} maxLength={400} hint="Shown on service cards. Up to 400 characters." />
            <TextArea label="Overview" name="overview" defaultValue={s?.overview ?? ""} rows={6} hint="Leave a blank line between paragraphs." />
          </Section>
          <Section title="What's included" description="One item per line. Press Enter to add the next.">
            <LineList name="scope" label="Scope" defaultValue={s?.scope} />
            <LineList name="problems" label="Problems solved" defaultValue={s?.problems} />
            <LineList name="benefits" label="Benefits" defaultValue={s?.benefits} />
            <LineList name="deliverables" label="Deliverables" defaultValue={s?.deliverables} />
          </Section>
          <Section title="FAQs"><FaqRepeater name="faqs" defaultValue={faqs} /></Section>
          <Section title="SEO" description="Leave blank to use the title and summary.">
            <SeoFields defaultTitle={s?.seo_title} defaultDescription={s?.seo_description} defaultOg={s?.og_image_url} fallbackTitle={s?.title} path={`/services/${s?.slug ?? ""}`} />
          </Section>
        </div>
        <aside className="grid content-start gap-6 lg:sticky lg:top-8">
          <PublishBox status={status} isNew={!s}
            extra={s && status === "published" ? <a href={`/services/${s.slug}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-[#A8946A] hover:text-[#1B2438]">View on website <ExternalLink size={13} /></a> : null} />
          <div className="adm-card adm-card-pad grid gap-5">
            <ImageField name="image_url" altName="image_alt" label="Service image" defaultUrl={s?.image_url} defaultAlt={s?.image_alt} aspect="aspect-[4/3]" />
            <Select label="Category" name="category_id" defaultValue={s?.category_id ?? ""} options={[{ value: "", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} />
          </div>
        </aside>
      </ActionForm>
      {s && (
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-[#E4DFD5] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] adm-muted">{canDelete ? "Deleting removes this service page from the website permanently." : "Only a Super Admin can delete a service. You can unpublish it instead."}</p>
          {canDelete && <ConfirmButton action={deleteServiceAction} fields={{ id: s.id }} label="Delete service" icon={<Trash2 size={15} />} confirmTitle={`Delete “${s.title}”?`} confirmBody="The service page disappears from the website. This can't be undone." />}
        </div>
      )}
    </>
  );
}
