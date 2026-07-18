import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import ResumeBlock from "./ResumeBlock";

export default function MinimalTemplate({ data }: { data: ResumeData }) {
  const { contact, summary, experiences, education, skills, certifications, projects } = data;

  return (
    <div
      id="resume-print-area"
      className="bg-[#fff] text-gray-900 text-[11px] leading-relaxed max-w-[800px] mx-auto p-10"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight uppercase">{contact.fullName}</h1>
        <p className="text-gray-600 text-[12px] mt-0.5">{experiences[0]?.jobTitle ?? "Professional"}</p>
        <div className="flex flex-wrap gap-x-2 text-[10px] text-gray-500 mt-1.5">
          {[contact.email, contact.phone, contact.linkedinUrl, contact.githubUrl, contact.portfolioUrl]
            .filter(Boolean)
            .map((v, i) => (
              <span key={i}>{i > 0 && "| "}{v}</span>
            ))}
        </div>
      </div>

      <hr className="border-gray-900 border mb-4" />

      {summary && (
        <div className="mb-4">
          <MinSection title="PROFESSIONAL SUMMARY">
            <p className="text-gray-700">{summary}</p>
          </MinSection>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-4">
          <MinSection title="TECHNICAL SKILLS">
            <div className="space-y-0.5">
              {skills.map((group, i) => (
                <p key={i} className="text-gray-700">
                  <span className="font-bold">{group.category}:</span>{" "}
                  {group.items.join(", ")}
                </p>
              ))}
            </div>
          </MinSection>
        </div>
      )}

      <div className="mb-4">
        <MinSection title="PROFESSIONAL EXPERIENCE">
          {experiences.map((exp, i) => (
            <ResumeBlock key={i} className="mb-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[12px]">{exp.jobTitle}</span>
                <span className="text-gray-500 text-[9px]">{exp.startDate} – {exp.isCurrent ? "Present" : (exp.endDate ?? "")}</span>
              </div>
              <p className="text-gray-600 text-[10px] mb-1">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
              <ul className="space-y-0.5">
                {exp.responsibilities.map((r, j) => (
                  <li key={j} className="flex gap-2 text-gray-700">
                    <span className="flex-shrink-0">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </ResumeBlock>
          ))}
        </MinSection>
      </div>

      {projects.length > 0 && (
        <div className="mb-4">
          <MinSection title="PROJECTS">
            {projects.map((p, i) => (
              <ResumeBlock key={i} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-[11px]">{p.name}</span>
                  {p.url && <span className="text-gray-500 text-[9px]">{p.url}</span>}
                </div>
                <p className="text-gray-700 mt-0.5">{p.description}</p>
                {p.technologies.length > 0 && (
                  <p className="text-gray-500 text-[10px] mt-0.5">{p.technologies.join(", ")}</p>
                )}
              </ResumeBlock>
            ))}
          </MinSection>
        </div>
      )}

      {certifications.length > 0 && (
        <div className="mb-4">
          <MinSection title="CERTIFICATIONS">
            <div className="space-y-0.5">
              {certifications.map((c, i) => (
                <ResumeBlock key={i} className="flex justify-between">
                  <span className="text-gray-700">· {c.title} — {c.issuer}</span>
                  {c.date && <span className="text-gray-500">{c.date}</span>}
                </ResumeBlock>
              ))}
            </div>
          </MinSection>
        </div>
      )}

      {education.length > 0 && (
        <MinSection title="EDUCATION">
          {education.map((e, i) => (
            <ResumeBlock key={i} className="flex justify-between mb-1">
              <div>
                <span className="font-bold">{e.degree}</span>
                <span className="text-gray-600"> · {e.institution}</span>
              </div>
              <span className="text-gray-500">{e.startDate && e.endDate ? `${e.startDate} – ${e.endDate}` : e.endDate ?? ""}</span>
            </ResumeBlock>
          ))}
        </MinSection>
      )}
    </div>
  );
}

function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-0.5 mb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}
