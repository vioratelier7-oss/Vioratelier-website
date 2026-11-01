import { NextResponse, type NextRequest } from "next/server";
import { getStaff } from "@/lib/auth";
import { inquiryQuery } from "@/lib/admin/inquiry-query";
import { INQUIRY_STATUSES } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Escapes one CSV cell and defuses spreadsheet formula injection (=, +, -, @, tab, CR). */
function cell(v: unknown): string {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const { data, error } = await inquiryQuery(staff, "created_at, full_name, email, phone, business_name, service, budget, timeline, status, description, source", { q, status }).limit(10000);
  if (error) return NextResponse.json({ error: "Couldn't export inquiries." }, { status: 500 });
  const rows = (data ?? []) as unknown as Record<string, string | null>[];
  const header = ["Received (IST)", "Name", "Email", "Phone", "Business", "Service", "Budget", "Timeline", "Status", "Project description", "Source"];
  const fmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
  const body = rows.map((r) => [
    fmt.format(new Date(r.created_at!)), r.full_name, r.email, r.phone, r.business_name, r.service, r.budget, r.timeline,
    INQUIRY_STATUSES.find((s) => s.value === r.status)?.label ?? r.status, r.description, r.source,
  ].map(cell).join(","));
  const csv = "\uFEFF" + [header.map(cell).join(","), ...body].join("\r\n") + "\r\n";
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vior-atelier-inquiries-${stamp}${status ? "-" + status : ""}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
