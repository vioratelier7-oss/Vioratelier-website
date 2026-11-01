"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Search, Upload, X, Check, Loader2, ImageOff } from "lucide-react";
import { listMediaAction } from "@/lib/admin/actions/media";
import { uploadImage } from "@/lib/admin/upload";
import { toast } from "@/components/admin/forms";
import type { MediaRow } from "@/lib/admin/media-shared";
import { cn } from "@/lib/utils";

/** Library + upload modal. Calls onPick with the chosen asset(s). */
export function MediaPickerModal({ open, onClose, onPick, multiple = false, title = "Choose an image" }: {
  open: boolean; onClose: () => void; onPick: (rows: MediaRow[]) => void; multiple?: boolean; title?: string;
}) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<MediaRow[]>([]);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    const res = await listMediaAction(term);
    setLoading(false);
    if (!res.ok) toast(res.message ?? "Couldn't load the library.", false);
    setRows(res.rows);
  }, []);

  useEffect(() => { if (open) { setSel([]); load(""); } }, [open, load]);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q, open, load]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    const done: MediaRow[] = [];
    await Promise.all(list.map(async (f) => {
      try { done.push(await uploadImage(f)); }
      catch (e) { toast(e instanceof Error ? e.message : "Upload failed.", false); }
      finally { setUploading((n) => n - 1); }
    }));
    if (fileRef.current) fileRef.current.value = "";
    if (done.length) {
      toast(done.length === 1 ? "Image uploaded." : `${done.length} images uploaded.`);
      setRows((r) => [...done, ...r]);
      setSel((s) => (multiple ? [...done, ...s] : [done[0]]));
    }
  }

  const toggle = (r: MediaRow) => setSel((s) => multiple ? (s.some((x) => x.id === r.id) ? s.filter((x) => x.id !== r.id) : [...s, r]) : [r]);

  if (!open) return null;
  return createPortal(
    <div className="adm-modal !items-end sm:!items-center !p-0 sm:!p-5" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal-panel adm-modal-wide !p-0 flex flex-col !rounded-b-none sm:!rounded-[14px] h-[92dvh] sm:h-[min(760px,90dvh)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E4DFD5] px-5 py-4">
          <p className="adm-h2">{title}</p>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-icon" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3 border-b border-[#E4DFD5] px-5 py-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9A69C]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name or alt text" className="adm-input !pl-9" />
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml" multiple={multiple} className="hidden" onChange={(e) => onFiles(e.target.files)} data-testid="picker-file" />
          <button type="button" className="adm-btn adm-btn-gold" onClick={() => fileRef.current?.click()} disabled={uploading > 0}>
            {uploading > 0 ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />} {uploading > 0 ? `Uploading ${uploading}…` : "Upload new"}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
          {loading && rows.length === 0 ? (
            <div className="grid h-full place-items-center text-[#A9A69C]"><Loader2 className="animate-spin" /></div>
          ) : rows.length === 0 ? (
            <div className="adm-empty">
              <p className="font-serif text-[1.3rem] text-[#1B2438]">{q ? "Nothing matches that search" : "Your library is empty"}</p>
              <p className="mt-1 text-[13px] adm-muted">Upload an image, or drop files here. JPG, PNG, WebP, AVIF, GIF or SVG up to 10 MB.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
              {rows.map((r) => {
                const on = sel.some((x) => x.id === r.id);
                return (
                  <li key={r.id}>
                    <button type="button" onClick={() => toggle(r)} onDoubleClick={() => !multiple && onPick([r])}
                      className={cn("group relative block aspect-square w-full overflow-hidden rounded-lg border bg-[#F4F1EA] transition", on ? "border-[#1B2438] ring-2 ring-[#C9B78F]" : "border-[#E4DFD5] hover:border-[#C9B78F]")}
                      aria-pressed={on} title={r.alt_text || r.file_name}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.public_url} alt={r.alt_text ?? ""} loading="lazy" className="h-full w-full object-cover" />
                      {on && <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#1B2438] text-[#F6F4EF]"><Check size={14} /></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-[#E4DFD5] px-5 py-3.5">
          <p className="text-[12.5px] adm-muted">{sel.length ? `${sel.length} selected` : multiple ? "Select one or more images" : "Select an image"}</p>
          <div className="flex gap-2">
            <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
            <button type="button" className="adm-btn adm-btn-primary" disabled={!sel.length} onClick={() => onPick(sel)} data-testid="picker-confirm">Use {multiple && sel.length > 1 ? `${sel.length} images` : "image"}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** A form field holding an image URL (+ optional alt text), picked from the library or uploaded. */
export function ImageField({ name, altName, label = "Image", defaultUrl, defaultAlt, hint, aspect = "aspect-[16/10]", compact }: {
  name: string; altName?: string; label?: string; defaultUrl?: string | null; defaultAlt?: string | null; hint?: string; aspect?: string; compact?: boolean;
}) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [alt, setAlt] = useState(defaultAlt ?? "");
  const [open, setOpen] = useState(false);
  const [broken, setBroken] = useState(false);
  return (
    <div data-testid={`imagefield-${name}`}>
      <p className="adm-label">{label}</p>
      <input type="hidden" name={name} value={url} />
      <div className={cn("flex gap-4", compact ? "items-center" : "flex-col")}>
        <div className={cn("relative overflow-hidden rounded-lg border border-[#E4DFD5] bg-[#F4F1EA]", compact ? "h-20 w-20 shrink-0" : `w-full ${aspect}`)}>
          {url && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={alt} className="h-full w-full object-cover" onError={() => setBroken(true)} />
          ) : (
            <button type="button" onClick={() => setOpen(true)} className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#A8946A] transition hover:bg-[#EFEBE3]">
              {broken ? <ImageOff size={compact ? 18 : 24} strokeWidth={1.4} /> : <ImagePlus size={compact ? 18 : 24} strokeWidth={1.4} />}
              {!compact && <span className="text-[12.5px] font-medium">{broken ? "Image not found. Choose another" : "Choose or upload an image"}</span>}
            </button>
          )}
        </div>
        <div className={cn("flex flex-wrap gap-2", compact && "flex-col items-start")}>
          <button type="button" className="adm-btn adm-btn-sm" onClick={() => setOpen(true)}>{url ? "Replace" : "Choose image"}</button>
          {url && <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost adm-btn-danger" onClick={() => { setUrl(""); setBroken(false); }}>Remove</button>}
        </div>
      </div>
      {altName && (
        <div className="mt-3">
          <label className="adm-label" htmlFor={altName}>Alt text</label>
          <input id={altName} name={altName} value={alt} onChange={(e) => setAlt(e.target.value)} maxLength={300} className="adm-input" placeholder="Describe the image for screen readers and search engines" />
        </div>
      )}
      {hint && <p className="adm-hint">{hint}</p>}
      <MediaPickerModal open={open} onClose={() => setOpen(false)} onPick={([r]) => { setUrl(r.public_url); setBroken(false); if (altName && !alt && r.alt_text) setAlt(r.alt_text); setOpen(false); }} />
    </div>
  );
}
