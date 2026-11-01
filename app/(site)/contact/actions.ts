"use server";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/data/public";
import { escapeHtml, sendMail } from "@/lib/email";
import { inquirySchema, type InquiryInput } from "@/lib/validation/inquiry";

export type InquiryResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const MIN_FILL_MS = 3000; // faster than a human can fill the form = bot

export async function submitInquiry(input: InquiryInput): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    // Honeypot or timing failures are answered vaguely on purpose.
    if (fieldErrors.website || fieldErrors.startedAt) return { ok: false, error: "We couldn't send your message. Please try again." };
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;
  const elapsed = Date.now() - data.startedAt;
  if (elapsed < MIN_FILL_MS || elapsed > 1000 * 60 * 60 * 24) return { ok: false, error: "We couldn't send your message. Please refresh the page and try again." };

  const settings = await getSettings();
  if (data.budget && settings?.budget_options?.length && !settings.budget_options.includes(data.budget)) return { ok: false, error: "Please choose a budget from the list." };
  if (data.timeline && settings?.timeline_options?.length && !settings.timeline_options.includes(data.timeline)) return { ok: false, error: "Please choose a timeline from the list." };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.RATE_LIMIT_SALT ?? "";
  const ipHash = createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  const emailHash = createHash("sha256").update(`${salt}:${data.email}`).digest("hex");

  let admin;
  try { admin = createAdminClient(); } catch { return { ok: false, error: "The form is temporarily unavailable. Please email or WhatsApp us instead." }; }

  // Rate limits live in Postgres so they hold across serverless instances: 5 per IP per hour, 3 per email per hour.
  const [ipOk, emailOk] = await Promise.all([
    admin.rpc("consume_rate_limit", { p_key: `inquiry:ip:${ipHash}`, p_limit: 5, p_window_seconds: 3600 }),
    admin.rpc("consume_rate_limit", { p_key: `inquiry:email:${emailHash}`, p_limit: 3, p_window_seconds: 3600 }),
  ]);
  if (ipOk.error || emailOk.error) return { ok: false, error: "Something went wrong on our side. Please try again in a moment." };
  if (!ipOk.data || !emailOk.data) return { ok: false, error: "You've sent several messages recently. Please wait a little before trying again, or reach us on WhatsApp." };

  const { error } = await admin.from("inquiries").insert({
    full_name: data.fullName,
    email: data.email,
    phone: data.phone || null,
    business_name: data.businessName || null,
    service: data.service,
    budget: data.budget || null,
    timeline: data.timeline || null,
    description: data.description,
    ip_hash: ipHash,
    user_agent: (h.get("user-agent") ?? "").slice(0, 400),
    source: "website",
  });
  if (error) {
    console.error("inquiry insert failed", error.message);
    return { ok: false, error: "We couldn't save your message. Please try again or reach us on WhatsApp." };
  }

  // Notifications are best-effort: the inquiry is already safely stored.
  const rows = ([
    ["Name", data.fullName], ["Email", data.email], ["Phone", data.phone], ["Business", data.businessName],
    ["Service", data.service], ["Budget", data.budget], ["Timeline", data.timeline],
  ] as const).filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6E6D66">${k}</td><td>${escapeHtml(String(v))}</td></tr>`).join("");
  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL || settings?.contact_email;
  await Promise.allSettled([
    adminTo ? sendMail({ to: adminTo, replyTo: data.email, subject: `New project inquiry: ${data.fullName}`,
      html: `<div style="font-family:Arial,sans-serif;color:#343631"><h2 style="font-family:Georgia,serif;color:#1B2438">New inquiry</h2><table>${rows}</table><p style="white-space:pre-line">${escapeHtml(data.description)}</p></div>` }) : Promise.resolve(false),
    process.env.SEND_INQUIRY_CONFIRMATION === "true" ? sendMail({ to: data.email, subject: "We've received your message · VIOR ATELIER",
      html: `<div style="font-family:Arial,sans-serif;color:#343631;line-height:1.6"><p>Dear ${escapeHtml(data.fullName)},</p><p>Thank you for getting in touch with VIOR ATELIER. We've received your project details and will reply personally soon.</p><p>Warm regards,<br/>VIOR ATELIER<br/><em>Crafting Digital Experiences.</em></p></div>` }) : Promise.resolve(false),
  ]);

  revalidatePath("/admin", "layout");
  return { ok: true };
}
