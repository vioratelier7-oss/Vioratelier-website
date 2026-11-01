"use client";
import { UserPlus, UserMinus } from "lucide-react";
import { inviteUserAction, changeRoleAction, removeAccessAction } from "@/lib/admin/actions/users";
import { ActionForm, ConfirmButton, Select, SubmitButton, TextInput } from "@/components/admin/forms";

export function InviteForm() {
  return (
    <ActionForm action={inviteUserAction} resetOnSuccess className="grid gap-4 md:grid-cols-[1fr_1fr_180px_auto] md:items-end">
      <TextInput label="Name" name="full_name" maxLength={120} placeholder="Full name" />
      <TextInput label="Email" name="email" type="email" placeholder="name@example.com" />
      <Select label="Role" name="role" defaultValue="editor" options={[{ value: "editor", label: "Editor" }, { value: "super_admin", label: "Super Admin" }]} />
      <SubmitButton pendingLabel="Sending…"><UserPlus size={15} /> Send invite</SubmitButton>
    </ActionForm>
  );
}

export function RoleSelect({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  return (
    <ActionForm action={changeRoleAction} className="flex gap-2">
      <input type="hidden" name="user_id" value={userId} />
      <select name="role" defaultValue={role} disabled={disabled} className="adm-select !h-9 !py-1.5 !text-[13px] sm:!w-40" aria-label="Role" onChange={(e) => e.currentTarget.form?.requestSubmit()}>
        <option value="editor">Editor</option>
        <option value="super_admin">Super Admin</option>
      </select>
    </ActionForm>
  );
}

export function RemoveAccess({ userId, name }: { userId: string; name: string }) {
  return (
    <ConfirmButton action={removeAccessAction} fields={{ user_id: userId }} label="Remove" icon={<UserMinus size={14} />} className="adm-btn-sm"
      confirmTitle={`Remove ${name}'s access?`} confirmBody="They'll be signed out of the CMS on their next request. Their past notes and edits stay in the history." confirmLabel="Remove access" />
  );
}
