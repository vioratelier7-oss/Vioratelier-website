import Image from "next/image";
import { Mail, MessageCircle, Phone, Globe } from "lucide-react";
import { InquiryForm } from "@/components/site/InquiryForm";
import { PageHero } from "@/components/site/PageHero";
import { Reveal, RevealImage } from "@/components/site/motion";
import { Eyebrow, JsonLd } from "@/components/site/ui";
import { getSettings } from "@/lib/data/public";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { telHref, whatsappHref } from "@/lib/utils";
import img from "@/public/images/contact-minimal.jpg";

export const revalidate = 60;
export const generateMetadata = () => buildMetadata({ path: "/contact" });

export default async function ContactPage() {
  const s = await getSettings();
  const channels = [
    s?.contact_phone && { icon: Phone, label: "Phone", value: s.contact_phone, href: telHref(s.contact_phone) },
    s?.whatsapp_number && { icon: MessageCircle, label: "WhatsApp", value: "Message us", href: whatsappHref(s.whatsapp_number, s.whatsapp_message) },
    s?.contact_email && { icon: Mail, label: "Email", value: s.contact_email, href: `mailto:${s.contact_email}` },
    s?.website_url && { icon: Globe, label: "Website", value: s.website_url.replace(/^https?:\/\//, ""), href: s.website_url },
  ].filter(Boolean) as Array<{ icon: typeof Phone; label: string; value: string; href?: string }>;

  return (
    <>
      <PageHero eyebrow="Contact" title={["Let\u2019s build something", <span key="i" className="italic text-gold">considered.</span>]}
        intro="Tell us what you're building. We'll help you bring it to life. Share a few details below and we'll reply personally."
        crumbs={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
      <section className="py-20 md:py-28">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <Reveal><Eyebrow>{s?.brand_name ?? "VIOR ATELIER"}</Eyebrow></Reveal>
            <ul className="mt-10 border-t border-line">
              {channels.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="border-b border-line">
                  <a href={href} target={label === "WhatsApp" || label === "Website" ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-center gap-5 py-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-champagne-deep transition-colors group-hover:border-navy group-hover:text-navy"><Icon className="h-4 w-4" strokeWidth={1.4} /></span>
                    <span><span className="eyebrow block text-muted">{label}</span><span className="mt-1 block break-all text-navy">{value}</span></span>
                  </a>
                </li>
              ))}
            </ul>
            <RevealImage className="mt-12 hidden aspect-[4/5] lg:block">
              <Image src={img} alt="Minimal white architecture" fill placeholder="blur" sizes="30vw" className="object-cover" />
            </RevealImage>
          </aside>
          <div id="inquiry" className="scroll-mt-32 lg:col-span-7 lg:col-start-6">
            <Reveal><h2 className="h-serif text-[2.4rem] text-navy md:text-[3.2rem]">Project <span className="italic">inquiry</span></h2></Reveal>
            <Reveal delay={0.1}><p className="mt-4 max-w-lg text-ink/70">Fields marked * are required. We usually reply within one to two working days.</p></Reveal>
            <div className="relative mt-12"><InquiryForm budgets={s?.budget_options ?? []} timelines={s?.timeline_options ?? []} /></div>
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
    </>
  );
}
