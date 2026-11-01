"use client";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginAction, forgotPasswordAction, resetPasswordAction } from "@/lib/admin/actions/auth";
import { SubmitButton, type ActionState } from "@/components/admin/forms";
import { createBrowserSupabase } from "@/lib/supabase/client";

function Msg({ state }: { state: ActionState }) {
  if (!state) return null;
  return <p role={state.ok ? "status" : "alert"} className={`adm-inline-msg ${state.ok ? "adm-inline-ok" : "adm-inline-err"}`}>{state.message}</p>;
}

function PasswordInput({ name, autoComplete, placeholder, id }: { name: string; autoComplete: string; placeholder?: string; id?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id ?? name} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required placeholder={placeholder} className="adm-input adm-input-lg pr-12" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-md text-[#7A786F] hover:text-[#1B2438]" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

export function LoginForm({ next, notice }: { next?: string; notice?: ActionState }) {
  const [state, action] = useActionState(loginAction, notice ?? null);
  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="adm-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@vioratelier.com" className="adm-input adm-input-lg" />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <label className="adm-label" htmlFor="password">Password</label>
          <Link href="/admin/forgot-password" className="text-[12px] font-medium text-[#A8946A] hover:text-[#1B2438]">Forgot password?</Link>
        </div>
        <PasswordInput name="password" autoComplete="current-password" />
      </div>
      <Msg state={state} />
      <SubmitButton className="adm-btn-lg w-full" pendingLabel="Signing in…">Sign in <ArrowRight size={16} /></SubmitButton>
    </form>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPasswordAction, null);
  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label className="adm-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="adm-input adm-input-lg" placeholder="you@vioratelier.com" />
      </div>
      <Msg state={state} />
      <SubmitButton className="adm-btn-lg w-full" pendingLabel="Sending…">Send reset link</SubmitButton>
    </form>
  );
}

export function ResetForm({ hasSession }: { hasSession: boolean }) {
  const [state, action] = useActionState(resetPasswordAction, null);
  const [ready, setReady] = useState(hasSession);
  const [bridgeFailed, setBridgeFailed] = useState(false);

  // Invite links (implicit flow) carry the session in the URL fragment: turn it into a cookie session.
  useEffect(() => {
    if (hasSession) return;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) { setBridgeFailed(true); return; }
    createBrowserSupabase().auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      window.history.replaceState(null, "", window.location.pathname);
      if (error) setBridgeFailed(true); else setReady(true);
    });
  }, [hasSession]);

  if (!ready && bridgeFailed) {
    return (
      <div className="space-y-4">
        <p className="adm-inline-msg adm-inline-err">This link has expired or was already used.</p>
        <Link href="/admin/forgot-password" className="adm-btn adm-btn-primary adm-btn-lg w-full">Request a new link</Link>
      </div>
    );
  }
  if (!ready) return <p className="adm-muted text-[14px]">Checking your link…</p>;

  return (
    <form action={action} className="space-y-5" noValidate>
      <div>
        <label className="adm-label" htmlFor="password">New password</label>
        <PasswordInput name="password" autoComplete="new-password" />
        <p className="adm-hint">At least 10 characters. A short sentence works well.</p>
      </div>
      <div>
        <label className="adm-label" htmlFor="confirm">Confirm password</label>
        <PasswordInput name="confirm" autoComplete="new-password" />
      </div>
      <Msg state={state} />
      <SubmitButton className="adm-btn-lg w-full" pendingLabel="Saving…">Set password &amp; continue</SubmitButton>
    </form>
  );
}
