#!/usr/bin/env tsx
/**
 * Creates the owner admin account in Better Auth.
 * Run once after setting up the project: npm run db:seed-admin
 *
 * Edit OWNER_EMAIL / OWNER_PASSWORD below before running.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filename: string) {
  try {
    const lines = readFileSync(resolve(process.cwd(), filename), "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* file not found */ }
}
loadEnvFile(".env.local");
loadEnvFile(".env");

// ── Config — edit these before running ────────────────────────────────────────
const OWNER_NAME     = "Mohana Srinivasan";
const OWNER_EMAIL    = "mohandevopssme@gmail.com";
const OWNER_PASSWORD = "MSAdmin2025!";     // change after first login
// ─────────────────────────────────────────────────────────────────────────────

const { auth } = await import("../src/auth/index.js");
const { db }   = await import("../src/db/client.js");
const { users } = await import("../src/db/schema/auth.js");
const { eq }    = await import("drizzle-orm");

console.log("🔑  Setting up admin account…");

// Check if user already exists
const existing = await db.select().from(users).where(eq(users.email, OWNER_EMAIL));
if (existing.length > 0) {
  console.log(`  ℹ  User already exists: ${OWNER_EMAIL}`);
  // Ensure role is owner
  await db.update(users).set({ role: "owner" }).where(eq(users.email, OWNER_EMAIL));
  console.log("  ✔  Role set to owner");
  process.exit(0);
}

// Create via Better Auth (handles password hashing)
const result = await auth.api.signUpEmail({
  body: { name: OWNER_NAME, email: OWNER_EMAIL, password: OWNER_PASSWORD },
});

if (!result || "error" in result) {
  console.error("  ✗  Failed to create user:", result);
  process.exit(1);
}

// Set role to owner
await db.update(users).set({ role: "owner" }).where(eq(users.email, OWNER_EMAIL));

console.log(`  ✔  Owner account created: ${OWNER_EMAIL}`);
console.log(`  ✔  Password: ${OWNER_PASSWORD}  ← change this after first login`);
console.log("\n✅  Done! Visit http://localhost:3000/admin/login to sign in.");
process.exit(0);
