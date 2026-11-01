import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/admin/session";

/** Handles both PKCE (?code=) and token-hash (?token_hash=&type=) links from Supabase Auth emails. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  let next = safeNext(url.searchParams.get("next"));
  if (type === "invite" || type === "recovery") next = "/admin/reset-password";

  const supabase = await createSessionClient();
  let failed = true;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = !!error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    failed = !!error;
  } else if (next === "/admin/reset-password") {
    // Invite links minted with the service role use the implicit flow: the session rides the URL
    // fragment, which browsers keep across this redirect. The reset page's client bridge reads it.
    failed = false;
  }

  const dest = url.clone();
  dest.search = "";
  if (failed) {
    dest.pathname = "/admin/login";
    dest.searchParams.set("error", "link");
  } else {
    const [path, query] = next.split("?");
    dest.pathname = path;
    if (query) new URLSearchParams(query).forEach((v, k) => dest.searchParams.set(k, v));
  }
  return NextResponse.redirect(dest);
}
