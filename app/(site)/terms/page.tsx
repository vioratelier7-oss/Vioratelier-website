import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/site/ui";
import { getSettings } from "@/lib/data/public";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const revalidate = 300;
export const generateMetadata = () => buildMetadata({ path: "/terms" });

export default async function Page() {
  const s = await getSettings();
  const email = s?.contact_email ?? "vioratelier7@gmail.com";
  const brand = s?.brand_name ?? "VIOR ATELIER";
  return (
    <>
      <PageHero eyebrow="Legal" title={["Terms & Conditions"]} crumbs={[{ name: "Home", href: "/" }, { name: "Terms & Conditions" }]} />
      <section className="py-16 md:py-24">
        <div className="container-x grid md:grid-cols-12">
          <div className="prose-va md:col-span-8 md:col-start-5">
            <p className="text-sm text-muted">Last updated: 30 October 2026. This document is a starting template and should be reviewed by the studio (and, if needed, a legal adviser) before launch.</p>
            <p>By using this website you agree to these terms. If you do not agree, please do not use the site.</p>
            <h2>Use of the website</h2>
            <p>The content of this website is provided for general information about {brand} and its services. We aim to keep it accurate and current but make no guarantee that it is complete or error-free.</p>
            <h2>Intellectual property</h2>
            <p>The {brand} name, logo, designs and original content on this site belong to {brand} unless stated otherwise. Please do not reproduce them without permission. Photography used for illustration may belong to third parties and is used under its respective licence.</p>
            <h2>Project work</h2>
            <p>Any project we undertake is governed by a separate written proposal or agreement setting out scope, fees and timelines. Information on this website does not constitute an offer or a contract.</p>
            <h2>No guarantees of results</h2>
            <p>We do not guarantee specific business outcomes, search engine rankings or traffic levels. Search results depend on many factors outside anyone&apos;s control.</p>
            <h2>External links</h2>
            <p>This site may link to external websites. We are not responsible for their content or practices.</p>
            <h2>Limitation of liability</h2>
            <p>To the extent permitted by law, {brand} is not liable for any loss arising from the use of this website.</p>
            <h2>Changes</h2>
            <p>We may update these terms from time to time. The latest version will always be published on this page.</p>
            <h2>Contact</h2>
            <p>For any questions about these terms, email <a href={`mailto:${email}`}>{email}</a>.</p>
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Terms & Conditions", path: "/terms" }])} />
    </>
  );
}
