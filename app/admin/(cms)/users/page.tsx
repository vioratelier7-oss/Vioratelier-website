import type { Metadata } from "next";
import { requireSuperAdminPage } from "@/lib/auth";
import { PageHeader, SectionTitle, relativeTime } from "@/components/admin/ui";
import { InviteForm, RoleSelect, RemoveAccess } from "@/components/admin/UserControls";
import { displayName } from "@/lib/admin/session";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const staff = await requireSuperAdminPage();
  const { data: roles } = await staff.supabase.from("user_roles").select("user_id, role, created_at").order("created_at");
  const ids = (roles ?? []).map((r) => r.user_id);
  const { data: profiles } = ids.length ? await staff.supabase.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] as { id: string; full_name: string | null; email: string }[] };
  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
  const supers = (roles ?? []).filter((r) => r.role === "super_admin").length;
  return (
    <>
      <PageHeader eyebrow="Super Admin" title="Users & roles" description="Super Admins manage everything, including settings and users. Editors manage content, inquiries and SEO, but can't change settings, users, or delete services and inquiries." />
      <div className="adm-card adm-card-pad mb-10">
        <SectionTitle title="Invite someone" description="They'll get an email with a secure link to set their password. There is no public sign-up." />
        <InviteForm />
      </div>
      <SectionTitle title={`Team (${roles?.length ?? 0})`} />
      <div className="adm-card overflow-hidden">
        <table className="adm-table">
          <thead><tr><th>Person</th><th>Role</th><th>Added</th><th className="w-0" /></tr></thead>
          <tbody>
            {(roles ?? []).map((r) => {
              const p = byId.get(r.user_id);
              const name = displayName(p?.full_name, p?.email ?? "unknown");
              const me = r.user_id === staff.userId;
              const lastSuper = r.role === "super_admin" && supers <= 1;
              return (
                <tr key={r.user_id} data-testid="user-row">
                  <td className="adm-td-main">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F4F1EA] font-serif text-[16px] text-[#1B2438]">{name[0]?.toUpperCase()}</span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1B2438]">{name}{me && <span className="ml-2 text-[11px] font-medium adm-muted">(you)</span>}</p>
                        <p className="truncate text-[12.5px] adm-muted">{p?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Role"><RoleSelect userId={r.user_id} role={r.role} /></td>
                  <td data-label="Added" className="whitespace-nowrap text-[12.5px] adm-muted">{relativeTime(r.created_at)}</td>
                  <td className="adm-td-actions text-right">{!me && <RemoveAccess userId={r.user_id} name={name} />}{me && lastSuper && <span className="text-[11.5px] adm-muted">Only Super Admin</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
