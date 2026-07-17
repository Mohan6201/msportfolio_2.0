// certifications.date is either a single date ("2025-09-09") or a range built by the admin's
// DateRangePicker ("2023-09-01 – Present" or "2023-09-01 – 2025-10-01"). Both sides of a range
// are ISO strings except the literal word "Present", which native Date can't parse. Shared by
// every place that displays or reasons about a certification date, so there's one parser to fix.
function splitDateRange(raw: string): { fromRaw: string; toRaw: string | null } {
  const parts = raw.split(" – ");
  return { fromRaw: parts[0]?.trim() ?? "", toRaw: parts[1]?.trim() || null };
}

function formatDatePart(raw: string): string {
  if (raw === "Present") return "Present";
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : d.toLocaleString("default", { month: "long", year: "numeric" });
}

export function formatCertDate(raw: string): string {
  if (!raw) return "";
  const { fromRaw, toRaw } = splitDateRange(raw);
  const from = formatDatePart(fromRaw);
  return toRaw ? `${from} – ${formatDatePart(toRaw)}` : from;
}

/** A cert is "in progress" if its date range ends in "Present", or its (single/end) date is
 * genuinely in the future — not simply because it lacks a public verification link. Plenty of
 * completed training programs don't issue a shareable credential URL, and treating that as
 * "unfinished" is misleading to anyone reading the certifications list. */
export function isCertInProgress(raw: string): boolean {
  if (!raw) return true;
  const { fromRaw, toRaw } = splitDateRange(raw);
  if (toRaw === "Present") return true;
  const d = new Date(toRaw ?? fromRaw);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() > Date.now();
}
