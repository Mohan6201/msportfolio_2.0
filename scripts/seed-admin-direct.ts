#!/usr/bin/env tsx
/**
 * Direct admin seed — bypasses Better Auth's HTTP layer.
 * Uses Node crypto.scrypt with the same params Better Auth uses,
 * then inserts directly into users + accounts tables via Drizzle.
 */
import { randomBytes, scrypt } from "node:crypto";
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

const OWNER_NAME     = "Mohana Srinivasan";
const OWNER_EMAIL    = "mohandevopssme@gmail.com";
const OWNER_PASSWORD = "MSAdmin2025!";

function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (err, key) => {
        if (err) reject(err);
        else resolve(`${salt}:${key.toString("hex")}`);
      }
    );
  });
}

const { db }       = await import("../src/db/client.js");
const { users, accounts } = await import("../src/db/schema/auth.js");
const { eq }       = await import("drizzle-orm");

console.log("🔑  Setting up admin account (direct insert)…");

const existing = await db.select().from(users).where(eq(users.email, OWNER_EMAIL));
if (existing.length > 0) {
  await db.update(users).set({ role: "owner" }).where(eq(users.email, OWNER_EMAIL));
  console.log(`  ✔  User already exists — role set to owner`);
  process.exit(0);
}

const userId  = crypto.randomUUID();
const acctId  = crypto.randomUUID();
const now     = new Date();
const hashed  = await hashPassword(OWNER_PASSWORD);

await db.insert(users).values({
  id: userId,
  name: OWNER_NAME,
  email: OWNER_EMAIL,
  emailVerified: true,
  role: "owner",
  createdAt: now,
  updatedAt: now,
});

await db.insert(accounts).values({
  id: acctId,
  accountId: OWNER_EMAIL,
  providerId: "credential",
  userId,
  password: hashed,
  createdAt: now,
  updatedAt: now,
});

console.log(`  ✔  Owner account created: ${OWNER_EMAIL}`);
console.log(`  ✔  Password: ${OWNER_PASSWORD}  ← change after first login`);
console.log("\n✅  Done! Visit https://m-s-r-portfolio.vercel.app/admin/login");
process.exit(0);
