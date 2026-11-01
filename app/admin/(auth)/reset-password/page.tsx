import type { Metadata } from "next";
import { ResetForm } from "@/components/admin/AuthForms";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a password" };

export default async function ResetPage() {
  const supabase = await createSessionClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div>
      <p className="adm-eyebrow mb-4">Account security</p>
      <h1 className="font-serif text-[2.6rem] leading-[1.02] text-[#1B2438]">Choose a new password</h1>
      <p className="mt-3 mb-9 text-[14px] text-[#7A786F]">{user?.email ? <>For <strong className="text-[#1B2438]">{user.email}</strong>.</> : "Set the password you'll use to sign in."}</p>
      <ResetForm hasSession={!!user} />
    </div>
  );
}
