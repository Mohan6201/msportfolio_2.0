import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export default function DashboardTemplate({ data }: { data: ResumeData }) {
  const { contact, summary, experiences, education, skills, certifications } = data;

  return (
    <div
      id="resume-print-area"
      className="bg-[#0a0e1a] text-gray-100 font-sans text-[11px] leading-relaxed max-w-[900px] mx-auto"
    >
      {/* Header */}
      <div className="bg-[#060a14] border-b border-[#1a2540] px-8 pt-7 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#3b82f6] font-mono text-[10px] font-bold">M</span>
              <h1 className="text-[20px] font-bold text-[#fff] tracking-tight">{contact.fullName?.toUpperCase()}</h1>
            </div>
            <p className="text-gray-400 text-[11px]">{experiences[0]?.jobTitle ?? "Professional"}</p>
          </div>
          <div className="text-right space-y-0.5 text-[10px] text-gray-400">
            {contact.email && <p>{contact.email}</p>}
            {contact.phone && <p>{contact.phone}</p>}
            {contact.linkedinUrl && <p className="text-[#3b82f6]">in {contact.linkedinUrl.replace("https://", "")}</p>}
            {contact.githubUrl && <p className="text-[#3b82f6]">{contact.githubUrl.replace("https://", "")}</p>}
            {contact.portfolioUrl && <p className="text-gray-500">Open to roles · {contact.portfolioUrl.replace("https://", "")}</p>}
          </div>
        </div>

        {/* Metric cards */}
        <div className="flex gap-3 mt-5">
          {[
            { label: "BUILD TIME", value: "-75%" },
            { label: "MIGRATIONS", value: "0 DT" },
            { label: "PIPELINES", value: "100+" },
            { label: "ECS SERVICES", value: "10+" },
            { label: "AWS ACCTS", value: "3" },
          ].map((m, i) => (
            <div key={i} className="bg-[#1a2540] border border-[#2a3560] rounded-lg px-4 py-2 text-center flex-1">
              <p className="text-[8px] text-gray-500 uppercase tracking-widest">{m.label}</p>
              <p className="text-[16px] font-bold text-[#3b82f6] font-mono">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">
        {summary && (
          <div className="mb-6">
            <SectionTitle icon="◈" title="PROFESSIONAL SUMMARY" />
            <p className="text-gray-300 leading-relaxed">{summary}</p>
          </div>
        )}

        <div className="mb-6">
          <SectionTitle icon="◈" title="EXPERIENCE TIMELINE" />
          <div className="space-y-5 mt-2">
            {experiences.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-2 h-2 rounded-full bg-[#3b82f6] flex-shrink-0" />
                  {i < experiences.length - 1 && <div className="w-px flex-1 bg-[#1a2540] mt-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#fff] font-bold">{exp.jobTitle}</span>
                    <span className="text-gray-500 text-[9px]">
                      {exp.startDate} – {exp.isCurrent ? "Present" : (exp.endDate ?? "")}
                    </span>
                  </div>
                  <p className="text-[#3b82f6] text-[10px] mb-1">
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
                </div>
              </div>
            ))}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mb-6">
            <SectionTitle icon="◈" title="TECH STACK" />
            <div className="grid grid-cols-2 gap-3 mt-2">
              {skills.map((group, i) => (
                <div key={i} className="bg-[#0f1520] border border-[#1a2540] rounded-lg p-3">
                  <p className="text-[9px] text-[#3b82f6] uppercase tracking-widest font-bold mb-1.5">{group.category}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.items.map((item, j) => (
                      <span key={j} className="text-[9px] bg-[#1a2540] rounded px-1.5 py-0.5 text-gray-300">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="mb-6">
            <SectionTitle icon="◈" title="CERTIFICATIONS" />
            <div className="grid grid-cols-2 gap-2 mt-2">
              {certifications.map((c, i) => (
                <div key={i} className="bg-[#0f1520] border border-[#1a2540] rounded-lg p-2.5">
                  <p className="text-gray-200 font-bold leading-tight">{c.title}</p>
                  <p className="text-gray-500 text-[9px]">{c.issuer}{c.date ? ` · ${c.date}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <SectionTitle icon="◈" title="EDUCATION" />
            <div className="mt-2 space-y-2">
              {education.map((e, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <p className="text-gray-200 font-bold">{e.degree}</p>
                    <p className="text-gray-500">{e.institution}</p>
                  </div>
                  <p className="text-gray-500 text-[9px]">{e.endDate ?? ""}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-[#1a2540] mt-6 pt-2 text-[9px] text-gray-600 text-center">
          Dashboard · {contact.fullName} · {experiences[0]?.jobTitle}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[#3b82f6] text-[10px]">{icon}</span>
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-[#1a2540] pb-1 flex-1">{title}</h2>
    </div>
  );
}
