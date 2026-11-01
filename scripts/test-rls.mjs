#!/usr/bin/env node
/**
 * Row Level Security test suite: runs the same requests as an anonymous visitor, an Editor and a Super Admin
 * against a real Supabase project (local by default) and checks each is allowed or denied as designed.
 * It creates two throwaway auth users + fixtures with the service-role key and removes them afterwards.
 * Usage: node scripts/test-rls.mjs        (reads .env.local)
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import { randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
for (const f of [".env.local", ".env"]) { const p = path.join(root, f); if (existsSync(p)) try { process.loadEnvFile(p); } catch {} }
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL, ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !ANON || !SERVICE) { console.error("Missing Supabase env"); process.exit(1); }
const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(URL_, SERVICE, opts);
const run = randomBytes(4).toString("hex");
const results = [];
const check = (name, pass, detail = "") => { results.push({ name, pass, detail }); console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`); };
const denied = (r) => !!r.error || (Array.isArray(r.data) && r.data.length === 0);

async function makeUser(role) {
  const email = `rls-${role}-${run}@example.test`; const password = randomBytes(18).toString("base64url");
  const { data, error } = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `RLS ${role}` } });
  if (error) throw error;
  if (role !== "none") { const r = await service.from("user_roles").insert({ user_id: data.user.id, role }); if (r.error) throw r.error; }
  const client = createClient(URL_, ANON, opts);
  const s = await client.auth.signInWithPassword({ email, password }); if (s.error) throw s.error;
  return { id: data.user.id, client };
}

// ---------- fixtures (service role)
const fx = {};
const ins = async (table, row) => { const r = await service.from(table).insert(row).select().single(); if (r.error) throw new Error(`${table}: ${r.error.message}`); return r.data; };
fx.draft = await ins("projects", { title: `RLS draft ${run}`, slug: `rls-draft-${run}`, status: "draft" });
fx.pub = await ins("projects", { title: `RLS published ${run}`, slug: `rls-pub-${run}`, status: "published", published_at: new Date().toISOString() });
fx.future = await ins("blog_posts", { title: `RLS scheduled ${run}`, slug: `rls-future-${run}`, status: "published", published_at: new Date(Date.now() + 864e5).toISOString() });
fx.unapproved = await ins("testimonials", { client_name: "RLS", body: "Not approved yet.", status: "published", is_approved: false });
fx.inquiry = await ins("inquiries", { full_name: "RLS Visitor", email: `rls-${run}@example.test`, service: "Other", description: "RLS fixture inquiry for testing." });
fx.inquiry2 = await ins("inquiries", { full_name: "RLS Visitor 2", email: `rls2-${run}@example.test`, service: "Other", description: "RLS fixture inquiry for testing (2)." });

const editor = await makeUser("editor");
const admin = await makeUser("super_admin");
const nobody = await makeUser("none"); // signed in, but no CMS role
const anon = createClient(URL_, ANON, opts);

try {
  // ---------- anonymous visitor
  let r = await anon.from("projects").select("id,slug").in("id", [fx.draft.id, fx.pub.id]);
  check("anon reads published projects only", !r.error && r.data.length === 1 && r.data[0].id === fx.pub.id, `${r.data?.length} rows`);
  r = await anon.from("projects").insert({ title: "x", slug: `anon-${run}` }).select();
  check("anon cannot insert projects", denied(r), r.error?.code);
  r = await anon.from("projects").update({ title: "hacked" }).eq("id", fx.pub.id).select();
  check("anon cannot update projects", denied(r));
  r = await anon.from("projects").delete().eq("id", fx.pub.id).select();
  check("anon cannot delete projects", denied(r));
  r = await anon.from("blog_posts").select("id").eq("id", fx.future.id);
  check("anon cannot see scheduled (future) posts", !r.error && r.data.length === 0);
  r = await anon.from("testimonials").select("id").eq("id", fx.unapproved.id);
  check("anon cannot see unapproved testimonials", !r.error && r.data.length === 0);
  r = await anon.from("inquiries").select("id");
  check("anon cannot read inquiries", denied(r));
  r = await anon.from("inquiries").insert({ full_name: "Bot", email: "bot@example.test", service: "Other", description: "direct REST insert attempt" }).select();
  check("anon cannot insert inquiries directly (must use validated server route)", denied(r), r.error?.code);
  r = await anon.from("site_settings").select("brand_name");
  check("anon reads site settings", !r.error && r.data.length === 1);
  r = await anon.from("site_settings").update({ brand_name: "HACKED" }).not("id", "is", null).select();
  check("anon cannot change site settings", denied(r));
  r = await anon.from("activity_logs").select("id"); check("anon cannot read activity log", denied(r));
  r = await anon.from("media_assets").select("id"); check("anon cannot list media library rows", denied(r));
  r = await anon.from("user_roles").select("id"); check("anon cannot read roles", denied(r));
  r = await anon.rpc("consume_rate_limit", { p_key: "x", p_limit: 1, p_window_seconds: 1 });
  check("anon cannot call the rate-limit function", !!r.error, r.error?.code);
  r = await anon.storage.from("media").upload(`rls/${run}-anon.txt`, new Blob(["x"], { type: "image/png" }));
  check("anon cannot upload to storage", !!r.error);
  r = await anon.auth.signUp({ email: `signup-${run}@example.test`, password: randomBytes(16).toString("hex") });
  check("public sign-up is disabled", !!r.error, r.error?.message);

  // ---------- signed-in user without a CMS role
  r = await nobody.client.from("projects").select("id").eq("id", fx.draft.id);
  check("user without role cannot see drafts", !r.error && r.data.length === 0);
  r = await nobody.client.from("user_roles").insert({ user_id: nobody.id, role: "super_admin" }).select();
  check("user without role cannot grant themselves super_admin", denied(r), r.error?.code);
  r = await nobody.client.from("inquiries").select("id"); check("user without role cannot read inquiries", denied(r));

  // ---------- editor
  const ec = editor.client;
  r = await ec.from("projects").select("id").eq("id", fx.draft.id);
  check("editor sees drafts", !r.error && r.data.length === 1);
  r = await ec.from("projects").insert({ title: `Editor ${run}`, slug: `rls-ed-${run}`, status: "draft" }).select().single();
  check("editor can create projects", !r.error, r.error?.message); const edProj = r.data;
  r = await ec.from("projects").update({ status: "published", published_at: new Date().toISOString() }).eq("id", edProj?.id).select();
  check("editor can publish projects", !r.error && r.data.length === 1);
  r = await ec.from("projects").delete().eq("id", edProj?.id).select();
  check("editor can delete projects", !r.error && r.data.length === 1);
  r = await ec.from("inquiries").select("id").in("id", [fx.inquiry.id]);
  check("editor reads inquiries", !r.error && r.data.length === 1);
  r = await ec.from("inquiries").update({ status: "contacted" }).eq("id", fx.inquiry.id).select();
  check("editor can change inquiry status", !r.error && r.data[0]?.status === "contacted");
  r = await ec.from("inquiry_notes").insert({ inquiry_id: fx.inquiry.id, author_id: editor.id, body: "Called them." }).select();
  check("editor can add inquiry notes", !r.error);
  r = await ec.from("inquiry_notes").insert({ inquiry_id: fx.inquiry.id, author_id: admin.id, body: "spoofed author" }).select();
  check("editor cannot add notes as someone else", denied(r));
  r = await ec.from("inquiries").delete().eq("id", fx.inquiry.id).select();
  check("editor cannot delete inquiries", denied(r));
  r = await ec.from("site_settings").update({ brand_name: "HACKED" }).not("id", "is", null).select();
  check("editor cannot change site settings", denied(r));
  r = await ec.from("user_roles").update({ role: "super_admin" }).eq("user_id", editor.id).select();
  check("editor cannot promote themselves", denied(r));
  r = await ec.from("user_roles").insert({ user_id: nobody.id, role: "editor" }).select();
  check("editor cannot grant roles", denied(r), r.error?.code);
  const svc = await service.from("services").select("id").limit(1).single();
  r = await ec.from("services").delete().eq("id", svc.data.id).select();
  check("editor cannot delete services", denied(r));
  r = await ec.from("seo_pages").update({ meta_title: "VIOR ATELIER · Crafting Digital Experiences" }).eq("path", "/").select();
  check("editor can edit page SEO", !r.error && r.data.length === 1);
  r = await ec.from("seo_pages").insert({ path: `/rls-${run}`, label: "x" }).select();
  check("editor cannot add SEO page rows", denied(r));
  r = await ec.from("activity_logs").select("id").limit(1);
  check("editor reads activity log", !r.error && r.data.length >= 1);
  r = await ec.from("activity_logs").insert({ action: "fake", entity_type: "x" }).select();
  check("editor cannot forge activity log entries", denied(r));
  const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64"));
  r = await ec.storage.from("media").upload(`rls/${run}.png`, png, { contentType: "image/png" });
  check("editor can upload images to storage", !r.error, r.error?.message);
  r = await ec.storage.from("media").upload(`rls/${run}.html`, new Blob(["<script>"], { type: "text/html" }), { contentType: "text/html" });
  check("storage rejects non-image file types", !!r.error, r.error?.message);
  r = await ec.storage.from("media").remove([`rls/${run}.png`]);
  check("editor can delete storage objects", !r.error && r.data.length === 1);

  // ---------- super admin
  const ac = admin.client;
  const before = await service.from("site_settings").select("tagline").single();
  r = await ac.from("site_settings").update({ tagline: before.data.tagline }).not("id", "is", null).select();
  check("super admin can change site settings", !r.error && r.data.length === 1);
  r = await ac.from("user_roles").insert({ user_id: nobody.id, role: "editor" }).select();
  check("super admin can grant roles", !r.error);
  r = await ac.from("user_roles").delete().eq("user_id", nobody.id).select();
  check("super admin can revoke roles", !r.error && r.data.length === 1);
  r = await ac.from("inquiries").delete().eq("id", fx.inquiry2.id).select();
  check("super admin can delete inquiries", !r.error && r.data.length === 1);
  r = await ac.from("activity_logs").select("action,entity_type,actor_id").eq("actor_id", editor.id);
  check("activity log records editor actions with the real actor", !r.error && r.data.length >= 3, `${r.data?.length} entries`);
} finally {
  // ---------- cleanup
  await service.from("projects").delete().in("slug", [`rls-draft-${run}`, `rls-pub-${run}`, `rls-ed-${run}`]);
  await service.from("blog_posts").delete().eq("id", fx.future.id);
  await service.from("testimonials").delete().eq("id", fx.unapproved.id);
  await service.from("inquiries").delete().in("id", [fx.inquiry.id, fx.inquiry2.id]);
  await service.from("activity_logs").delete().or(`summary.ilike.%${run}%,summary.eq.RLS,summary.like.RLS Visitor%`);
  for (const u of [editor, admin, nobody]) { await service.from("user_roles").delete().eq("user_id", u.id); await service.auth.admin.deleteUser(u.id); }
  await service.from("activity_logs").delete().is("actor_id", null).eq("entity_type", "user_roles");
}
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} RLS checks passed`);
process.exit(failed.length ? 1 : 0);
