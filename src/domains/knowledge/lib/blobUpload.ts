// src/domains/knowledge/lib/blobUpload.ts
// Shared constant between the token route (server) and the upload UI
// (client) for the KT document direct-to-Blob upload flow. Kept in its own
// file (rather than exported from the route.ts) so client components can
// import it without pulling `next/server` / `@vercel/blob/client`'s server
// helpers into the client bundle.

/** Returned by POST /api/kt-upload/token when BLOB_READ_WRITE_TOKEN isn't
 *  configured, so the client knows to fall back to the legacy multipart
 *  upload path instead of treating it as a generic failure. */
export const BLOB_NOT_CONFIGURED_CODE = "blob_not_configured";
