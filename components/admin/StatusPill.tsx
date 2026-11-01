export function StatusPill({ status }: { status: string }) {
  return <span className={`adm-badge ${status === "published" ? "adm-badge-published" : "adm-badge-draft"}`}>{status === "published" ? "Published" : "Draft"}</span>;
}
