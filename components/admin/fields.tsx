"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2, X, ImagePlus } from "lucide-react";
import { slugify } from "@/lib/utils";
import { Field, useFieldError, CountedInput } from "@/components/admin/forms";
import { MediaPickerModal, ImageField } from "@/components/admin/MediaPicker";
import type { MediaRow } from "@/lib/admin/media-shared";

/** Title + slug pair: the slug follows the title until it's edited by hand. */
export function TitleSlug({ defaultTitle, defaultSlug, titleLabel = "Title", basePath, placeholder }: { defaultTitle?: string; defaultSlug?: string; titleLabel?: string; basePath: string; placeholder?: string }) {
  const [title, setTitle] = useState(defaultTitle ?? "");
  const [slug, setSlug] = useState(defaultSlug ?? "");
  const [touched, setTouched] = useState(!!defaultSlug);
  const titleErr = useFieldError("title");
  const slugErr = useFieldError("slug");
  return (
    <div className="grid gap-5">
      <Field label={titleLabel} name="title">
        <input id="title" name="title" value={title} maxLength={200} required placeholder={placeholder} aria-invalid={!!titleErr}
          className="adm-input adm-input-lg !font-serif !text-[1.35rem] !py-2.5"
          onChange={(e) => { setTitle(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
      </Field>
      <Field label="URL slug" name="slug" hint={<span>Page address: <span className="text-[#1B2438]">{basePath}/{slug || "…"}</span></span>}>
        <div className="flex">
          <span className="hidden items-center rounded-l-lg border border-r-0 border-[#D6D0C4] bg-[#F7F5F0] px-3 text-[12.5px] text-[#7A786F] sm:flex">{basePath}/</span>
          <input id="slug" name="slug" value={slug} maxLength={120} aria-invalid={!!slugErr} className="adm-input sm:!rounded-l-none"
            onChange={(e) => { setTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")); }}
            onBlur={() => setSlug((s) => slugify(s))} />
        </div>
      </Field>
    </div>
  );
}

/** Tag chips stored as a JSON array in a hidden input. */
export function TagInput({ name, label, defaultValue, hint, placeholder = "Type and press Enter" }: { name: string; label: string; defaultValue?: string[]; hint?: ReactNode; placeholder?: string }) {
  const [tags, setTags] = useState<string[]>(defaultValue ?? []);
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setTags((t) => [...t, ...parts.filter((p) => !t.some((x) => x.toLowerCase() === p.toLowerCase()))].slice(0, 30));
    setDraft("");
  };
  return (
    <Field label={label} name={name} hint={hint}>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <div className="adm-chip-input">
        {tags.map((t) => (
          <span key={t} className="adm-chip">{t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => setTags((x) => x.filter((y) => y !== t))} className="grid h-5 w-5 place-items-center rounded text-[#7A786F] hover:bg-white hover:text-[#1B2438]"><X size={12} /></button>
          </span>
        ))}
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={tags.length ? "" : placeholder} maxLength={40}
          className="min-w-[140px] flex-1 bg-transparent px-2 text-[14px] outline-none" aria-label={label}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(draft); }
            if (e.key === "Backspace" && !draft && tags.length) setTags((t) => t.slice(0, -1));
          }}
          onBlur={() => add(draft)} />
      </div>
    </Field>
  );
}

/** One item per line, edited as rows with reorder. Submits as newline-separated text. */
export function LineList({ name, label, defaultValue, hint, placeholder = "Add an item" }: { name: string; label: string; defaultValue?: string[]; hint?: ReactNode; placeholder?: string }) {
  const [items, setItems] = useState<string[]>(defaultValue?.length ? defaultValue : []);
  const move = (i: number, d: number) => setItems((xs) => { const j = i + d; if (j < 0 || j >= xs.length) return xs; const c = [...xs]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  return (
    <Field label={label} name={name} hint={hint}>
      <textarea name={name} value={items.join("\n")} readOnly hidden />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-5 shrink-0 text-right text-[11px] tabular-nums text-[#A9A69C]">{i + 1}</span>
            <input value={it} maxLength={300} className="adm-input" aria-label={`${label} ${i + 1}`} placeholder={placeholder}
              onChange={(e) => setItems((xs) => xs.map((x, k) => (k === i ? e.target.value.replace(/\n/g, " ") : x)))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setItems((xs) => [...xs.slice(0, i + 1), "", ...xs.slice(i + 1)]); } }} />
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm max-sm:hidden" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={14} /></button>
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm max-sm:hidden" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
            <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm adm-btn-danger" onClick={() => setItems((xs) => xs.filter((_, k) => k !== i))} aria-label="Remove"><Trash2 size={14} /></button>
          </div>
        ))}
        <button type="button" className="adm-btn adm-btn-sm" onClick={() => setItems((xs) => [...xs, ""])}><Plus size={14} /> Add item</button>
      </div>
    </Field>
  );
}

export type GalleryItem = { id?: string; image_url: string; storage_path?: string | null; alt_text?: string | null; caption?: string | null; key: string };

/** Project gallery: add many from the library/upload, edit alt + caption, reorder, remove. */
export function GalleryEditor({ name, defaultValue }: { name: string; defaultValue: Omit<GalleryItem, "key">[] }) {
  const [items, setItems] = useState<GalleryItem[]>(defaultValue.map((g) => ({ ...g, key: g.id ?? Math.random().toString(36) })));
  const [open, setOpen] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);
  // After a save the server returns the stored rows (with ids): adopt them so the next save updates instead of re-inserting.
  const sig = defaultValue.map((g) => g.id ?? "").join(",");
  useEffect(() => {
    setItems(defaultValue.map((g) => ({ ...g, key: g.id ?? Math.random().toString(36) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);
  const move = (i: number, d: number) => setItems((xs) => { const j = i + d; if (j < 0 || j >= xs.length) return xs; const c = [...xs]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const patch = (key: string, p: Partial<GalleryItem>) => setItems((xs) => xs.map((x) => (x.key === key ? { ...x, ...p } : x)));
  const onPick = (rows: MediaRow[]) => {
    setItems((xs) => [...xs, ...rows.map((r) => ({ image_url: r.public_url, storage_path: r.path, alt_text: r.alt_text ?? "", caption: "", key: r.id + Math.random().toString(36).slice(2, 6) }))]);
    setOpen(false);
  };
  return (
    <div data-testid="gallery-editor">
      <input type="hidden" name={name} value={JSON.stringify(items.map((g) => ({ id: g.id, image_url: g.image_url, storage_path: g.storage_path, alt_text: g.alt_text, caption: g.caption })))} />
      {items.length === 0 ? (
        <button type="button" onClick={() => setOpen(true)} className="adm-empty flex w-full flex-col items-center !py-10 transition hover:border-[#C9B78F]">
          <ImagePlus size={22} strokeWidth={1.4} className="text-[#A8946A]" />
          <span className="mt-3 font-serif text-[1.2rem] text-[#1B2438]">Add gallery images</span>
          <span className="mt-1 text-[12.5px] adm-muted">Pick from the library or upload several at once</span>
        </button>
      ) : (
        <ul className="space-y-2.5">
          {items.map((g, i) => (
            <li key={g.key} draggable onDragStart={() => setDragKey(g.key)} onDragEnd={() => setDragKey(null)}
              onDragOver={(e) => { e.preventDefault(); if (!dragKey || dragKey === g.key) return; setItems((xs) => { const from = xs.findIndex((x) => x.key === dragKey); const c = [...xs]; const [m] = c.splice(from, 1); c.splice(i, 0, m); return c; }); }}
              className={`flex flex-col gap-3 rounded-lg border bg-white p-3 sm:flex-row sm:items-center ${dragKey === g.key ? "border-[#C9B78F] opacity-60" : "border-[#E4DFD5]"}`}>
              <div className="flex items-center gap-2">
                <GripVertical size={16} className="hidden shrink-0 cursor-grab text-[#C3BDB1] sm:block" aria-hidden />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image_url} alt={g.alt_text ?? ""} className="h-20 w-28 shrink-0 rounded-md object-cover bg-[#F4F1EA]" />
                <div className="ml-auto flex gap-1 sm:hidden">
                  <button type="button" className="adm-btn adm-btn-icon adm-btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={14} /></button>
                  <button type="button" className="adm-btn adm-btn-icon adm-btn-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
                  <button type="button" className="adm-btn adm-btn-icon adm-btn-sm adm-btn-danger" onClick={() => setItems((xs) => xs.filter((x) => x.key !== g.key))} aria-label="Remove image"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="grid flex-1 gap-2 sm:grid-cols-2">
                <input value={g.alt_text ?? ""} onChange={(e) => patch(g.key, { alt_text: e.target.value })} maxLength={300} className="adm-input" placeholder="Alt text (describe the image)" aria-label={`Alt text for image ${i + 1}`} />
                <input value={g.caption ?? ""} onChange={(e) => patch(g.key, { caption: e.target.value })} maxLength={300} className="adm-input" placeholder="Caption (optional)" aria-label={`Caption for image ${i + 1}`} />
              </div>
              <div className="hidden gap-1 sm:flex">
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={14} /></button>
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm adm-btn-danger" onClick={() => setItems((xs) => xs.filter((x) => x.key !== g.key))} aria-label="Remove image"><Trash2 size={14} /></button>
              </div>
            </li>
          ))}
          <li><button type="button" className="adm-btn adm-btn-sm" onClick={() => setOpen(true)}><Plus size={14} /> Add images</button></li>
        </ul>
      )}
      <MediaPickerModal open={open} multiple title="Add gallery images" onClose={() => setOpen(false)} onPick={onPick} />
    </div>
  );
}

/** SEO title/description/OG image with counters and a Google-style preview. */
export function SeoFields({ defaultTitle, defaultDescription, defaultOg, fallbackTitle, path, titleName = "seo_title", descName = "seo_description", ogName = "og_image_url" }: {
  defaultTitle?: string | null; defaultDescription?: string | null; defaultOg?: string | null; fallbackTitle?: string; path: string; titleName?: string; descName?: string; ogName?: string;
}) {
  const [t, setT] = useState(defaultTitle ?? "");
  const [d, setD] = useState(defaultDescription ?? "");
  return (
    <div className="grid gap-5">
      <CountedInput label="SEO title" name={titleName} defaultValue={defaultTitle} ideal={60} max={120} onValue={setT} placeholder={fallbackTitle} hint="Shown as the blue link in Google. Around 50–60 characters is ideal." />
      <CountedInput label="Meta description" name={descName} defaultValue={defaultDescription} ideal={155} max={320} onValue={setD} multiline hint="The grey summary under the link. Around 140–155 characters." />
      <SnippetPreview title={t || fallbackTitle || ""} description={d} path={path} />
      <ImageField name={ogName} label="Social sharing image (Open Graph)" defaultUrl={defaultOg} hint="Used when the page is shared on WhatsApp, LinkedIn, etc. 1200×630 works best." aspect="aspect-[1200/630]" />
    </div>
  );
}

export function SnippetPreview({ title, description, path }: { title: string; description: string; path: string }) {
  const crumbs = path.split("/").filter(Boolean);
  return (
    <div className="rounded-lg border border-[#E4DFD5] bg-white p-4" aria-label="Google search preview">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A9A69C]">Search preview</p>
      <div className="flex items-center gap-2.5">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-[#E4DFD5] bg-[#F6F4EF] font-serif text-[12px] text-[#1B2438]">V</span>
        <div className="leading-tight">
          <p className="text-[13px] text-[#202124]">VIOR ATELIER</p>
          <p className="text-[12px] text-[#4d5156]">vioratelier.com{crumbs.length ? ` › ${crumbs.join(" › ")}` : ""}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-1 font-[arial,sans-serif] text-[19px] leading-snug text-[#1a0dab]">{title ? (title.length > 62 ? title.slice(0, 60) + "…" : title) : <span className="text-[#A9A69C]">Page title</span>}</p>
      <p className="mt-1 line-clamp-2 font-[arial,sans-serif] text-[13.5px] leading-[1.55] text-[#4d5156]">{description ? (description.length > 160 ? description.slice(0, 157) + "…" : description) : <span className="text-[#A9A69C]">Add a meta description so Google shows your words, not a random excerpt.</span>}</p>
    </div>
  );
}
