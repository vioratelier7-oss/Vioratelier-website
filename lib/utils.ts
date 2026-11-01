export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function formatDate(value: string | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone: "Asia/Kolkata" }).format(new Date(value));
}

export function readingMinutes(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function telHref(phone: string | null | undefined) {
  return phone ? `tel:${phone.replace(/[^+0-9]/g, "")}` : undefined;
}

export function whatsappHref(number: string | null | undefined, message?: string | null) {
  if (!number) return undefined;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number.replace(/[^0-9]/g, "")}${text}`;
}

export const INQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "in_discussion", label: "In Discussion" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
] as const;

export const SERVICE_OPTIONS = ["Website Design & Development", "QR Code Menu", "SEO Setup & Optimisation", "Other"] as const;
