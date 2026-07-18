import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import ResumeBlock from "./ResumeBlock";

export default function PipelineTemplate({ data }: { data: ResumeData }) {
  const { contact, summary, experiences, education, skills, certifications, projects } = data;
  const allSkills = skills.flatMap((g) => g.items);

  return (
    <div
      id="resume-print-area"
      className="bg-[#0a0e1a] text-gray-100 font-mono text-[11px] leading-relaxed max-w-[900px] mx-auto min-h-[1100px] flex flex-col"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-[220px] bg-[#050810] border-r border-[#1a2540] flex-shrink-0 p-6 flex flex-col gap-5">
          <div>
            <h1 className="text-[15px] font-bold text-[#fff] tracking-tight leading-tight">{contact.fullName}</h1>
            <p className="text-[#3b82f6] text-[10px] mt-1 leading-snug">
              {data.experiences[0]?.jobTitle ?? "Professional"}
            </p>
            <p className="text-[#3b82f6] text-[10px] mt-0.5 font-bold">$ whoami</p>
          </div>

          <SidebarSection title="# CONTACT">
            {contact.email && <p className="text-gray-400">{contact.email}</p>}
            {contact.phone && <p className="text-gray-400">{contact.phone}</p>}
            {contact.linkedinUrl && <p className="text-[#3b82f6] break-all">in {contact.linkedinUrl.replace("https://", "")}</p>}
            {contact.githubUrl && <p className="text-[#3b82f6] break-all">{contact.githubUrl.replace("https://", "")}</p>}
            {contact.portfolioUrl && <p className="text-[#3b82f6] break-all">{contact.portfolioUrl.replace("https://", "")}</p>}
          </SidebarSection>

          <SidebarSection title="# TECHNICAL SKILLS">
            <div className="flex flex-wrap gap-1">
              {allSkills.slice(0, 30).map((s, i) => (
                <span key={i} className="text-[9px] bg-[#1a2540] border border-[#2a3560] rounded px-1 py-0.5 text-gray-300">{s}</span>
              ))}
            </div>
          </SidebarSection>

          {certifications.length > 0 && (
            <SidebarSection title="# CERTIFICATIONS">
              {certifications.map((c, i) => (
                <div key={i} className="mb-1.5">
                  <p className="text-gray-200 font-bold leading-tight">{c.title}</p>
                  <p className="text-gray-500">{c.issuer}{c.date ? ` · ${c.date}` : ""}</p>
                </div>
              ))}
            </SidebarSection>
          )}

          {education.length > 0 && (
            <SidebarSection title="# EDUCATION">
              {education.map((e, i) => (
                <div key={i} className="mb-1.5">
                  <p className="text-gray-200 font-bold leading-tight">{e.degree}</p>
                  <p className="text-gray-500">{e.institution}</p>
                  {e.endDate && <p className="text-gray-600">{e.startDate ? `${e.startDate} – ` : ""}{e.endDate}</p>}
                </div>
              ))}
            </SidebarSection>
          )}
        </div>

        {/* Right Main */}
        <div className="flex-1 p-7">
          {summary && (
            <div className="mb-6">
              <h2 className="text-[#3b82f6] font-bold text-xs mb-2 flex items-center gap-2">
                <span className="text-gray-600">1</span> SUMMARY
              </h2>
              <p className="text-gray-300 leading-relaxed">{summary}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-[#3b82f6] font-bold text-xs mb-3 flex items-center gap-2">
              <span className="text-gray-600">2</span> EXPERIENCE
            </h2>
            {experiences.map((exp, i) => (
              <ResumeBlock key={i} className="mb-5">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-[#fff] font-bold text-[12px]">{exp.jobTitle}</span>
                  <span className="text-gray-500 text-[9px]">
                    {exp.startDate} – {exp.isCurrent ? "Present" : (exp.endDate ?? "")}
                  </span>
                </div>
                <p className="text-[#3b82f6] text-[10px] mb-1.5">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                </p>
                <ul className="space-y-0.5">
                  {exp.responsibilities.map((r, j) => (
                    <li key={j} className="flex gap-2 text-gray-300">
                      <span className="text-[#3b82f6] flex-shrink-0 mt-0.5">▸</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                {exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {exp.technologies.map((t, j) => (
                      <span key={j} className="text-[9px] bg-[#1a2540] border border-[#2a3560] rounded px-1 py-0.5 text-gray-400">{t}</span>
                    ))}
                  </div>
                )}
              </ResumeBlock>
            ))}
          </div>

          {projects.length > 0 && (
            <div className="mt-6">
              <h2 className="text-[#3b82f6] font-bold text-xs mb-3 flex items-center gap-2">
                <span className="text-gray-600">3</span> PROJECTS
              </h2>
              {projects.map((p, i) => (
                <ResumeBlock key={i} className="mb-4">
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="text-[#fff] font-bold text-[11px]">{p.name}</span>
                    {p.url && <span className="text-gray-500 text-[9px]">{p.url}</span>}
                  </div>
                  <p className="text-gray-300">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.technologies.map((t, j) => (
                        <span key={j} className="text-[9px] bg-[#1a2540] border border-[#2a3560] rounded px-1 py-0.5 text-gray-400">{t}</span>
                      ))}
                    </div>
                  )}
                </ResumeBlock>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[#3b82f6] text-[9px] font-bold mb-1.5 uppercase tracking-widest">{title}</p>
      <div className="space-y-0.5 text-[10px]">{children}</div>
    </div>
  );
}
