"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import type { Testimonial } from "@/lib/data/public";
import { Eyebrow } from "./ui";

/** Shows only approved, published testimonials from the CMS. With none yet, shows the studio's own promise instead of invented quotes. */
export function Testimonials({ items, index }: { items: Testimonial[]; index?: string }) {
  const [i, setI] = useState(0);
  if (items.length === 0) {
    return (
      <section className="bg-white py-24 md:py-32">
        <div className="container-x grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4"><Eyebrow index={index}>Client Words</Eyebrow></div>
          <div className="md:col-span-8">
            <p className="h-serif text-[2rem] text-navy md:text-[3rem]">&ldquo;Design with intention. Build with precision. <span className="italic text-gold">Create with purpose.</span>&rdquo;</p>
            <p className="eyebrow mt-8 text-muted">The VIOR ATELIER promise</p>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-muted">We only publish testimonials shared by real clients and approved by them. Their words will appear here as our first projects are completed.</p>
          </div>
        </div>
      </section>
    );
  }
  const t = items[i];
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="container-x grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Eyebrow index={index}>Client Words</Eyebrow>
          {items.length > 1 && (
            <div className="mt-10 flex gap-3">
              <button aria-label="Previous testimonial" onClick={() => setI((i - 1 + items.length) % items.length)} className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-navy hover:border-navy"><ArrowLeft className="h-4 w-4" strokeWidth={1.5} /></button>
              <button aria-label="Next testimonial" onClick={() => setI((i + 1) % items.length)} className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-navy hover:border-navy"><ArrowRight className="h-4 w-4" strokeWidth={1.5} /></button>
            </div>
          )}
        </div>
        <div className="min-h-[18rem] md:col-span-8">
          <AnimatePresence mode="wait">
            <motion.figure key={t.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.6 }}>
              {t.rating && (
                <div className="mb-6 flex gap-1 text-champagne-deep" aria-label={`${t.rating} out of 5`}>
                  {Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" strokeWidth={0} />)}
                </div>
              )}
              <blockquote className="h-serif text-[1.8rem] text-navy md:text-[2.6rem]">&ldquo;{t.body}&rdquo;</blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                {t.avatar_url && <Image src={t.avatar_url} alt={t.client_name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />}
                <div>
                  <p className="font-medium text-navy">{t.client_name}</p>
                  <p className="text-sm text-muted">{[t.designation, t.business_name].filter(Boolean).join(", ")}</p>
                </div>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
