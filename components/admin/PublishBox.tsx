"use client";
import type { ReactNode } from "react";
import { SubmitButton } from "@/components/admin/forms";
import { StatusPill } from "@/components/admin/StatusPill";

/** Save / Publish / Unpublish controls. Sends _intent = save | publish | unpublish. */
export function PublishBox({ status, children, extra, isNew }: { status: "draft" | "published"; children?: ReactNode; extra?: ReactNode; isNew?: boolean }) {
  return (
    <div className="adm-card adm-card-pad">
      <div className="mb-4 flex items-center justify-between">
        <p className="adm-label !mb-0">Status</p>
        <StatusPill status={status} />
      </div>
      <input type="hidden" name="status" value={status} />
      {children}
      <div className="mt-4 grid gap-2">
        {status === "draft" ? (
          <>
            <SubmitButton name="_intent" value="publish" variant="primary" pendingLabel="Publishing…" className="w-full">Publish</SubmitButton>
            <SubmitButton name="_intent" value="save" variant="default" pendingLabel="Saving…" className="w-full">{isNew ? "Save as draft" : "Save draft"}</SubmitButton>
          </>
        ) : (
          <>
            <SubmitButton name="_intent" value="save" variant="primary" pendingLabel="Saving…" className="w-full">Update</SubmitButton>
            <SubmitButton name="_intent" value="unpublish" variant="default" pendingLabel="Unpublishing…" className="w-full">Unpublish</SubmitButton>
          </>
        )}
      </div>
      {extra}
    </div>
  );
}
