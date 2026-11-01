/** Only rendered in the static design-preview export (NEXT_PUBLIC_DESIGN_PREVIEW=1). */
export function PreviewBanner() {
  if (process.env.NEXT_PUBLIC_DESIGN_PREVIEW !== "1") return null;
  return (
    <div className="fixed bottom-6 left-4 z-40 border border-champagne/60 bg-ivory/95 px-3 py-2 text-[0.65rem] leading-snug text-navy shadow-sm backdrop-blur md:bottom-8 md:left-8 md:max-w-[15rem] md:px-4 md:py-3 md:text-[0.7rem]">
      <span className="eyebrow block text-champagne-deep">Design preview</span>
      <span className="hidden md:inline">Placeholder content. The CMS and backend go live once Supabase &amp; Vercel are connected.</span>
      <span className="md:hidden">Placeholder content</span>
    </div>
  );
}
