import { Reveal, SplitLines } from "./motion";
import { Breadcrumbs, Eyebrow } from "./ui";

export function PageHero({ eyebrow, title, intro, crumbs, children }: { eyebrow: string; title: React.ReactNode[]; intro?: React.ReactNode; crumbs?: Array<{ name: string; href?: string }>; children?: React.ReactNode }) {
  return (
    <section className="pt-32 md:pt-44">
      <div className="container-x">
        {crumbs && <Reveal className="mb-10"><Breadcrumbs items={crumbs} /></Reveal>}
        <Reveal><Eyebrow>{eyebrow}</Eyebrow></Reveal>
        <h1 className="display mt-8 max-w-5xl text-[3rem] text-navy sm:text-[4.2rem] md:text-[5.6rem]">
          <SplitLines lines={title} delay={0.15} />
        </h1>
        {intro && <Reveal delay={0.4}><div className="mt-10 max-w-2xl text-lg leading-relaxed text-ink/75">{intro}</div></Reveal>}
        {children}
      </div>
    </section>
  );
}
