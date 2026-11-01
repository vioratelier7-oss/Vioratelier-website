import { Search } from "lucide-react";

/** GET form: search + optional status select. Works without JS. */
export function ListToolbar({ q, status, statuses, placeholder = "Search", extra }: { q?: string; status?: string; statuses?: { value: string; label: string }[]; placeholder?: string; extra?: React.ReactNode }) {
  return (
    <form method="get" className="mb-5 flex flex-col gap-2.5 sm:flex-row sm:items-center" role="search">
      <div className="relative flex-1 sm:max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A9A69C]" />
        <input name="q" defaultValue={q} placeholder={placeholder} className="adm-input !pl-9" aria-label="Search" />
      </div>
      {statuses && (
        <select name="status" defaultValue={status ?? ""} className="adm-select sm:!w-52" aria-label="Filter by status">
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      )}
      <button type="submit" className="adm-btn">Apply</button>
      {extra}
    </form>
  );
}

/** Escapes user search text for a PostgREST ilike filter. */
export function ilikeTerm(q: string | undefined) {
  return (q ?? "").trim().replace(/[%_,()*\\"]/g, " ").replace(/\s+/g, " ").slice(0, 80);
}
