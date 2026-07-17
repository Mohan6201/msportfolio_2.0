#!/usr/bin/env node
// react-pdf's PDF.js worker must be served as a static file whose version matches the installed
// pdfjs-dist exactly (a mismatch throws at runtime) — copying it from node_modules on every
// install keeps it in sync automatically instead of relying on someone remembering to redo it
// after a version bump.
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destDir = join(__dirname, "..", "public", "pdf-worker");
const dest = join(destDir, "pdf.worker.min.mjs");

if (!existsSync(src)) {
  console.warn("pdfjs-dist worker not found — skipping copy (is pdfjs-dist installed?)");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log(`Copied PDF.js worker -> public/pdf-worker/pdf.worker.min.mjs`);
