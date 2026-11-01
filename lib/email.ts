import "server-only";

type Mail = { to: string; subject: string; html: string; replyTo?: string };

/** Sends through Resend's HTTP API when RESEND_API_KEY is set. Returns false (never throws) when not configured or failing. */
export async function sendMail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, html: mail.html, reply_to: mail.replyTo }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("sendMail failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("sendMail error", e);
    return false;
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
