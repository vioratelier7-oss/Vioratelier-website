import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/AuthForms";
import { NoAccess } from "@/components/admin/NoAccess";
import { getAdminSession, safeNext } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Sign in" };

const NOTICES: Record<string, { ok: boolean; message: string }> = {
  link: { ok: false, message: "That link has expired or was already used. Request a new one." },
  unauthorised: { ok: false, message: "Please sign in to continue." },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { user, staff } = await getAdminSession();
  if (user && staff) redirect(safeNext(sp.next));
  if (user && !staff) return <NoAccess email={user.email ?? ""} />;

  const notice = sp.signed_out ? { ok: true, message: "You've been signed out." } : sp.error ? NOTICES[sp.error] : undefined;
  return (
    <div>
      <p className="adm-eyebrow mb-4">Welcome back</p>
      <h1 className="font-serif text-[2.6rem] leading-[1.02] text-[#1B2438]">Sign in to the studio</h1>
      <p className="mt-3 mb-9 text-[14px] text-[#7A786F]">Use the email your invitation was sent to.</p>
      <LoginForm next={sp.next} notice={notice ? { ...notice, at: 0 } : null} />
    </div>
  );
}
