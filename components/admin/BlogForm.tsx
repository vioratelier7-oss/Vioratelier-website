"use client";
import Link from "next/link";
import { useState } from "react";
import { ExternalLink, Trash2, CalendarClock } from "lucide-react";
import { saveBlogPostAction, deleteBlogPostAction } from "@/lib/admin/actions/blog";
import { ActionForm, ConfirmButton, Select, SubmitButton, Switch, TextArea, TextInput, useFieldError } from "@/components/admin/forms";
import { TitleSlug, SeoFields } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/MediaPicker";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { StatusPill } from "@/components/admin/StatusPill";
import type { Database } from "@/lib/database.types";

type Post = Database["public"]["Tables"]["blog_posts"]["Row"];

/** ISO → value for <input type="datetime-local"> in India time */
function toIstLocal(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 330 * 60000);
  return d.toISOString().slice(0, 16);
}

function BodyError() {
  const e = useFieldError("content_html");
  return e ? <p className="adm-error">{e}</p> : null;
}

export function BlogForm({ post, categories, defaultAuthor }: { post?: Post; categories: { id: string; name: string }[]; defaultAuthor: string }) {
  const p = post;
  const [status, setStatus] = useState<"draft" | "published">(p?.status ?? "draft");
  const [pubAt, setPubAt] = useState<string | null>(p?.published_at ?? null);
  const [pubLocal, setPubLocal] = useState(toIstLocal(p?.published_at));
  const scheduled = status === "published" && pubAt && new Date(pubAt) > new Date();
  return (
    <>
      <ActionForm action={saveBlogPostAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
        onSuccess={(r) => { const st = r.data?.status; if (st === "draft" || st === "published") setStatus(st); const at = (r.data?.published_at as string | null) ?? null; setPubAt(at); setPubLocal(toIstLocal(at)); }}>
        {p && <input type="hidden" name="id" value={p.id} />}
        <input type="hidden" name="status" value={status} />
        <div className="grid min-w-0 gap-6">
          <section className="adm-card adm-card-pad grid gap-5">
            <TitleSlug defaultTitle={p?.title} defaultSlug={p?.slug} basePath="/insights" placeholder="Article title" />
            <TextArea label="Excerpt" name="excerpt" defaultValue={p?.excerpt ?? ""} rows={2} maxLength={500} hint="A short summary for the Insights page and social shares." />
          </section>
          <section>
            <RichTextEditor name="content_html" defaultValue={p?.content_html ?? ""} />
            <BodyError />
          </section>
          <section className="adm-card adm-card-pad">
            <h2 className="adm-h2">SEO</h2>
            <p className="mt-1 mb-5 text-[13px] adm-muted">Leave blank to use the title and excerpt.</p>
            <SeoFields defaultTitle={p?.seo_title} defaultDescription={p?.seo_description} defaultOg={p?.og_image_url} fallbackTitle={p?.title} path={`/insights/${p?.slug ?? ""}`} />
          </section>
        </div>
        <aside className="grid content-start gap-6 lg:sticky lg:top-8">
          <div className="adm-card adm-card-pad">
            <div className="mb-4 flex items-center justify-between">
              <p className="adm-label !mb-0">Status</p>
              {scheduled ? <span className="adm-badge adm-badge-featured">Scheduled</span> : <StatusPill status={status} />}
            </div>
            <TextInput label="Publish date & time (IST)" name="published_at" type="datetime-local" value={pubLocal} onChange={(e) => setPubLocal(e.target.value)}
              hint={<span className="flex gap-1.5"><CalendarClock size={13} className="mt-0.5 shrink-0" />Leave empty to publish now. A future date schedules the article.</span>} />
            <div className="mt-4 grid gap-2">
              {status === "draft" ? (
                <>
                  <SubmitButton name="_intent" value="publish" pendingLabel="Publishing…" className="w-full">Publish</SubmitButton>
                  <SubmitButton name="_intent" value="save" variant="default" pendingLabel="Saving…" className="w-full">Save draft</SubmitButton>
                </>
              ) : (
                <>
                  <SubmitButton name="_intent" value="save" pendingLabel="Saving…" className="w-full">Update</SubmitButton>
                  <SubmitButton name="_intent" value="unpublish" variant="default" pendingLabel="Moving…" className="w-full">Move to draft</SubmitButton>
                </>
              )}
            </div>
            {p && status === "published" && !scheduled && <a href={`/insights/${p.slug}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-[#A8946A] hover:text-[#1B2438]">View on website <ExternalLink size={13} /></a>}
          </div>
          <div className="adm-card adm-card-pad grid gap-5">
            <ImageField name="cover_image_url" altName="cover_image_alt" label="Cover image" defaultUrl={p?.cover_image_url} defaultAlt={p?.cover_image_alt} />
          </div>
          <div className="adm-card adm-card-pad grid gap-5">
            <Select label="Category" name="category_id" defaultValue={p?.category_id ?? ""} options={[{ value: "", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]} hint={<Link href="/admin/blog/categories" className="adm-link">Manage categories</Link>} />
            <TextInput label="Author name" name="author_name" defaultValue={p?.author_name ?? defaultAuthor} maxLength={120} />
            <Switch name="is_featured" label="Featured article" defaultChecked={p?.is_featured ?? false} />
          </div>
        </aside>
      </ActionForm>
      {p && (
        <div className="mt-10 flex justify-end border-t border-[#E4DFD5] pt-6">
          <ConfirmButton action={deleteBlogPostAction} fields={{ id: p.id }} label="Delete article" icon={<Trash2 size={15} />} confirmTitle={`Delete “${p.title}”?`} confirmBody="The article is removed from the website permanently." />
        </div>
      )}
    </>
  );
}
