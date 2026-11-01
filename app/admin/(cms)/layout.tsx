import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/admin/forms";
import { NoAccess } from "@/components/admin/NoAccess";
import { getAdminSession, displayName } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const { user, staff } = await getAdminSession();
  if (!user) redirect("/admin/login");
  if (!staff) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#F6F4EF] px-6">
        <div className="w-full max-w-[420px]"><NoAccess email={user.email ?? ""} /></div>
      </div>
    );
  }
  const { count } = await staff.supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new");
  return (
    <div className="min-h-dvh">
      <AdminNav name={displayName(staff.fullName, staff.email)} email={staff.email} role={staff.role} newInquiries={count ?? 0} />
      <div className="lg:pl-[264px]">
        <main className="mx-auto w-full max-w-[1240px] px-5 pb-24 pt-8 sm:px-8 md:pt-12 lg:px-12">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
