"use client";
import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { saveCategoryAction, deleteCategoryAction } from "@/lib/admin/actions/projects";
import { ActionForm, ConfirmButton, SubmitButton, TextInput } from "@/components/admin/forms";
import { slugify } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; description: string | null; sort_order: number; count?: number };

function CatForm({ table, cat, onDone }: { table: string; cat?: Cat; onDone?: () => void }) {
  const [name, setName] = useState(cat?.name ?? "");
  const [slug, setSlug] = useState(cat?.slug ?? "");
  const [touched, setTouched] = useState(!!cat);
  return (
    <ActionForm action={saveCategoryAction} resetOnSuccess={!cat} onSuccess={() => { if (!cat) { setName(""); setSlug(""); setTouched(false); } onDone?.(); }} className="grid gap-4 sm:grid-cols-[1fr_1fr_100px_auto] sm:items-end">
      <input type="hidden" name="table" value={table} />
      {cat && <input type="hidden" name="id" value={cat.id} />}
      <div>
        <label className="adm-label" htmlFor={`name-${cat?.id ?? "new"}`}>Name</label>
        <input id={`name-${cat?.id ?? "new"}`} name="name" value={name} maxLength={80} className="adm-input" placeholder="e.g. Hospitality"
          onChange={(e) => { setName(e.target.value); if (!touched) setSlug(slugify(e.target.value)); }} />
      </div>
      <div>
        <label className="adm-label" htmlFor={`slug-${cat?.id ?? "new"}`}>Slug</label>
        <input id={`slug-${cat?.id ?? "new"}`} name="slug" value={slug} maxLength={120} className="adm-input" onChange={(e) => { setTouched(true); setSlug(e.target.value); }} />
      </div>
      <TextInput label="Order" name="sort_order" type="number" defaultValue={String(cat?.sort_order ?? 0)} />
      <input type="hidden" name="description" value={cat?.description ?? ""} />
      <SubmitButton pendingLabel="Saving…">{cat ? "Save" : <><Plus size={15} /> Add</>}</SubmitButton>
    </ActionForm>
  );
}

export function CategoryManager({ table, categories, itemLabel }: { table: "project_categories" | "blog_categories"; categories: Cat[]; itemLabel: string }) {
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <div className="grid gap-6">
      <div className="adm-card adm-card-pad">
        <p className="adm-h2 mb-4">Add a category</p>
        <CatForm table={table} />
      </div>
      <div className="adm-card overflow-hidden">
        {categories.length === 0 ? (
          <p className="p-8 text-center text-[13px] adm-muted">No categories yet.</p>
        ) : (
          <ul className="adm-divide">
            {categories.map((c) => (
              <li key={c.id} className="px-5 py-4">
                {editing === c.id ? (
                  <CatForm table={table} cat={c} onDone={() => setEditing(null)} />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#1B2438]">{c.name}</p>
                      <p className="text-[12px] adm-muted">/{c.slug} · {c.count ?? 0} {itemLabel}{c.count === 1 ? "" : "s"}</p>
                    </div>
                    <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setEditing(c.id)}><Pencil size={14} /> Edit</button>
                    <ConfirmButton action={deleteCategoryAction} fields={{ id: c.id, table }} label="" icon={<Trash2 size={14} />} className="adm-btn-sm adm-btn-ghost adm-btn-icon"
                      confirmTitle={`Delete “${c.name}”?`} confirmBody={`${c.count ?? 0} ${itemLabel}${c.count === 1 ? "" : "s"} will become uncategorised. Nothing else is deleted.`} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
