"use client";
import { saveSettingsAction } from "@/lib/admin/actions/settings";
import { ActionForm, SubmitButton, TextArea, TextInput, CountedInput } from "@/components/admin/forms";
import { LineList } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/MediaPicker";
import { SocialLinks } from "@/components/admin/SocialLinks";
import type { Database } from "@/lib/database.types";

type S = Database["public"]["Tables"]["site_settings"]["Row"];

function Group({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-[#E4DFD5] py-8 first:border-t-0 first:pt-0 md:grid-cols-[260px_1fr] md:gap-10">
      <div>
        <h2 className="adm-h2">{title}</h2>
        {description && <p className="mt-1.5 text-[13px] adm-muted">{description}</p>}
      </div>
      <div className="adm-card adm-card-pad grid gap-5">{children}</div>
    </section>
  );
}

export function SettingsForm({ s }: { s: S }) {
  const social = Array.isArray(s.social_links) ? (s.social_links as { label?: string; url?: string }[]).map((x) => ({ label: String(x?.label ?? ""), url: String(x?.url ?? "") })) : [];
  return (
    <ActionForm action={saveSettingsAction}>
      <input type="hidden" name="id" value={s.id} />
      <Group title="Brand" description="How the studio presents itself across the site.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput label="Brand name" name="brand_name" defaultValue={s.brand_name} maxLength={80} />
          <TextInput label="Tagline" name="tagline" defaultValue={s.tagline} maxLength={160} />
        </div>
        <ImageField name="logo_url" label="Logo file (optional)" defaultUrl={s.logo_url} compact hint="The website uses the built-in vector logo. Set this only to override it, e.g. for emails." />
        <TextArea label="Short introduction" name="intro" defaultValue={s.intro ?? ""} rows={3} maxLength={1000} hint="Used in the footer and for search engines." />
        <TextArea label="Footer text" name="footer_text" defaultValue={s.footer_text ?? ""} rows={2} maxLength={600} />
      </Group>
      <Group title="Contact" description="Shown on the contact page, footer and the floating WhatsApp button.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput label="Phone" name="contact_phone" defaultValue={s.contact_phone ?? ""} maxLength={32} placeholder="+91 94124 06016" />
          <TextInput label="Email" name="contact_email" type="email" defaultValue={s.contact_email ?? ""} />
          <TextInput label="WhatsApp number" name="whatsapp_number" defaultValue={s.whatsapp_number ?? ""} inputMode="numeric" maxLength={20} hint="Digits only, with country code: 919412406016" />
          <TextInput label="Website URL" name="website_url" type="url" defaultValue={s.website_url ?? ""} placeholder="https://vioratelier.com" />
        </div>
        <TextArea label="WhatsApp pre-filled message" name="whatsapp_message" defaultValue={s.whatsapp_message ?? ""} rows={2} maxLength={300} />
      </Group>
      <Group title="Social profiles" description="Only add profiles that exist. Nothing is shown until you do.">
        <SocialLinks name="social_links" defaultValue={social} />
      </Group>
      <Group title="Contact form options" description="The choices visitors pick from on the project inquiry form.">
        <LineList name="budget_options" label="Budget options" defaultValue={s.budget_options} placeholder="e.g. ₹25,000 – ₹50,000" />
        <LineList name="timeline_options" label="Timeline options" defaultValue={s.timeline_options} placeholder="e.g. Within a month" />
      </Group>
      <Group title="Default SEO" description="Used by any page that doesn't set its own.">
        <CountedInput label="Default SEO title" name="default_seo_title" defaultValue={s.default_seo_title} ideal={60} max={120} />
        <CountedInput label="Default meta description" name="default_seo_description" defaultValue={s.default_seo_description} ideal={155} max={320} multiline />
        <ImageField name="default_og_image_url" label="Default social sharing image" defaultUrl={s.default_og_image_url} aspect="aspect-[1200/630]" />
      </Group>
      <div className="sticky bottom-0 z-20 -mx-5 flex items-center justify-end gap-3 border-t border-[#E4DFD5] bg-[#FAF9F6]/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <p className="mr-auto text-[12.5px] adm-muted max-sm:hidden">Changes go live on the website as soon as you save.</p>
        <SubmitButton pendingLabel="Saving…" className="max-sm:w-full">Save settings</SubmitButton>
      </div>
    </ActionForm>
  );
}
