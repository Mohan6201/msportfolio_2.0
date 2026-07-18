import type { ResumeData } from "@/ai/schemas/resumeExtraction";
import ResumeBlock from "./ResumeBlock";

export default function TerminalTemplate({ data }: { data: ResumeData }) {
  const { contact, summary, experiences, education, skills, certifications, projects } = data;

  return (
    <div
      id="resume-print-area"
      className="bg-[#0d1117] text-gray-100 font-mono text-[11px] leading-relaxed max-w-[900px] mx-auto"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      {/* Terminal title bar */}
      <div className="bg-[#1c2128] border-b border-[#30363d] px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] text-gray-400">
          {contact.email?.split("@")[0] ?? "user"}@devops: ~/resume — zsh
        </span>
      </div>

      <div className="p-7">
        {/* Header */}
        <div className="mb-5 border-b border-[#30363d] pb-5">
          <h1 className="text-[22px] font-bold text-[#fff] tracking-tight">{contact.fullName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#3fb950]">$</span>
            <span className="text-gray-400">./role --title "{experiences[0]?.jobTitle ?? "Professional"}"</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
            {contact.email && <span>mail: {contact.email}</span>}
            {contact.phone && <span>| tel: {contact.phone}</span>}
            {contact.linkedinUrl && <span>| in: {contact.linkedinUrl.replace("https://", "")}</span>}
            {contact.githubUrl && <span>| git: {contact.githubUrl.replace("https://", "")}</span>}
            {contact.portfolioUrl && <span>| web: {contact.portfolioUrl.replace("https://", "")}</span>}
          </div>
        </div>

        {summary && (
          <div className="mb-5">
            <TermCmd dir="~/about" cmd="cat summary.md" />
            <p className="text-gray-300 mt-2 leading-relaxed">{summary}</p>
          </div>
        )}

        <div className="mb-5">
          <TermCmd dir="~/work" cmd="ls -la ./experience" />
          <div className="mt-3 space-y-5">
            {experiences.map((exp, i) => (
              <ResumeBlock key={i}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[#58a6ff] font-bold text-[12px]">{exp.jobTitle}</span>
                  <span className="text-gray-500 text-[9px]">{exp.startDate} – {exp.isCurrent ? "Present" : (exp.endDate ?? "")}</span>
                </div>
                <p className="text-[#3fb950] text-[10px] mb-1.5">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                </p>
                <ul className="space-y-0.5">
                  {exp.responsibilities.map((r, j) => (
                    <li key={j} className="flex gap-2 text-gray-300">
                      <span className="text-[#3fb950] flex-shrink-0">▸</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                {exp.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {exp.technologies.map((t, j) => (
                      <span key={j} className="text-[9px] bg-[#21262d] border border-[#30363d] rounded px-1.5 py-0.5 text-[#58a6ff]">{t}</span>
                    ))}
                  </div>
                )}
              </ResumeBlock>
            ))}
          </div>
        </div>

        {projects.length > 0 && (
          <div className="mb-5">
            <TermCmd dir="~/projects" cmd="ls -la ./side-projects" />
            <div className="mt-3 space-y-4">
              {projects.map((p, i) => (
                <ResumeBlock key={i}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#58a6ff] font-bold text-[11px]">{p.name}</span>
                    {p.url && <span className="text-gray-500 text-[9px]">{p.url}</span>}
                  </div>
                  <p className="text-gray-300 mt-0.5">{p.description}</p>
                  {p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.technologies.map((t, j) => (
                        <span key={j} className="text-[9px] bg-[#21262d] border border-[#30363d] rounded px-1.5 py-0.5 text-[#58a6ff]">{t}</span>
                      ))}
                    </div>
                  )}
                </ResumeBlock>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mb-5">
            <TermCmd dir="~/stack" cmd="./skills.sh --all" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {skills.map((group, i) => (
                <div key={i}>
                  <p className="text-[#3fb950] text-[9px] uppercase tracking-widest mb-0.5">{group.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((item, j) => (
                      <span key={j} className="text-[9px] bg-[#21262d] border border-[#30363d] rounded px-1 py-0.5 text-gray-300">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="mb-5">
            <TermCmd dir="~/certs" cmd="cat certifications.md" />
            <div className="mt-2 space-y-1">
              {certifications.map((c, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-gray-200">{c.title}</span>
                  <span className="text-gray-500">{c.issuer}{c.date ? ` · ${c.date}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="mb-5">
            <TermCmd dir="~/education" cmd="cat degrees.md" />
            <div className="mt-2 space-y-1">
              {education.map((e, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-gray-200">{e.degree} · {e.institution}</span>
                  <span className="text-gray-500">{e.endDate ?? ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#30363d] pt-2 text-[9px] text-gray-600 flex justify-end">
          <span>{contact.fullName?.toLowerCase()} · {experiences[0]?.jobTitle?.toLowerCase()}</span>
        </div>
      </div>
    </div>
  );
}

function TermCmd({ dir, cmd }: { dir: string; cmd: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-[#3fb950] font-bold">▶</span>
      <span className="text-[#58a6ff]">{dir}</span>
      <span className="text-gray-500">{cmd}</span>
    </div>
  );
}
