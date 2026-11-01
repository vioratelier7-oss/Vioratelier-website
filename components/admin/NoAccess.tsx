import { ShieldOff } from "lucide-react";
import { logoutAction } from "@/lib/admin/actions/auth";

export function NoAccess({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full border border-[#E4DFD5] bg-white text-[#A8946A]"><ShieldOff size={22} strokeWidth={1.5} /></div>
      <p className="adm-eyebrow mb-3">No access</p>
      <h1 className="font-serif text-[2.2rem] leading-[1.05] text-[#1B2438]">This account isn&apos;t part of the studio CMS</h1>
      <p className="mt-4 text-[14px] text-[#7A786F]">You&apos;re signed in as <strong className="text-[#1B2438]">{email}</strong>, but it has no CMS role. Ask a Super Admin to invite you, or sign out and use a different account.</p>
      <form action={logoutAction} className="mt-8">
        <button type="submit" className="adm-btn adm-btn-primary adm-btn-lg w-full">Sign out</button>
      </form>
    </div>
  );
}
