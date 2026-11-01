import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass, Gauge, Gem, LifeBuoy, LineChart, MonitorSmartphone } from "lucide-react";
import { Monogram } from "@/components/brand/Logo";
import { Parallax, Reveal, RevealImage, SplitLines } from "@/components/site/motion";
import { ProjectExplorer } from "@/components/site/ProjectExplorer";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { ContactCta } from "@/components/site/ContactCta";
import { ButtonLink, Eyebrow } from "@/components/site/ui";
import { Testimonials } from "@/components/site/Testimonials";
import { getProjectCategories, getProjects, getServices, getTestimonials } from "@/lib/data/public";
import { buildMetadata } from "@/lib/seo";
import heroImage from "@/public/images/hero-architecture.jpg";
import studioImage from "@/public/images/studio-plans.jpg";

export const revalidate = 60;
export const generateMetadata = () => buildMetadata({ path: "/" });

const WHY = [
  { icon: Gem, title: "Thoughtful design", body: "Every layout, typeface and interaction is chosen for a reason, so your brand feels considered at every touchpoint." },
  { icon: LineChart, title: "Business-focused solutions", body: "We start from your goals and your customers, and design towards the outcomes that matter to your business." },
  { icon: MonitorSmartphone, title: "Responsive development", body: "Built mobile-first and tested across devices, so the experience holds up on every screen your customers use." },
  { icon: Gauge, title: "Performance and usability", body: "Fast pages, clear navigation and accessible markup: the invisible details that keep people engaged." },
  { icon: Compass, title: "Attention to detail", body: "Spacing, typography and copy are refined until the whole feels calm, precise and unmistakably yours." },
  { icon: LifeBuoy, title: "Long-term support", body: "Launch is the beginning. We stay on hand to help you update, improve and grow what we build together." },
];

export default async function HomePage() {
  const [services, projects, categories, testimonials] = await Promise.all([
    getServices(), getProjects({ limit: 6 }), getProjectCategories(), getTestimonials(),
  ]);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 md:pt-36">
        <div className="container-x grid items-end gap-12 pb-16 md:pb-20 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 lg:pb-10">
            <Reveal><Eyebrow index="(01)">Independent Digital Studio</Eyebrow></Reveal>
            <h1 className="display mt-8 text-[3.4rem] text-navy sm:text-[5rem] md:text-[6.4rem] xl:text-[7.6rem]">
              <SplitLines lines={["Crafting", <span key="l2">Digital <em className="font-light italic text-gold">Experiences.</em></span>]} delay={1.1} />
            </h1>
            <Reveal delay={1.4} className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
              <p className="max-w-lg text-[1.05rem] leading-relaxed text-ink/80 md:text-lg">
                We design and build refined digital experiences that help ambitious businesses establish their presence, connect with customers and grow.
              </p>
            </Reveal>
            <Reveal delay={1.55} className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/work">Explore Our Work</ButtonLink>
              <ButtonLink href="/contact" variant="outline">Start a Project</ButtonLink>
            </Reveal>
          </div>
          <div className="relative lg:col-span-5">
            <RevealImage delay={1.0} className="aspect-[4/5] w-full lg:aspect-[3/4]">
              <Parallax className="h-full w-full" offset={40}>
                <Image src={heroImage} alt="Pale stepped architecture against a soft sky" fill priority placeholder="blur" sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
              </Parallax>
            </RevealImage>
            <div className="pointer-events-none absolute -bottom-6 -left-6 hidden h-28 w-28 border-b border-l border-champagne md:block" aria-hidden />
            <p className="eyebrow mt-4 flex justify-between text-muted"><span>Websites · QR Menus · SEO</span><span>VA / 2026</span></p>
          </div>
        </div>
        <div className="container-x">
          <div className="flex items-center justify-between border-t border-line py-6 text-ink/70">
            <span className="eyebrow">Design with intention</span>
            <span className="eyebrow hidden sm:inline">Build with precision</span>
            <span className="eyebrow hidden md:inline">Create with purpose</span>
            <a href="#intro" className="eyebrow flex items-center gap-2 text-navy"><span className="link-underline">Scroll</span><span aria-hidden className="inline-block h-6 w-px animate-pulse bg-champagne" /></a>
          </div>
        </div>
      </section>

      {/* ── Introduction ─────────────────────────────────────── */}
      <section id="intro" className="bg-white py-24 md:py-36">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal><Eyebrow index="(02)">The Studio</Eyebrow></Reveal>
            <Reveal delay={0.1}>
              <h2 className="h-serif mt-8 text-[2.6rem] text-navy md:text-[4rem]">
                Thoughtful Design. <span className="italic text-gold">Meaningful</span> Digital Experiences.
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-8 text-[1.02rem] leading-relaxed text-ink/80 md:grid-cols-2">
              <Reveal delay={0.15}><p>VIOR ATELIER brings together design, technology and strategy to create digital solutions for modern businesses. We work closely with each client to understand what makes them distinctive, then shape that into experiences people enjoy using.</p></Reveal>
              <Reveal delay={0.25}><p>From a café&apos;s digital menu to a growing brand&apos;s website and search foundations, every project receives the same care: clear thinking, refined design and dependable engineering, built to last.</p></Reveal>
            </div>
            <Reveal delay={0.3} className="mt-12"><ButtonLink href="/about" variant="ghost">About the studio</ButtonLink></Reveal>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <RevealImage className="aspect-[3/4]">
              <Image src={studioImage} alt="Architectural drawings and drafting tools on a desk" fill placeholder="blur" sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
            </RevealImage>
            <p className="mt-4 text-sm italic text-muted font-serif">Every project begins on paper, with a clear idea.</p>
          </div>
        </div>
      </section>

      {/* ── Featured projects ───────────────────────────────── */}
      <section className="py-24 md:py-36">
        <div className="container-x">
          <div className="mb-14 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
            <div>
              <Reveal><Eyebrow index="(03)">Selected Work</Eyebrow></Reveal>
              <Reveal delay={0.1}><h2 className="h-serif mt-8 max-w-2xl text-[2.6rem] text-navy md:text-[4rem]">Featured <span className="italic">Projects</span></h2></Reveal>
            </div>
            <Reveal delay={0.2}><ButtonLink href="/work" variant="outline">View All Work</ButtonLink></Reveal>
          </div>
          {projects.length > 0 ? (
            <ProjectExplorer projects={projects} categories={categories} showSearch={false} layout="editorial" />
          ) : (
            <div className="flex flex-col items-center border border-dashed border-stone py-24 text-center">
              <Monogram className="h-12 w-auto text-stone" />
              <p className="mt-6 font-serif text-2xl italic text-navy">Our first case studies are being prepared.</p>
              <p className="mt-2 text-sm text-muted">Projects published in the studio CMS appear here automatically.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Services overview ───────────────────────────────── */}
      <section className="bg-white py-24 md:py-36">
        <div className="container-x">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-5">
              <Reveal><Eyebrow index="(04)">Services</Eyebrow></Reveal>
              <Reveal delay={0.1}><h2 className="h-serif mt-8 text-[2.6rem] text-navy md:text-[4rem]">What we <span className="italic">do</span></h2></Reveal>
            </div>
            <Reveal delay={0.2} className="md:col-span-5 md:col-start-8 md:self-end">
              <p className="text-[1.02rem] leading-relaxed text-ink/75">Three focused services, each delivered with the same standard of design and care, for businesses that want to look and work at their best online.</p>
            </Reveal>
          </div>
          <ol className="mt-16 border-t border-line md:mt-24">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} className="group border-b border-line">
                <Link href={`/services/${s.slug}`} className="grid gap-8 py-10 md:grid-cols-12 md:gap-10 md:py-14">
                  <span className="font-serif text-xl text-champagne-deep md:col-span-1">{String(i + 1).padStart(2, "0")}.</span>
                  <div className="md:col-span-5">
                    <h3 className="h-serif text-[2rem] text-navy transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-2 md:text-[2.75rem]">{s.title}</h3>
                    <p className="mt-4 max-w-md leading-relaxed text-ink/75">{s.summary}</p>
                    <span className="eyebrow mt-8 inline-flex items-center gap-2 text-navy"><span className="link-underline">Learn More</span><ArrowUpRight className="h-3 w-3" strokeWidth={1.5} /></span>
                  </div>
                  <ul className="space-y-2.5 text-sm text-ink/70 md:col-span-3">
                    <li className="eyebrow mb-4 text-muted">Key deliverables</li>
                    {s.scope.slice(0, 5).map((d) => (
                      <li key={d} className="flex items-baseline gap-3"><span aria-hidden className="h-px w-3 shrink-0 translate-y-[-3px] bg-champagne-deep" />{d}</li>
                    ))}
                  </ul>
                  <div className="relative order-first aspect-[16/10] overflow-hidden md:order-none md:col-span-3 md:aspect-[4/5]">
                    {s.image_url ? (
                      <Image src={s.image_url} alt={s.image_alt ?? s.title} fill sizes="25vw" className="object-cover grayscale-[35%] transition-all duration-[1.4s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105 group-hover:grayscale-0" />
                    ) : <div className="absolute inset-0 bg-stone/50" />}
                  </div>
                </Link>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Why VIOR ATELIER ────────────────────────────────── */}
      <section className="relative py-24 md:py-36">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal><Eyebrow index="(05)">Why VIOR ATELIER</Eyebrow></Reveal>
              <Reveal delay={0.1}><h2 className="h-serif mt-8 text-[2.6rem] text-navy md:text-[3.6rem]">Design with Purpose. <span className="italic text-gold">Built for Growth.</span></h2></Reveal>
              <Reveal delay={0.2}><Monogram className="mt-12 hidden h-16 w-auto text-stone lg:block" /></Reveal>
            </div>
          </div>
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:col-span-8">
            {WHY.map(({ icon: Icon, title, body }, i) => (
              <Reveal as="li" key={title} delay={(i % 2) * 0.1} className="bg-ivory p-8 md:p-10">
                <Icon aria-hidden className="h-6 w-6 text-champagne-deep" strokeWidth={1.1} />
                <h3 className="h-serif mt-8 text-2xl text-navy">{title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/70">{body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Process ─────────────────────────────────────────── */}
      <ProcessTimeline index="(06)" />

      {/* ── Testimonials (only genuine, approved) ──────────── */}
      <Testimonials items={testimonials} index="(07)" />

      {/* ── Contact CTA ─────────────────────────────────────── */}
      <ContactCta />
    </>
  );
}
