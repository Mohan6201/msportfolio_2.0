import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import ResumeBlock from "./ResumeBlock";

export default function BlueprintTemplate({ data }: { data: ResumeData }) {
  const { contact, summary, experiences, education, skills, certifications, projects } = data;
  const allSkills = skills.flatMap((g) => g.items);

  return (
    <div
      id="resume-print-area"
      className="text-[#1a2a4a] font-mono text-[11px] leading-relaxed max-w-[900px] mx-auto relative"
      style={{
        fontFamily: "monospace",
        backgroundColor: "#f0f4ff",
        backgroundImage: `
          linear-gradient(rgba(26,42,74,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(26,42,74,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Blueprint header strip */}
      <div className="bg-[#1a2a4a] text-[#fff] px-6 py-3 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-[#7ec8e3] font-bold">{contact.fullName?.toUpperCase()}</span>
          <span className="text-gray-400 mx-2">·</span>
          <span className="text-[10px] text-gray-300">{experiences[0]?.jobTitle ?? "Professional"}</span>
        </div>
        <div className="flex gap-4 text-[8px] text-gray-400 font-mono">
          <span>DWG: resume.arch</span>
          <span>REV: 2026.1</span>
          <span>SCALE: 1:1</span>
        </div>
      </div>

      <div className="p-7">
        {/* Contact row */}
        <div className="flex gap-4 flex-wrap text-[10px] text-[#2a4a7f] mb-6 pb-3 border-b border-[#1a2a4a]/20">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>{contact.phone}</span>}
          {contact.linkedinUrl && <span>in {contact.linkedinUrl.replace("https://", "")}</span>}
          {contact.githubUrl && <span>{contact.githubUrl.replace("https://", "")}</span>}
          {contact.portfolioUrl && <span>{contact.portfolioUrl.replace("https://", "")}</span>}
        </div>

        {summary && (
          <div className="mb-5">
            <BlueprintSection title="SUMMARY" comment="overview.md">
              <p className="text-[#1a2a4a]/80">{summary}</p>
            </BlueprintSection>
          </div>
        )}

        <BlueprintSection title="EXPERIENCE" comment="deployment.log">
          {experiences.map((exp, i) => (
            <ResumeBlock key={i} className="mb-4 border-l-2 border-[#1a2a4a]/20 pl-3">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-[#1a2a4a] text-[12px]">{exp.jobTitle}</span>
                <span className="text-[#1a2a4a]/50 text-[9px]">{exp.startDate} – {exp.isCurrent ? "Present" : (exp.endDate ?? "")}</span>
              </div>
              <p className="text-[#2a4a7f] text-[10px] mb-1">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
              <ul className="space-y-0.5">
                {exp.responsibilities.map((r, j) => (
                  <li key={j} className="flex gap-2 text-[#1a2a4a]/80">
                    <span className="text-[#2a4a7f] flex-shrink-0 mt-0.5">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {exp.technologies.length > 0 && (
                <p className="text-[9px] text-[#2a4a7f] mt-1">
                  <span className="font-bold">TOOLS:</span> {exp.technologies.join(" · ")}
                </p>
              )}
            </ResumeBlock>
          ))}
        </BlueprintSection>

        {projects.length > 0 && (
          <BlueprintSection title="PROJECTS" comment="projects.yaml">
            {projects.map((p, i) => (
              <ResumeBlock key={i} className="mb-3 border-l-2 border-[#1a2a4a]/20 pl-3">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-[#1a2a4a] text-[11px]">{p.name}</span>
                  {p.url && <span className="text-[#1a2a4a]/50 text-[9px]">{p.url}</span>}
                </div>
                <p className="text-[#1a2a4a]/80">{p.description}</p>
                {p.technologies.length > 0 && (
                  <p className="text-[9px] text-[#2a4a7f] mt-0.5">{p.technologies.join(" · ")}</p>
                )}
              </ResumeBlock>
            ))}
          </BlueprintSection>
        )}

        {/* Pipeline flow diagram */}
        <BlueprintSection title="DELIVERY ARCHITECTURE" comment="pipeline.tf">
          <div className="flex items-center justify-center gap-2 flex-wrap py-3">
            {["CODE", "BUILD", "TEST", "SCAN", "DEPLOY", "MONITOR"].map((stage, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <div className="bg-[#1a2a4a] text-[#fff] text-[9px] font-bold px-3 py-1.5 rounded">
                  {stage}
                </div>
                {i < arr.length - 1 && <span className="text-[#1a2a4a]/40">→</span>}
              </div>
            ))}
          </div>
        </BlueprintSection>

        {allSkills.length > 0 && (
          <BlueprintSection title="TECHNICAL SKILLS" comment="stack.yaml">
            <div className="grid grid-cols-2 gap-2">
              {skills.map((group, i) => (
                <div key={i}>
                  <p className="text-[9px] text-[#2a4a7f] uppercase tracking-widest font-bold mb-0.5">{group.category}</p>
                  <p className="text-[#1a2a4a]/70">{group.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </BlueprintSection>
        )}

        {certifications.length > 0 && (
          <BlueprintSection title="CERTIFICATIONS" comment="certs.json">
            {certifications.map((c, i) => (
              <div key={i} className="flex justify-between text-[10px] mb-1">
                <span className="font-bold text-[#1a2a4a]">{c.title}</span>
                <span className="text-[#1a2a4a]/50">{c.issuer}{c.date ? ` · ${c.date}` : ""}</span>
              </div>
            ))}
          </BlueprintSection>
        )}

        {education.length > 0 && (
          <BlueprintSection title="EDUCATION" comment="edu.md">
            {education.map((e, i) => (
              <div key={i} className="flex justify-between text-[10px] mb-1">
                <div>
                  <span className="font-bold text-[#1a2a4a]">{e.degree}</span>
                  <span className="text-[#1a2a4a]/60"> · {e.institution}</span>
                </div>
                <span className="text-[#1a2a4a]/40">{e.endDate ?? ""}</span>
              </div>
            ))}
          </BlueprintSection>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#1a2a4a] text-[#fff] px-6 py-2 flex justify-end text-[8px] text-gray-400">
        <span>{contact.fullName?.toUpperCase()} · {experiences[0]?.jobTitle?.toUpperCase()}</span>
      </div>
    </div>
  );
}

function BlueprintSection({ title, comment, children }: { title: string; comment: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#1a2a4a] border-b border-[#1a2a4a]/30 pb-0.5 flex-1">
          {title}
        </h2>
        <span className="text-[9px] text-[#1a2a4a]/40">// {comment}</span>
      </div>
      {children}
    </div>
  );
}
