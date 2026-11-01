"use client";
import { createContext, startTransition, useActionState, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  at?: number;
  data?: Record<string, unknown>;
} | null;
export type FormAction = (prev: ActionState, fd: FormData) => Promise<ActionState>;

/* ------------------------------------------------------------------ toasts */
type Toast = { id: number; ok: boolean; message: string };
const EVT = "adm-toast";

export function toast(message: string, ok = true) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(EVT, { detail: { message, ok } }));
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ message: string; ok: boolean }>).detail;
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs.slice(-2), { id, ...d }]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), d.ok ? 3800 : 6500);
    };
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  return (
    <div className="adm-toast-wrap" aria-live="polite" role="status">
      {items.map((t) => (
        <div key={t.id} className={cn("adm-toast", !t.ok && "adm-toast-error")} data-testid="toast">
          {t.ok ? <CheckCircle2 size={16} className="text-[#C9B78F] shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => setItems((xs) => xs.filter((x) => x.id !== t.id))} className="opacity-60 hover:opacity-100"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}

/** Shows a toast once when a URL flag is present (e.g. after a redirect). */
export function FlashToast({ message, ok = true }: { message: string; ok?: boolean }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    toast(message, ok);
    const url = new URL(window.location.href);
    ["created", "saved", "deleted", "password", "error", "invited"].forEach((k) => url.searchParams.delete(k));
    window.history.replaceState(null, "", url.toString());
  }, [message, ok]);
  return null;
}

/* ------------------------------------------------------------------ buttons */
const PendingContext = createContext<{ pending: boolean; submitter: { name: string; value: string } | null } | null>(null);

export function SubmitButton({ children, className, pendingLabel, variant = "primary", name, value, disabled, onClick }: {
  children: ReactNode; className?: string; pendingLabel?: string; variant?: "primary" | "gold" | "default" | "danger" | "ghost";
  name?: string; value?: string; disabled?: boolean; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const status = useFormStatus();
  const ctx = useContext(PendingContext);
  const pending = ctx ? ctx.pending : status.pending;
  // When several submit buttons share a form, only the one that was pressed shows the spinner.
  const mine = pending && (!name || (ctx ? ctx.submitter?.name === name && ctx.submitter?.value === value : status.data?.get(name) === value));
  return (
    <button
      type="submit" name={name} value={value} disabled={pending || disabled} onClick={onClick}
      aria-busy={mine}
      className={cn("adm-btn", variant === "primary" && "adm-btn-primary", variant === "gold" && "adm-btn-gold", variant === "danger" && "adm-btn-danger", variant === "ghost" && "adm-btn-ghost", className)}
    >
      {mine && <span className="adm-spin" aria-hidden />}
      {mine && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/* ------------------------------------------------------------------ action form */
export function ActionForm({ action, children, className, onSuccess, resetOnSuccess, inline, id, toastOnSuccess = true }: {
  action: FormAction; children: ReactNode | ((state: ActionState) => ReactNode); className?: string;
  onSuccess?: (s: NonNullable<ActionState>) => void; resetOnSuccess?: boolean; inline?: boolean; id?: string; toastOnSuccess?: boolean;
}) {
  // Toast as soon as the action resolves (not in an effect): the form may unmount in the same
  // refresh, e.g. when the row it belongs to is deleted.
  const toastRef = useRef(toastOnSuccess);
  toastRef.current = toastOnSuccess;
  const actionRef = useRef(action);
  actionRef.current = action;
  const wrapped = useCallback<FormAction>(async (prev, fd) => {
    const r = await actionRef.current(prev, fd);
    if (r) { if (!r.ok) toast(r.message, false); else if (toastRef.current) toast(r.message, true); }
    return r;
  }, []);
  const [state, formAction, pending] = useActionState(wrapped, null);
  const [submitter, setSubmitter] = useState<{ name: string; value: string } | null>(null);
  const ref = useRef<HTMLFormElement>(null);
  const last = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!state || state.at === last.current) return;
    last.current = state.at;
    if (state.ok) {
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.(state);
    }
  }, [state, onSuccess, resetOnSuccess]);
  return (
    <form
      ref={ref} className={className} id={id} noValidate
      // Submitting manually (instead of <form action>) stops React from resetting every field after each save.
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (pending) return;
        const btn = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        setSubmitter(btn?.name ? { name: btn.name, value: btn.value } : null);
        const fd = new FormData(e.currentTarget, btn);
        startTransition(() => formAction(fd));
      }}
    >
      <PendingContext.Provider value={{ pending, submitter }}>
      <FieldErrorsContext.Provider value={state?.fieldErrors ?? {}}>
        {typeof children === "function" ? children(state) : children}
        {inline && state && (
          <p className={cn("adm-inline-msg mt-4", state.ok ? "adm-inline-ok" : "adm-inline-err")} role={state.ok ? "status" : "alert"}>{state.message}</p>
        )}
      </FieldErrorsContext.Provider>
      </PendingContext.Provider>
    </form>
  );
}

const FieldErrorsContext = createContext<Record<string, string>>({});
export function useFieldError(name: string) {
  return useContext(FieldErrorsContext)[name];
}

/* ------------------------------------------------------------------ fields */
export function Field({ label, name, hint, children, className, counter }: { label: string; name?: string; hint?: ReactNode; children: ReactNode; className?: string; counter?: ReactNode }) {
  const err = useFieldError(name ?? "");
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label className="adm-label" htmlFor={name}>{label}</label>
        {counter}
      </div>
      {children}
      {err ? <p className="adm-error">{err}</p> : hint ? <p className="adm-hint">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ label, name, hint, className, ...rest }: { label: string; name: string; hint?: ReactNode; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const err = useFieldError(name);
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <input id={name} name={name} className="adm-input" aria-invalid={!!err} {...rest} />
    </Field>
  );
}

export function TextArea({ label, name, hint, className, rows = 4, ...rest }: { label: string; name: string; hint?: ReactNode; className?: string; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const err = useFieldError(name);
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <textarea id={name} name={name} rows={rows} className="adm-textarea" aria-invalid={!!err} {...rest} />
    </Field>
  );
}

export function Select({ label, name, hint, className, options, ...rest }: { label: string; name: string; hint?: ReactNode; className?: string; options: { value: string; label: string }[] } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      <select id={name} name={name} className="adm-select" {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Switch({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: ReactNode }) {
  return (
    <div>
      <label className="adm-switch">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
        <span className="text-[13.5px] font-medium text-[#1B2438]">{label}</span>
      </label>
      {hint && <p className="adm-hint ml-[46px] mt-1">{hint}</p>}
    </div>
  );
}

/** Counts characters live; turns amber past the ideal length. */
export function CountedInput({ label, name, defaultValue, ideal, max, hint, multiline, onValue, placeholder }: {
  label: string; name: string; defaultValue?: string | null; ideal: number; max: number; hint?: ReactNode; multiline?: boolean; onValue?: (v: string) => void; placeholder?: string;
}) {
  const [v, setV] = useState(defaultValue ?? "");
  const err = useFieldError(name);
  const over = v.length > ideal;
  const counter = <span className={cn("text-[11px] tabular-nums", over ? "text-[#A8946A] font-semibold" : "text-[#A9A69C]")}>{v.length} / {ideal}</span>;
  const common = { id: name, name, value: v, maxLength: max, placeholder, "aria-invalid": !!err, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setV(e.target.value); onValue?.(e.target.value); } };
  return (
    <Field label={label} name={name} hint={hint} counter={counter}>
      {multiline ? <textarea rows={3} className="adm-textarea !min-h-[84px]" {...common} /> : <input className="adm-input" {...common} />}
    </Field>
  );
}

/* ------------------------------------------------------------------ confirm */
export function ConfirmButton({ action, fields, label, confirmTitle, confirmBody, confirmLabel = "Delete", variant = "danger", className, icon, onDone }: {
  action: FormAction; fields: Record<string, string>; label: ReactNode; confirmTitle: string; confirmBody?: ReactNode; confirmLabel?: string;
  variant?: "danger" | "default"; className?: string; icon?: ReactNode; onDone?: (s: NonNullable<ActionState>) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={cn("adm-btn", variant === "danger" && "adm-btn-danger", className)} onClick={() => setOpen(true)}>
        {icon}{label}
      </button>
      {open && createPortal(
        <div className="adm-modal" role="dialog" aria-modal="true" aria-label={confirmTitle} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="adm-modal-panel">
            <p className="adm-h2">{confirmTitle}</p>
            {confirmBody && <div className="mt-2 text-[14px] adm-muted">{confirmBody}</div>}
            <ActionForm action={action} className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2" onSuccess={(s) => { setOpen(false); onDone?.(s); }}>
              {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
              <button type="button" className="adm-btn" onClick={() => setOpen(false)}>Cancel</button>
              <SubmitButton variant={variant === "danger" ? "primary" : "primary"} className={variant === "danger" ? "!bg-[#9B3B2F] !border-[#9B3B2F]" : ""} pendingLabel="Working…">{confirmLabel}</SubmitButton>
            </ActionForm>
          </div>
        </div>, document.body
      )}
    </>
  );
}
