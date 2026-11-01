#!/usr/bin/env node
// Provision a CMS user (the first Super Admin, or anyone else) without any public signup.
//
//   node scripts/create-admin.mjs --email owner@vioratelier.com --name "Atif" [--role super_admin|editor]
//
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment (or .env.local).
// Password: ADMIN_PASSWORD from the environment, otherwise a strong random one printed ONCE.
// Idempotent: an existing user is found and only their role/name are updated (password untouched
// unless ADMIN_PASSWORD is set).
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const f of [".env.local", ".env"]) {
  if (existsSync(f)) { try { process.loadEnvFile(f); } catch { /* older node */ } }
}

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}
function die(msg) { console.error(`✖ ${msg}`); process.exit(1); }

const email = arg("email")?.trim().toLowerCase();
const name = arg("name")?.trim();
const role = arg("role") ?? "super_admin";
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) die('Usage: node scripts/create-admin.mjs --email you@example.com --name "Your Name" [--role super_admin|editor]');
if (!["super_admin", "editor"].includes(role)) die("--role must be super_admin or editor");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) die("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (env or .env.local).");

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

function strongPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%^*-_=+";
  const bytes = randomBytes(24);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function findUser(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) die(`Could not list users: ${error.message}`);
    const hit = data.users.find((u) => u.email?.toLowerCase() === target);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

const envPassword = process.env.ADMIN_PASSWORD;
if (envPassword && envPassword.length < 10) die("ADMIN_PASSWORD must be at least 10 characters.");

let user = await findUser(email);
let generated = null;
if (!user) {
  const password = envPassword ?? (generated = strongPassword());
  const { data, error } = await supabase.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: name ? { full_name: name } : {},
  });
  if (error) die(`Could not create user: ${error.message}`);
  user = data.user;
  console.log(`✔ Created user ${email}`);
} else {
  console.log(`• User ${email} already exists (${user.id})`);
  if (envPassword) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, { password: envPassword });
    if (error) die(`Could not set password: ${error.message}`);
    console.log("✔ Password updated from ADMIN_PASSWORD");
  }
}

// profile row is created by the on_auth_user_created trigger; make sure the name is set
const { error: pErr } = await supabase.from("profiles").upsert({ id: user.id, email, ...(name ? { full_name: name } : {}) }, { onConflict: "id" });
if (pErr) die(`Could not update profile: ${pErr.message}`);

const { error: rErr } = await supabase.from("user_roles").upsert({ user_id: user.id, role }, { onConflict: "user_id" });
if (rErr) die(`Could not set role: ${rErr.message}`);
console.log(`✔ Role: ${role === "super_admin" ? "Super Admin" : "Editor"}`);

if (generated) {
  console.log("\n  Password (shown once, store it in a password manager now):\n");
  console.log(`  ${generated}\n`);
}
