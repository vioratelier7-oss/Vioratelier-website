"use client";
import { Trash2 } from "lucide-react";
import { updateInquiryStatusAction, addInquiryNoteAction, deleteInquiryNoteAction } from "@/lib/admin/actions/inquiries";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { INQUIRY_STATUSES } from "@/lib/utils";

export function StatusForm({ id, status }: { id: string; status: string }) {
  return (
    <ActionForm action={updateInquiryStatusAction} className="flex gap-2">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} className="adm-select" aria-label="Inquiry status" onChange={(e) => e.currentTarget.form?.requestSubmit()} data-testid="inquiry-status">
        {INQUIRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <SubmitButton pendingLabel="…" className="shrink-0">Update</SubmitButton>
    </ActionForm>
  );
}

export function NoteForm({ inquiryId }: { inquiryId: string }) {
  return (
    <ActionForm action={addInquiryNoteAction} resetOnSuccess className="grid gap-3">
      <input type="hidden" name="inquiry_id" value={inquiryId} />
      <textarea name="body" rows={3} maxLength={5000} className="adm-textarea !min-h-[90px]" placeholder="Add an internal note: call summary, next step, quote sent…" aria-label="New note" />
      <div className="flex justify-end"><SubmitButton pendingLabel="Adding…">Add note</SubmitButton></div>
    </ActionForm>
  );
}

export function DeleteNote({ id }: { id: string }) {
  return <ConfirmButton action={deleteInquiryNoteAction} fields={{ id }} label="" icon={<Trash2 size={13} />} className="adm-btn-sm adm-btn-ghost adm-btn-icon !h-7 !w-7" confirmTitle="Delete this note?" confirmBody="It will be removed for everyone." />;
}
