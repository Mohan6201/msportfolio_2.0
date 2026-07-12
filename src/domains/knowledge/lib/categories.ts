// src/domains/knowledge/lib/categories.ts
// Single source of truth for KT document categories. Previously this list was
// hardcoded independently in 5 different files and had drifted out of sync
// (see: KTDocumentsTab dropdown offering categories the PATCH route rejected
// with 400 "Invalid category"). Every place that validates, lists, or filters
// by KT category should import KT_CATEGORIES / KTCategory from here instead
// of maintaining its own copy.

/** Canonical list of KT document categories, in display order. */
export const KT_CATEGORIES = [
  "AWS",
  "Docker",
  "Kubernetes",
  "Linux",
  "Terraform",
  "DevOps",
  "CI/CD",
  "Ansible",
  "Networking",
  "Azure",
  "Systems",
  "Cloud",
  "AI/ML",
] as const;

export type KTCategory = (typeof KT_CATEGORIES)[number];

/** Type guard for narrowing an arbitrary string to a known KTCategory. */
export function isKTCategory(value: string): value is KTCategory {
  return (KT_CATEGORIES as readonly string[]).includes(value);
}
