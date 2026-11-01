"use client";
import { useState } from "react";
import { ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveSeoPageAction } from "@/lib/admin/actions/seo";
import { ActionForm, CountedInput, SubmitButton, TextInput } from "@/components/admin/forms";
import { SnippetPreview } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/MediaPicker";
import type { Database } from "@/lib/database.types";

type Row = Database["public"]["Tables"]["seo_pages"]["Row"];

export function SeoPageEditor({ row, defaultTitle }: { row: Row; defaultTitle: string }) {
  const [open, setOpen] = useState(false);
  const [t, setT] = useState(row.meta_title ?? "");
  const [d, setD] = useState(row.meta_description ?? "");
  const complete = !!(row.meta_title && row.meta_description);
  return (
    <li className="adm-card overflow-hidden" data-testid={`seo-${row.path}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FCFBF8]" aria-expanded={open}>
        {complete ? <CheckCircle2 size={17} className="shrink-0 text-[#3F6B4F]" /> : <AlertCircle size={17} className="shrink-0 text-[#A8946A]" />}
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-[#1B2438]">{row.label}</span>
          <span className="block truncate text-[12.5px] adm-muted">{row.path} · {row.meta_title || "Using default title"}</span>
        </span>
        {!row.robots_index && <span className="adm-badge adm-badge-danger max-sm:hidden">noindex</span>}
        <ChevronDown size={17} className={`shrink-0 text-[#7A786F] transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ActionForm action={saveSeoPageAction} className="grid gap-5 border-t border-[#E4DFD5] p-5 md:grid-cols-2">
          <input type="hidden" name="id" value={row.id} />
          <div className="grid content-start gap-5">
            <CountedInput label="Meta title" name="meta_title" defaultValue={row.meta_title} ideal={60} max={120} onValue={setT} placeholder={defaultTitle} />
            <CountedInput label="Meta description" name="meta_description" defaultValue={row.meta_description} ideal={155} max={320} onValue={setD} multiline />
            <TextInput label="Canonical URL" name="canonical_url" type="url" defaultValue={row.canonical_url ?? ""} placeholder={`https://vioratelier.com${row.path === "/" ? "" : row.path}`} hint="Leave empty to use this page's own address." />
            <div className="flex flex-wrap gap-x-6 gap-y-3 rounded-lg border border-[#E4DFD5] bg-[#FCFBF8] p-4">
              <label className="adm-check"><input type="checkbox" name="robots_index" defaultChecked={row.robots_index} /><span className="text-[13.5px]"><b className="font-semibold text-[#1B2438]">Index</b> <span className="adm-muted">show in Google</span></span></label>
              <label className="adm-check"><input type="checkbox" name="robots_follow" defaultChecked={row.robots_follow} /><span className="text-[13.5px]"><b className="font-semibold text-[#1B2438]">Follow</b> <span className="adm-muted">follow links</span></span></label>
            </div>
          </div>
          <div className="grid content-start gap-5">
            <SnippetPreview title={t || defaultTitle} description={d} path={row.path} />
            <CountedInput label="Social title (Open Graph)" name="og_title" defaultValue={row.og_title} ideal={60} max={120} placeholder="Defaults to the meta title" />
            <CountedInput label="Social description" name="og_description" defaultValue={row.og_description} ideal={155} max={320} multiline placeholder="Defaults to the meta description" />
            <ImageField name="og_image_url" label="Social sharing image" defaultUrl={row.og_image_url} aspect="aspect-[1200/630]" hint="Defaults to the site-wide image in Settings." />
          </div>
          <div className="flex justify-end md:col-span-2"><SubmitButton pendingLabel="Saving…">Save SEO</SubmitButton></div>
        </ActionForm>
      )}
    </li>
  );
}
