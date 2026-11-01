import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/admin/AuthForms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <div>
      <p className="adm-eyebrow mb-4">Password help</p>
      <h1 className="font-serif text-[2.6rem] leading-[1.02] text-[#1B2438]">Reset your password</h1>
      <p className="mt-3 mb-9 text-[14px] text-[#7A786F]">Enter your account email and we&apos;ll send you a secure link to choose a new password.</p>
      <ForgotForm />
      <p className="mt-8 text-center text-[13px]"><Link href="/admin/login" className="adm-link">Back to sign in</Link></p>
    </div>
  );
}
