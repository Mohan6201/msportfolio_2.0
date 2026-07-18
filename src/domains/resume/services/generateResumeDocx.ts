import { Document, Paragraph, TextRun, HeadingLevel, Packer, AlignmentType } from "docx";
import type { ResumeData } from "@/ai/schemas/resumeExtraction";

// Server-only. One universal, clean, single-column ATS-safe DOCX layout — deliberately
// independent of whichever visual template the user picked for the PDF export. DOCX/TXT exports
// exist for ATS-parseable content, not visual flourish; real products (Rezi, Teal) generate one
// clean DOCX regardless of visual template for exactly this reason. This file must never be
// imported by a "use client" component — the `docx` package is meant for Node, and importing it
// client-side would silently balloon the browser bundle. Only src/app/api/account/resume/export
// should ever import this.
export async function generateResumeDocx(data: ResumeData): Promise<Buffer> {
  const { contact, summary, experiences, education, skills, certifications, projects } = data;

  const heading = (text: string) =>
    new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 } });

  const bullet = (text: string) =>
    new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 40 } });

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: contact.fullName, bold: true, size: 32 })],
    })
  );
  const contactLine = [contact.email, contact.phone, contact.location, contact.linkedinUrl, contact.githubUrl, contact.portfolioUrl]
    .filter(Boolean)
    .join("  |  ");
  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: contactLine, size: 20 })],
      })
    );
  }

  if (summary) {
    children.push(heading("Summary"));
    children.push(new Paragraph({ text: summary, spacing: { after: 120 } }));
  }

  if (experiences.length > 0) {
    children.push(heading("Experience"));
    for (const exp of experiences) {
      children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: exp.jobTitle, bold: true }),
            new TextRun({ text: `  —  ${exp.company}${exp.location ? `, ${exp.location}` : ""}` }),
          ],
        })
      );
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${exp.startDate} – ${exp.isCurrent ? "Present" : exp.endDate ?? ""}`,
              italics: true,
              size: 18,
            }),
          ],
        })
      );
      for (const r of exp.responsibilities) children.push(bullet(r));
      if (exp.technologies.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: `Technologies: ${exp.technologies.join(", ")}`, size: 18, italics: true })],
          })
        );
      }
    }
  }

  if (projects.length > 0) {
    children.push(heading("Projects"));
    for (const p of projects) {
      children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({ text: p.name, bold: true })],
        })
      );
      children.push(new Paragraph({ text: p.description, spacing: { after: 60 } }));
      if (p.technologies.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: `Technologies: ${p.technologies.join(", ")}`, size: 18, italics: true })],
          })
        );
      }
    }
  }

  if (education.length > 0) {
    children.push(heading("Education"));
    for (const e of education) {
      children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [
            new TextRun({ text: e.degree, bold: true }),
            new TextRun({ text: `  —  ${e.institution}` }),
          ],
        })
      );
      const range = [e.startDate, e.endDate].filter(Boolean).join(" – ");
      const details = [range, e.gpa ? `GPA: ${e.gpa}` : "", e.honors ?? ""].filter(Boolean).join("   ");
      if (details) {
        children.push(
          new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: details, size: 18, italics: true })] })
        );
      }
    }
  }

  if (skills.length > 0) {
    children.push(heading("Skills"));
    for (const group of skills) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${group.category}: `, bold: true }),
            new TextRun({ text: group.items.join(", ") }),
          ],
        })
      );
    }
  }

  if (certifications.length > 0) {
    children.push(heading("Certifications"));
    for (const c of certifications) {
      children.push(bullet(`${c.title} — ${c.issuer}${c.date ? ` (${c.date})` : ""}`));
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } }, // 11pt
      },
    },
  });

  return Packer.toBuffer(doc);
}
