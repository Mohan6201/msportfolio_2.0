import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export default function CorporateTemplate({ data }: { data: ResumeData }) {
  const { contact, summary, experiences, education, skills, certifications } = data;
  const allSkills = skills.flatMap((g) => g.items);

  return (
    <div
      id="resume-print-area"
      className="bg-white text-gray-900 font-sans text-[11px] leading-relaxed max-w-[900px] mx-auto flex"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Left Sidebar */}
      <div className="w-[240px] bg-[#1e3a5f] text-white flex-shrink-0 p-6 flex flex-col gap-5">
        <div>
          <h1 className="text-[16px] font-bold text-white leading-tight">{contact.fullName?.toUpperCase()}</h1>
          <p className="text-[#7ec8e3] text-[10px] mt-1">{experiences[0]?.jobTitle ?? "Professional"}</p>
        </div>

        {/* Core Stack */}
        {allSkills.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#7ec8e3] font-bold mb-2 border-b border-[#2a4a7f] pb-1">
              CORE STACK
            </p>
            <div className="flex flex-wrap gap-1">
              {allSkills.slice(0, 20).map((s, i) => (
                <span key={i} className="text-[9px] bg-[#2a4a7f] rounded px-1.5 py-0.5 text-gray-200">{s}</span>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#7ec8e3] font-bold mb-2 border-b border-[#2a4a7f] pb-1">
              CERTIFICATIONS
            </p>
            {certifications.map((c, i) => (
              <div key={i} className="mb-2">
                <p className="text-white font-bold text-[10px] leading-tight">{c.title}</p>
                <p className="text-[#7ec8e3] text-[9px]">{c.issuer}</p>
                {c.date && <p className="text-gray-400 text-[9px]">{c.date}</p>}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[#7ec8e3] font-bold mb-2 border-b border-[#2a4a7f] pb-1">
              EDUCATION
            </p>
            {education.map((e, i) => (
              <div key={i} className="mb-2">
                <p className="text-white font-bold text-[10px] leading-tight">{e.degree}</p>
                <p className="text-[#7ec8e3] text-[9px]">{e.institution}</p>
                {e.endDate && <p className="text-gray-400 text-[9px]">{e.startDate ? `${e.startDate} – ` : ""}{e.endDate}</p>}
              </div>
            ))}
          </div>
        )}

        {/* At a glance */}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-[#7ec8e3] font-bold mb-2 border-b border-[#2a4a7f] pb-1">
            AT A GLANCE
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Build time", value: "-75%" },
              { label: "Pipelines", value: "100+" },
              { label: "ECS services", value: "10+" },
              { label: "AWS accounts", value: "3" },
            ].map((m, i) => (
              <div key={i} className="bg-[#2a4a7f] rounded p-2 text-center">
                <p className="text-[#7ec8e3] text-[14px] font-bold">{m.value}</p>
                <p className="text-[8px] text-gray-400">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-auto">
          <p className="text-[9px] uppercase tracking-widest text-[#7ec8e3] font-bold mb-2 border-b border-[#2a4a7f] pb-1">
            CONTACT
          </p>
          {contact.phone && <p className="text-gray-300 text-[9px]">{contact.phone}</p>}
          {contact.linkedinUrl && <p className="text-[#7ec8e3] text-[9px] break-all">in {contact.linkedinUrl.replace("https://", "")}</p>}
          {contact.githubUrl && <p className="text-[#7ec8e3] text-[9px] break-all">{contact.githubUrl.replace("https://", "")}</p>}
          {contact.portfolioUrl && <p className="text-gray-400 text-[9px] break-all">{contact.portfolioUrl.replace("https://", "")}</p>}
        </div>
      </div>

      {/* Right Main */}
      <div className="flex-1 p-7">
        {contact.email && (
          <p className="text-[#1e3a5f] text-[10px] font-bold mb-4">{contact.email}</p>
        )}

        {summary && (
          <div className="mb-5">
            <CorpSection title="PROFESSIONAL SUMMARY">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </CorpSection>
          </div>
        )}

        <CorpSection title="PROFESSIONAL EXPERIENCE">
          {experiences.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-gray-900 text-[12px]">{exp.jobTitle}</span>
                <span className="text-gray-500 text-[9px]">{exp.startDate} – {exp.isCurrent ? "Present" : (exp.endDate ?? "")}</span>
              </div>
              <p className="text-[#1e3a5f] text-[10px] font-bold mb-1">
                {exp.company}{exp.location ? ` · ${exp.location}` : ""}
              </p>
              <ul className="space-y-0.5">
                {exp.responsibilities.map((r, j) => (
                  <li key={j} className="flex gap-2 text-gray-700">
                    <span className="text-[#1e3a5f] flex-shrink-0 mt-0.5">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CorpSection>
      </div>
    </div>
  );
}

function CorpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#1e3a5f] border-b-2 border-[#1e3a5f] pb-1 mb-2">
        {title}
      </h2>
      {children}
    </div>
  );
}
