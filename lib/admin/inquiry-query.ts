import "server-only";
import type { StaffContext } from "@/lib/auth";
import { INQUIRY_STATUSES } from "@/lib/utils";
import { ilikeTerm } from "@/components/admin/ListToolbar";

export type InquiryFilters = { q?: string; status?: string };

/** Shared by the list page and the CSV export so both honour the same filters. */
export function inquiryQuery(staff: StaffContext, cols: string, f: InquiryFilters) {
  let query = staff.supabase.from("inquiries").select(cols).order("created_at", { ascending: false });
  const term = ilikeTerm(f.q);
  if (term) query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,business_name.ilike.%${term}%`);
  if (f.status && INQUIRY_STATUSES.some((s) => s.value === f.status)) query = query.eq("status", f.status as (typeof INQUIRY_STATUSES)[number]["value"]);
  return query;
}
