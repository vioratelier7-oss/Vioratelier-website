"use client";
import { useState } from "react";
import { Check, Link2, Linkedin, Mail } from "lucide-react";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const items = [
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}`, icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Z" /></svg> },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, icon: <Linkedin className="h-4 w-4" strokeWidth={1.5} /> },
    { label: "Share by email", href: `mailto:?subject=${enc(title)}&body=${enc(url)}`, icon: <Mail className="h-4 w-4" strokeWidth={1.5} /> },
  ];
  return (
    <div className="mt-4 flex gap-2 md:flex-col md:items-start">
      {items.map((it) => (
        <a key={it.label} href={it.href} target="_blank" rel="noopener noreferrer" aria-label={it.label} className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy transition-colors hover:border-navy">{it.icon}</a>
      ))}
      <button type="button" aria-label="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} }}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-navy transition-colors hover:border-navy">
        {copied ? <Check className="h-4 w-4" strokeWidth={1.5} /> : <Link2 className="h-4 w-4" strokeWidth={1.5} />}
      </button>
    </div>
  );
}
