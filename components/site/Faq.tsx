import { Plus } from "lucide-react";
import type { Faq } from "@/lib/data/public";

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.q} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left [&::-webkit-details-marker]:hidden">
            <span className="h-serif text-[1.45rem] text-navy md:text-[1.7rem]">{f.q}</span>
            <Plus aria-hidden className="h-5 w-5 shrink-0 text-champagne-deep transition-transform duration-500 group-open:rotate-45" strokeWidth={1.25} />
          </summary>
          <p className="max-w-3xl pb-8 leading-relaxed text-ink/75">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
