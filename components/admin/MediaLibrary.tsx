"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Copy, Trash2, X, Loader2, Search, ImageIcon } from "lucide-react";
import { uploadImage } from "@/lib/admin/upload";
import { deleteMediaAction, updateMediaAltAction } from "@/lib/admin/actions/media";
import { ActionForm, ConfirmButton, SubmitButton, toast } from "@/components/admin/forms";
import { formatBytes, type MediaRow } from "@/lib/admin/media-shared";
import { cn } from "@/lib/utils";

export function MediaLibrary({ initial, total }: { initial: MediaRow[]; total: number }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [active, setActive] = useState<MediaRow | null>(null);
  const [uploading, setUploading] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? rows.filter((r) => r.file_name.toLowerCase().includes(t) || (r.alt_text ?? "").toLowerCase().includes(t)) : rows;
  }, [rows, q]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((u) => [...u, ...list.map((f) => f.name)]);
    let okCount = 0;
    await Promise.all(list.map(async (f) => {
      try {
        const row = await uploadImage(f);
        setRows((r) => [row, ...r]);
        okCount++;
      } catch (e) {
        toast(e instanceof Error ? e.message : "Upload failed.", false);
      } finally {
        setUploading((u) => { const i = u.indexOf(f.name); return i > -1 ? [...u.slice(0, i), ...u.slice(i + 1)] : u; });
      }
    }));
    if (fileRef.current) fileRef.current.value = "";
    if (okCount) { toast(okCount === 1 ? "Image uploaded." : `${okCount} images uploaded.`); router.refresh(); }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A9A69C]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images" className="adm-input !pl-9" aria-label="Search images" />
        </div>
        <p className="text-[12.5px] adm-muted sm:ml-auto">{total + rows.length - initial.length} file{total === 1 ? "" : "s"}</p>
        <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml" className="hidden" onChange={(e) => onFiles(e.target.files)} data-testid="media-file" />
        <button type="button" className="adm-btn adm-btn-primary" onClick={() => fileRef.current?.click()}><Upload size={15} /> Upload images</button>
      </div>

      <div className={cn("rounded-xl transition", drag && "ring-2 ring-[#C9B78F] ring-offset-4 ring-offset-[#FAF9F6]")}>
        {shown.length === 0 && uploading.length === 0 ? (
          <div className="adm-empty">
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-[#E4DFD5] bg-white text-[#A8946A]"><ImageIcon size={20} strokeWidth={1.5} /></div>
            <p className="font-serif text-[1.35rem] text-[#1B2438]">{q ? "No images match that search" : "No images yet"}</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] adm-muted">Drag files here or use Upload. JPG, PNG, WebP, AVIF, GIF or SVG, up to 10 MB each.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {uploading.map((n, i) => (
              <li key={`u-${i}`} className="adm-card overflow-hidden">
                <div className="grid aspect-[4/3] place-items-center bg-[#F4F1EA] text-[#A8946A]"><Loader2 className="animate-spin" size={20} /></div>
                <p className="truncate px-3 py-2.5 text-[12px] adm-muted">Uploading {n}</p>
              </li>
            ))}
            {shown.map((r) => (
              <li key={r.id}>
                <button type="button" onClick={() => setActive(r)} className="group adm-card block w-full overflow-hidden text-left transition hover:border-[#C9B78F]" data-testid="media-tile">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F4F1EA]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.public_url} alt={r.alt_text ?? ""} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="truncate text-[12.5px] font-medium text-[#1B2438]">{r.file_name}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[11px] adm-muted">
                      {r.width && r.height ? `${r.width}×${r.height} · ` : ""}{formatBytes(r.size_bytes)}
                      {!r.alt_text && <span className="ml-auto rounded bg-[#F7F1E3] px-1.5 text-[10px] font-semibold text-[#8C7443]">No alt</span>}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active && (
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label="Image details" onClick={(e) => e.target === e.currentTarget && setActive(null)}>
          <div className="adm-modal-panel adm-modal-wide !p-0 grid md:grid-cols-[1.3fr_1fr]">
            <div className="grid place-items-center bg-[#F4F1EA] p-4 md:rounded-l-[14px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.public_url} alt={active.alt_text ?? ""} className="max-h-[50dvh] md:max-h-[70dvh] w-auto object-contain" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#1B2438]">{active.file_name}</p>
                  <p className="text-[12px] adm-muted">{active.mime_type.replace("image/", "").toUpperCase()} · {active.width && active.height ? `${active.width}×${active.height} · ` : ""}{formatBytes(active.size_bytes)}</p>
                </div>
                <button type="button" className="adm-btn adm-btn-ghost adm-btn-icon -mr-2 -mt-1" onClick={() => setActive(null)} aria-label="Close"><X size={18} /></button>
              </div>
              <ActionForm action={updateMediaAltAction} className="mt-6" onSuccess={() => router.refresh()}>
                <input type="hidden" name="id" value={active.id} />
                <label className="adm-label" htmlFor="alt">Alt text</label>
                <textarea id="alt" name="alt" rows={3} maxLength={300} defaultValue={active.alt_text ?? ""} className="adm-textarea !min-h-[80px]" placeholder="e.g. Ivory café menu displayed on a phone"
                  onChange={(e) => { const v = e.target.value; setRows((rs) => rs.map((x) => (x.id === active.id ? { ...x, alt_text: v } : x))); }} />
                <p className="adm-hint">Describes the image for screen readers and Google.</p>
                <SubmitButton className="mt-3" pendingLabel="Saving…">Save alt text</SubmitButton>
              </ActionForm>
              <div className="mt-6 border-t border-[#E4DFD5] pt-5">
                <p className="adm-label">File URL</p>
                <div className="flex gap-2">
                  <input readOnly value={active.public_url} className="adm-input !text-[12px]" onFocus={(e) => e.target.select()} />
                  <button type="button" className="adm-btn adm-btn-icon shrink-0" aria-label="Copy URL" onClick={async () => { await navigator.clipboard.writeText(active.public_url).catch(() => {}); toast("URL copied."); }}><Copy size={15} /></button>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <ConfirmButton action={deleteMediaAction} fields={{ id: active.id }} label="Delete image" icon={<Trash2 size={15} />}
                  confirmTitle="Delete this image?" confirmBody="The file is removed from storage and the library. This can't be undone."
                  onDone={() => { setRows((rs) => rs.filter((x) => x.id !== active.id)); setActive(null); router.refresh(); }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
