#!/usr/bin/env tsx
/**
 * Resets the owner account's credential password hash to a known value,
 * using better-auth's own hashPassword implementation directly (not a
 * reimplementation) so there's no risk of a params/format mismatch.
 *
 * Usage: DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/fix-admin-password.mjs
 * (env vars are loaded from .env.local / .env if not already set)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hashPassword } from "@better-auth/utils/password";

function loadEnvFile(filename) {
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

const OWNER_EMAIL    = "mohandevopssme@gmail.com";
const OWNER_PASSWORD = "MSAdmin2025!";

const { db } = await import("../src/db/client.js");
const { users, accounts } = await import("../src/db/schema/auth.js");
const { eq, and } = await import("drizzle-orm");

const [user] = await db.select().from(users).where(eq(users.email, OWNER_EMAIL));
if (!user) {
  console.error(`No user found for ${OWNER_EMAIL} on DATABASE_URL=${process.env.DATABASE_URL}`);
  process.exit(1);
}

const newHash = await hashPassword(OWNER_PASSWORD);

const result = await db
  .update(accounts)
  .set({ password: newHash, updatedAt: new Date() })
  .where(and(eq(accounts.userId, user.id), eq(accounts.providerId, "credential")))
  .returning();

if (result.length === 0) {
  console.error("No credential account row found to update — expected one to already exist.");
  process.exit(1);
}

console.log(`✔ Password reset for ${OWNER_EMAIL} on DATABASE_URL=${process.env.DATABASE_URL}`);
console.log(`  New password: ${OWNER_PASSWORD}`);
