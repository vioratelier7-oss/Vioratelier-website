import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/site/ui";
import { getSettings } from "@/lib/data/public";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 300;
export const generateMetadata = () => buildMetadata({ path: "/privacy" });

export default async function Page() {
  const s = await getSettings();
  const email = s?.contact_email ?? "vioratelier7@gmail.com";
  const brand = s?.brand_name ?? "VIOR ATELIER";
  return (
    <>
      <PageHero eyebrow="Legal" title={["Privacy Policy"]} crumbs={[{ name: "Home", href: "/" }, { name: "Privacy Policy" }]} />
      <section className="py-16 md:py-24">
        <div className="container-x grid md:grid-cols-12">
          <div className="prose-va md:col-span-8 md:col-start-5">
            <p className="text-sm text-muted">Last updated: 30 October 2026. This document is a starting template and should be reviewed by the studio (and, if needed, a legal adviser) before launch.</p>
            <p>This policy explains how {brand} (&ldquo;we&rdquo;) collects and uses personal information when you visit this website or contact us.</p>
            <h2>Information we collect</h2>
            <ul><li><strong>Inquiry details</strong> you submit through our contact form: your name, email address, phone number, business name, the service you are interested in, budget, timeline and project description.</li><li><strong>Technical information</strong> needed to protect the form from spam and abuse, such as a one-way hashed version of your IP address and your browser&apos;s user-agent. We do not store your raw IP address.</li></ul>
            <h2>How we use it</h2>
            <p>We use your inquiry details only to respond to you, discuss your project and, if we work together, deliver our services. We do not sell your information or use it for unrelated marketing.</p>
            <h2>Where it is stored</h2>
            <p>Inquiries are stored securely in our database hosted by our infrastructure providers. Access is limited to authorised members of the studio.</p>
            <h2>Cookies</h2>
            <p>The public website does not use advertising cookies. If analytics are enabled, they are used in aggregate to understand how the site is used.</p>
            <h2>Retention</h2>
            <p>We keep inquiry records for as long as needed to respond and manage any resulting project, and delete them on request where we are not required to keep them.</p>
            <h2>Your choices</h2>
            <p>You may ask us to access, correct or delete the personal information we hold about you by emailing <a href={`mailto:${email}`}>{email}</a>.</p>
            <h2>Contact</h2>
            <p>Questions about this policy can be sent to <a href={`mailto:${email}`}>{email}</a>.</p>
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }])} />
    </>
  );
}
