import type { AtsScore } from "@/ai/schemas/atsScore";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

// Common DevOps/Cloud ATS keywords — matched against skills + experience technologies/bullets.
// This app's own resume data is entirely DevOps/Cloud-focused, so a dictionary scoped to that
// domain is far more useful here than a generic one.
const KEYWORD_DICTIONARY = [
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CI/CD", "Jenkins",
  "GitHub Actions", "Ansible", "Linux", "Python", "Bash", "Monitoring", "Prometheus",
  "Grafana", "IAM", "VPC", "Load Balancer", "Microservices", "REST API", "Agile",
  "Scrum", "Git", "SQL", "NoSQL", "Infrastructure as Code", "DevOps", "Site Reliability",
  "Automation", "Security", "Networking", "Nginx", "CloudWatch", "ECS", "Lambda",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Computes a real ATS score synchronously from already-loaded resume data — no network call,
 * no AI dependency, no failure mode. Meant to render instantly the moment a resume is
 * selected, so a score is never gated behind an AI call that might be slow, rate-limited, or
 * (as happened) outright down. The AI-driven scoreATS() agent still exists for a deeper,
 * qualitative pass (nuanced prose feedback, less mechanical keyword matching) layered on top
 * of this baseline, not replacing it.
 */
export function computeInstantAtsScore(data: ResumeData): AtsScore {
  const { contact, summary, experiences, education, skills } = data;

  // ── Contact Info ──
  const contactIssues: string[] = [];
  let contactScore = 0;
  if (contact.email) contactScore += 40; else contactIssues.push("Missing email address");
  if (contact.phone) contactScore += 20; else contactIssues.push("Missing phone number");
  if (contact.linkedinUrl) contactScore += 20; else contactIssues.push("Missing LinkedIn profile URL");
  if (contact.location) contactScore += 20; else contactIssues.push("Missing location");

  // ── Work Experience ──
  const expIssues: string[] = [];
  let expScore = 0;
  if (experiences.length === 0) {
    expIssues.push("No work experience listed");
  } else {
    expScore += 30;
    const withDates = experiences.filter(e => e.startDate).length;
    if (withDates === experiences.length) expScore += 15;
    else expIssues.push("Some roles are missing start dates");

    const withBullets = experiences.filter(e => e.responsibilities.length >= 2).length;
    expScore += (withBullets / experiences.length) * 25;
    if (withBullets < experiences.length) expIssues.push("Some roles have fewer than 2 bullet points");

    const hasQuantified = experiences.some(e => e.responsibilities.some(r => /\d/.test(r)));
    if (hasQuantified) expScore += 15;
    else expIssues.push("Add quantified achievements (numbers, %, metrics) to your bullet points");

    const withTech = experiences.filter(e => e.technologies.length > 0).length;
    expScore += (withTech / experiences.length) * 15;
    if (withTech < experiences.length) expIssues.push("List technologies used for each role");
  }

  // ── Education ──
  const eduIssues: string[] = [];
  let eduScore = 0;
  if (education.length === 0) {
    eduIssues.push("No education listed");
  } else {
    eduScore = 70;
    const complete = education.every(e => e.degree && e.institution);
    if (complete) eduScore += 30;
    else eduIssues.push("Some education entries are missing a degree or institution");
  }

  // ── Skills ──
  const skillIssues: string[] = [];
  const totalSkills = skills.reduce((sum, g) => sum + g.items.length, 0);
  let skillScore = 0;
  if (totalSkills === 0) {
    skillIssues.push("No skills listed");
  } else if (totalSkills < 5) {
    skillScore = 50;
    skillIssues.push("Add more skills — aim for 10 or more");
  } else if (totalSkills < 10) {
    skillScore = 75;
  } else {
    skillScore = 100;
  }
  if (totalSkills > 0 && skills.length < 2) {
    skillIssues.push("Group skills into categories (e.g. Cloud, DevOps, Languages)");
  }

  // ── Formatting (structural proxies only — can't see real PDF layout from JSON alone) ──
  const formatIssues: string[] = [];
  let formatScore = 100;
  if (!summary || summary.trim().length < 30) {
    formatScore -= 30;
    formatIssues.push("Add a professional summary (2-4 sentences)");
  } else if (summary.length > 600) {
    formatScore -= 10;
    formatIssues.push("Summary is quite long — aim for under 4 sentences");
  }
  const longBullets = experiences.flatMap(e => e.responsibilities).filter(r => r.length > 220).length;
  if (longBullets > 0) {
    formatScore -= 15;
    formatIssues.push(`${longBullets} bullet point(s) are very long — keep each to roughly one line`);
  }
  formatScore = clamp(formatScore);

  // ── Keywords ──
  const haystack = [
    ...skills.flatMap(g => g.items),
    ...experiences.flatMap(e => e.technologies),
    ...experiences.flatMap(e => e.responsibilities),
    summary ?? "",
  ].join(" ").toLowerCase();
  const found = KEYWORD_DICTIONARY.filter(k => haystack.includes(k.toLowerCase()));
  const missing = KEYWORD_DICTIONARY.filter(k => !found.includes(k)).slice(0, 12);

  const sections = {
    contactInfo:    { score: clamp(contactScore), issues: contactIssues },
    workExperience: { score: clamp(expScore),     issues: expIssues },
    education:      { score: clamp(eduScore),     issues: eduIssues },
    skills:         { score: clamp(skillScore),   issues: skillIssues },
    formatting:      { score: formatScore,         issues: formatIssues },
  };

  const overallScore = clamp(
    sections.contactInfo.score * 0.15 +
    sections.workExperience.score * 0.35 +
    sections.education.score * 0.10 +
    sections.skills.score * 0.20 +
    sections.formatting.score * 0.20
  );

  const strengths: string[] = [];
  if (sections.workExperience.score >= 80) strengths.push("Strong, well-documented work experience");
  if (sections.skills.score >= 80) strengths.push("Broad, well-organized skill coverage");
  if (sections.contactInfo.score === 100) strengths.push("Complete contact information");
  if (found.length >= 10) strengths.push("Good coverage of industry-standard keywords");
  if (strengths.length === 0) strengths.push("Resume successfully parsed and structured");

  const improvements = [...contactIssues, ...expIssues, ...eduIssues, ...skillIssues, ...formatIssues];

  return {
    overallScore,
    sections,
    strengths,
    improvements,
    keywords: { found, missing },
  };
}
