/** Locale-default date + time string, e.g. for admin-facing created_at timestamps. */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}
