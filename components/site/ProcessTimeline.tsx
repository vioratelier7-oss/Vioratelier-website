"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Eyebrow } from "./ui";

const STEPS = [
  { title: "Discover", body: "Understand the business, audience and objectives." },
  { title: "Design", body: "Develop the visual direction and user experience." },
  { title: "Develop", body: "Build, test and optimise the solution." },
  { title: "Deliver", body: "Launch the final product and provide support." },
];

export function ProcessTimeline({ index, light = false }: { index?: string; light?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-navy py-24 text-ivory md:py-36">
      <div className="container-x">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-6">
            <Eyebrow index={index} light>Our Process</Eyebrow>
            <h2 className="h-serif mt-8 text-[2.6rem] md:text-[4rem]">Four steps, <span className="italic text-champagne">one standard.</span></h2>
          </div>
          <p className="text-ivory/70 md:col-span-4 md:col-start-9 md:self-end">A clear, collaborative process keeps every project focused, transparent and on schedule, from the first conversation to launch and beyond.</p>
        </div>
        <ol className="relative mt-20 grid gap-12 md:mt-28 md:grid-cols-4 md:gap-8">
          <motion.span
            aria-hidden
            className="absolute left-[7px] top-0 hidden h-px w-full origin-left bg-champagne/50 md:left-0 md:top-[7px] md:block"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <span aria-hidden className="absolute bottom-0 left-[7px] top-0 w-px bg-champagne/40 md:hidden" />
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              className="relative pl-10 md:pl-0 md:pt-14"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.18 }}
            >
              <span aria-hidden className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border border-champagne bg-navy md:top-0">
                <span className="absolute inset-[4px] rounded-full bg-champagne" />
              </span>
              <span className="font-serif text-lg text-champagne">0{i + 1}</span>
              <h3 className="h-serif mt-3 text-[2.2rem]">{s.title}</h3>
              <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-ivory/70">{s.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
      {light && null}
    </section>
  );
}
