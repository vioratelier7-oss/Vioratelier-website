import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Loader } from "@/components/site/Loader";
import { PreviewBanner } from "@/components/site/PreviewBanner";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { JsonLd } from "@/components/site/ui";
import { getServices, getSettings } from "@/lib/data/public";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { whatsappHref } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const wa = whatsappHref(settings?.whatsapp_number, settings?.whatsapp_message ?? "Hello VIOR ATELIER, I'm interested in your digital services.");
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-navy focus:px-4 focus:py-2 focus:text-ivory">Skip to content</a>
      <Loader />
      <Header contactEmail={settings?.contact_email} phone={settings?.contact_phone} />
      <main id="main">{children}</main>
      <Footer settings={settings} services={services} />
      {wa && <WhatsAppButton href={wa} />}
      <PreviewBanner />
      {settings && <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings.brand_name)]} />}
    </>
  );
}
