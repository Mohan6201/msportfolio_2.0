import type { ResumeData } from "@/ai/schemas/resumeExtraction";

// Plain-text ATS export — some older/simpler ATS parsers handle .txt more reliably than any
// formatted document. Pure string serialization, generated entirely client-side (no API call,
// no real bundle cost) — the same blob-download pattern downloadCoverLetter() in
// ResumeStudio.tsx already establishes for the cover letter's own .txt export.
export function generateResumeText(data: ResumeData): string {
  const lines: string[] = [];
  const { contact, summary, experiences, education, skills, certifications, projects } = data;

  lines.push(contact.fullName.toUpperCase());
  const contactLine = [contact.email, contact.phone, contact.location, contact.linkedinUrl, contact.githubUrl, contact.portfolioUrl]
    .filter(Boolean)
    .join(" | ");
  if (contactLine) lines.push(contactLine);
  lines.push("");

  if (summary) {
    lines.push("SUMMARY");
    lines.push(summary);
    lines.push("");
  }

  if (experiences.length > 0) {
    lines.push("EXPERIENCE");
    for (const exp of experiences) {
      lines.push(`${exp.jobTitle} — ${exp.company}${exp.location ? `, ${exp.location}` : ""}`);
      lines.push(`${exp.startDate} - ${exp.isCurrent ? "Present" : exp.endDate ?? ""}`);
      for (const r of exp.responsibilities) lines.push(`- ${r}`);
      if (exp.technologies.length > 0) lines.push(`Technologies: ${exp.technologies.join(", ")}`);
      lines.push("");
    }
  }

  if (projects.length > 0) {
    lines.push("PROJECTS");
    for (const p of projects) {
      lines.push(`${p.name}${p.url ? ` (${p.url})` : ""}`);
      lines.push(p.description);
      if (p.technologies.length > 0) lines.push(`Technologies: ${p.technologies.join(", ")}`);
      lines.push("");
    }
  }

  if (education.length > 0) {
    lines.push("EDUCATION");
    for (const e of education) {
      lines.push(`${e.degree} — ${e.institution}`);
      const range = [e.startDate, e.endDate].filter(Boolean).join(" - ");
      if (range) lines.push(range);
      if (e.gpa) lines.push(`GPA: ${e.gpa}`);
      if (e.honors) lines.push(e.honors);
      lines.push("");
    }
  }

  if (skills.length > 0) {
    lines.push("SKILLS");
    for (const group of skills) lines.push(`${group.category}: ${group.items.join(", ")}`);
    lines.push("");
  }

  if (certifications.length > 0) {
    lines.push("CERTIFICATIONS");
    for (const c of certifications) {
      lines.push(`${c.title} — ${c.issuer}${c.date ? ` (${c.date})` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}
