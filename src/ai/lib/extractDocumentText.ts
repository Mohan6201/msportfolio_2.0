// Extracts raw text from an uploaded resume file server-side, before it ever reaches a model.
// Originally resumes were sent as raw file bytes straight to Gemini, which natively understands
// PDF documents. Migrating off Gemini exposed that none of the free open-weight vision models
// (Groq's llama-4-scout, OpenRouter's free vision models) actually accept generic PDF file
// input the same way — Groq rejects it outright ("'Non-image file content parts' functionality
// not supported"), and the OpenRouter fallback proved too slow/unreliable on real PDF payloads
// in testing. Resumes are almost always real text underneath (exported from Word/Docs/LaTeX,
// not scans), so extracting the text layer ourselves and handing plain text to the already-
// reliable TEXT_MODEL chain sidesteps the vision-model gap entirely instead of working around it.
export async function extractDocumentText(fileBytes: ArrayBuffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    // Legacy build is required outside a browser DOM — the standard build assumes
    // browser-only globals (matches the same pdfjs Node-vs-browser split that caused the
    // DOMMatrix SSR crash on the homepage resume preview).
    const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // pdfjs auto-disables the real Worker thread on Node and falls back to an in-process "fake
    // worker" — but that fallback still does `await import(GlobalWorkerOptions.workerSrc)`,
    // which defaults to the relative path "./pdf.worker.mjs". Turbopack bundles this module
    // into a chunks directory where that relative path doesn't resolve. import.meta.resolve and
    // createRequire(import.meta.url) both fail too — Turbopack rewrites import.meta.url to its
    // own virtual "[project]/..." scheme, not a real resolvable file:// URL. Building the path
    // from process.cwd() (the real project root at runtime) sidesteps all of that.
    const { join } = await import("node:path");
    const { pathToFileURL } = await import("node:url");
    GlobalWorkerOptions.workerSrc = pathToFileURL(
      join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
    ).href;
    const doc = await getDocument({ data: new Uint8Array(fileBytes) }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }
    return pages.join("\n\n");
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(fileBytes) });
    return value;
  }

  throw new Error(`Unsupported file type for text extraction: ${mimeType}`);
}
