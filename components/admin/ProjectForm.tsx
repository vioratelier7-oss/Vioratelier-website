"use client";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Trash2, Info } from "lucide-react";
import { saveProjectAction, deleteProjectAction } from "@/lib/admin/actions/projects";
import { ActionForm, ConfirmButton, Select, Switch, TextArea, TextInput } from "@/components/admin/forms";
import { TitleSlug, TagInput, GalleryEditor, SeoFields, type GalleryItem } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/MediaPicker";
import { PublishBox } from "@/components/admin/PublishBox";
import type { Database } from "@/lib/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type Cat = { id: string; name: string };

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="adm-card adm-card-pad">
      <h2 className="adm-h2">{title}</h2>
      {description && <p className="mt-1 text-[13px] adm-muted">{description}</p>}
      <div className="mt-5 grid gap-5">{children}</div>
    </section>
  );
}

export function ProjectForm({ project, gallery, categories }: { project?: Project; gallery: Omit<GalleryItem, "key">[]; categories: Cat[] }) {
  const [status, setStatus] = useState<"draft" | "published">(project?.status ?? "draft");
  const p = project;
  return (
    <>
      <ActionForm action={saveProjectAction} onSuccess={(s) => { const st = s.data?.status; if (st === "draft" || st === "published") setStatus(st); }} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {p && <input type="hidden" name="id" value={p.id} />}
        <div className="grid min-w-0 gap-6">
          <Section title="Basics">
            <TitleSlug defaultTitle={p?.title} defaultSlug={p?.slug} basePath="/work" placeholder="e.g. Café Lumière digital menu" />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Client name" name="client_name" defaultValue={p?.client_name ?? ""} maxLength={160} placeholder="Business or person" />
              <Select label="Category" name="category_id" defaultValue={p?.category_id ?? ""} options={[{ value: "", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} hint={<Link href="/admin/projects/categories" className="adm-link">Manage categories</Link>} />
            </div>
            <TextArea label="Short description" name="short_description" defaultValue={p?.short_description ?? ""} rows={2} maxLength={400} hint="One or two sentences for project cards. Up to 400 characters." />
          </Section>

          <Section title="Case study" description="Plain text. Leave a blank line between paragraphs.">
            <TextArea label="Overview" name="overview" defaultValue={p?.overview ?? ""} rows={5} />
            <TextArea label="The challenge" name="challenge" defaultValue={p?.challenge ?? ""} rows={4} />
            <TextArea label="Our solution" name="solution" defaultValue={p?.solution ?? ""} rows={4} />
            <TextArea label="Results" name="results" defaultValue={p?.results ?? ""} rows={3} hint="Only real, measurable outcomes the client has confirmed." />
            <Switch name="results_verified" label="Results are verified by the client" defaultChecked={p?.results_verified ?? false} hint="The public site shows the Results section only when this is on." />
          </Section>

          <Section title="Gallery" description="Drag to reorder, or use the arrows. The first image leads the case study gallery.">
            <GalleryEditor name="gallery" defaultValue={gallery} />
          </Section>

          <Section title="Project details">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Live project URL" name="project_url" type="url" defaultValue={p?.project_url ?? ""} placeholder="https://" />
              <TextInput label="Completed on" name="completed_on" type="date" defaultValue={p?.completed_on ?? ""} />
            </div>
            <TagInput name="technologies" label="Technologies" defaultValue={p?.technologies ?? []} hint="e.g. Next.js, Supabase, Figma. Press Enter after each." />
          </Section>

          <Section title="SEO" description="Leave blank to use the project title and short description.">
            <SeoFields defaultTitle={p?.seo_title} defaultDescription={p?.seo_description} defaultOg={p?.og_image_url} fallbackTitle={p?.title} path={`/work/${p?.slug ?? ""}`} />
          </Section>
        </div>

        <aside className="grid content-start gap-6 lg:sticky lg:top-8">
          <PublishBox status={status} isNew={!p}
            extra={p && status === "published" ? <a href={`/work/${p.slug}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-[#A8946A] hover:text-[#1B2438]">View on website <ExternalLink size={13} /></a> : null}>
            {p?.published_at && status === "published" && <p className="text-[12px] adm-muted">Live since {new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>}
          </PublishBox>
          <div className="adm-card adm-card-pad grid gap-5">
            <ImageField name="cover_image_url" altName="cover_image_alt" label="Cover image" defaultUrl={p?.cover_image_url} defaultAlt={p?.cover_image_alt} aspect="aspect-[4/3]" />
          </div>
          <div className="adm-card adm-card-pad grid gap-4">
            <Switch name="is_featured" label="Featured project" defaultChecked={p?.is_featured ?? false} hint="Shown in the homepage Featured Work section." />
            <Switch name="is_sample" label="Placeholder / sample" defaultChecked={p?.is_sample ?? false} />
            <p className="-mt-2 flex gap-2 rounded-lg bg-[#F7F5F0] p-3 text-[12px] leading-relaxed text-[#6E6D66]"><Info size={14} className="mt-0.5 shrink-0 text-[#A8946A]" />Turn this on for demo content that isn&apos;t a real client project. The website labels it clearly as a sample, so visitors are never misled.</p>
            <TextInput label="Sort order" name="sort_order" type="number" defaultValue={String(p?.sort_order ?? 0)} hint="Lower numbers appear first." />
          </div>
        </aside>
      </ActionForm>
      {p && (
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-[#E4DFD5] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] adm-muted">Deleting removes the project and its gallery from the website permanently.</p>
          <ConfirmButton action={deleteProjectAction} fields={{ id: p.id, redirect: "1" }} label="Delete project" icon={<Trash2 size={15} />} confirmTitle={`Delete “${p.title}”?`} confirmBody="This removes the project and its gallery from the website. It can't be undone." />
        </div>
      )}
    </>
  );
}
