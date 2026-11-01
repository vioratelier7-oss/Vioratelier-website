import { Monogram } from "@/components/brand/Logo";
import { Reveal } from "./motion";
import { ButtonLink, Eyebrow } from "./ui";

export function ContactCta() {
  return (
    <section className="relative overflow-hidden bg-ivory-deep py-28 md:py-40">
      <Monogram aria-hidden className="pointer-events-none absolute -right-24 top-1/2 h-[120%] w-auto -translate-y-1/2 text-stone/50 md:-right-10" />
      <div className="container-x relative">
        <Reveal><Eyebrow>Start a conversation</Eyebrow></Reveal>
        <Reveal delay={0.1}>
          <h2 className="display mt-8 max-w-4xl text-[3rem] text-navy md:text-[5.6rem]">Have an Idea? <span className="italic text-gold">Let&apos;s Make It Happen.</span></h2>
        </Reveal>
        <Reveal delay={0.2}><p className="mt-8 max-w-xl text-lg text-ink/75">Tell us what you&apos;re building. We&apos;ll help you bring it to life.</p></Reveal>
        <Reveal delay={0.3} className="mt-12 flex flex-wrap gap-4">
          <ButtonLink href="/contact#inquiry">Start a Project</ButtonLink>
          <ButtonLink href="/contact" variant="outline">Contact Us</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
