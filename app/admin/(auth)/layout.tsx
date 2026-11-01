import { LogoInline, Monogram } from "@/components/brand/Logo";
import { Toaster } from "@/components/admin/forms";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#1B2438] text-[#F6F4EF] lg:flex lg:flex-col lg:justify-between p-14">
        <div className="pointer-events-none absolute -right-40 -bottom-40 opacity-[0.06]">
          <Monogram className="h-[720px] w-auto text-[#C9B78F]" />
        </div>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#C9B78F]" />
          <span className="text-[10.5px] tracking-[0.32em] uppercase text-[#C9B78F]">Studio CMS</span>
        </div>
        <div className="relative">
          <Monogram className="mb-10 h-24 w-auto text-[#C9B78F]" />
          <p className="font-serif text-[3.4rem] leading-[1.02] tracking-[-0.01em]">Crafting Digital<br />Experiences.</p>
          <p className="mt-6 max-w-sm text-[14px] leading-relaxed text-[#F6F4EF]/60">Manage projects, insights, inquiries and every word on the VIOR ATELIER website, from one quiet place.</p>
        </div>
        <p className="relative text-[11px] tracking-[0.2em] uppercase text-[#F6F4EF]/35">Private area · invitation only</p>
      </aside>
      {/* form panel */}
      <main className="flex min-h-dvh flex-col bg-[#F6F4EF] px-6 py-10 sm:px-12">
        <div className="lg:hidden">
          <LogoInline className="h-7 w-auto text-[#1B2438]" />
        </div>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">{children}</div>
        <p className="text-center text-[11px] text-[#7A786F]">Protected area. Access is by invitation only.</p>
      </main>
      <Toaster />
    </div>
  );
}
