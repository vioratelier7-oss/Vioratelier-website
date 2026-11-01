import "server-only";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  /** bumps on every result so client effects fire even for identical messages */
  at?: number;
  data?: Record<string, unknown>;
} | null;

export function ok(message: string, data?: Record<string, unknown>): ActionState {
  return { ok: true, message, at: Date.now(), data };
}

export function fail(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { ok: false, message, fieldErrors, at: Date.now() };
}

type PgLike = { code?: string; message?: string; details?: string | null; hint?: string | null };

/** Turns a Postgres / PostgREST error into a sentence a studio owner understands. */
export function friendlyDbError(err: PgLike | null | undefined, context?: { unique?: string }): string {
  if (!err) return "Something went wrong. Please try again.";
  const code = err.code ?? "";
  const msg = err.message ?? "";
  if (code === "23505") return context?.unique ?? "That value is already in use. Please choose another.";
  if (code === "23503") return "This item is still linked to other content, so it can't be changed that way.";
  if (code === "23514" || code === "23502") {
    if (/slug/i.test(msg)) return "The slug may only contain lowercase letters, numbers and single hyphens.";
    return "Some values don't meet the required format. Please check the form.";
  }
  if (code === "P0001") return msg; // raised deliberately by our own triggers, already human
  if (code === "42501" || /row-level security/i.test(msg)) return "You don't have permission to do that.";
  if (code === "PGRST116") return "That item no longer exists, or you don't have access to it.";
  return "Couldn't save just now. Please try again.";
}

export function zodFieldErrors(e: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of e.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Wraps a server action body: auth / validation / unexpected errors become friendly ActionState. */
export async function guard(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    return await fn();
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
    if (e instanceof AuthError) return fail(e.message);
    if (e instanceof ZodError) {
      const fe = zodFieldErrors(e);
      return fail(Object.values(fe)[0] ?? "Please check the form.", fe);
    }
    console.error("[admin action]", e);
    return fail("Something went wrong. Please try again.");
  }
}

/** FormData helpers */
export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}
export function optStr(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v === "" ? null : v;
}
export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}
export function lines(fd: FormData, key: string): string[] {
  return str(fd, key).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
export function json<T>(fd: FormData, key: string, fallback: T): T {
  const v = str(fd, key);
  if (!v) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
}
