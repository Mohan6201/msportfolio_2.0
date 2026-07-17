import type { ResumeData } from "@/ai/schemas/resumeExtraction";

export default function SarathStyleTemplate({ data }: { data: ResumeData }) {
  const { contact, summary, experiences, education, skills, certifications } = data;
  const allSkills = skills.flatMap((g) => g.items);
  const currentExp = experiences[0];

  return (
    <div
      id="resume-print-area"
      className="bg-[#fff] text-gray-900 font-sans text-[11px] leading-relaxed max-w-[900px] mx-auto"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      {/* Bold header */}
      <div className="bg-[#1a1a2e] text-[#fff] px-8 py-6">
        <h1 className="text-[26px] font-bold tracking-tight">{contact.fullName}</h1>
        <p className="text-[#7ec8e3] text-[11px] mt-1">
          {currentExp?.jobTitle ?? "Professional"}
          {currentExp?.startDate && ` · ${new Date().getFullYear() - parseInt(currentExp.startDate.slice(-4) || "2020")} Years Experience`}
          {contact.location && ` · ${contact.location}`}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-gray-300">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>| {contact.phone}</span>}
          {contact.linkedinUrl && <span>in {contact.linkedinUrl.replace("https://", "")}</span>}
          {contact.githubUrl && <span>{contact.githubUrl.replace("https://", "")}</span>}
        </div>
        {allSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {allSkills.slice(0, 8).map((s, i) => (
              <span key={i} className="text-[9px] bg-[#2a2a4e] border border-[#3a3a6e] rounded px-2 py-0.5 text-[#7ec8e3] font-bold uppercase tracking-wide">
                {s}
              </span>
            ))}
            {contact.portfolioUrl && (
              <span className="text-[9px] text-gray-400 self-center">{contact.portfolioUrl.replace("https://", "")}</span>
            )}
          </div>
        )}
      </div>

      <div className="p-7">
        {summary && (
          <div className="mb-5">
            <SarathSection title="PROFESSIONAL SUMMARY">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </SarathSection>
          </div>
        )}

        <SarathSection title="PROFESSIONAL EXPERIENCE">
          {experiences.map((exp, i) => (
            <div key={i} className="mb-5 grid grid-cols-3 gap-4">
              {/* Main content */}
              <div className="col-span-2">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="font-bold text-[13px] text-gray-900">{exp.jobTitle}</span>
                  <span className="text-gray-500 text-[9px]">{exp.startDate} – {exp.isCurrent ? "Present" : (exp.endDate ?? "")}</span>
                </div>
                <p className="text-[#1a1a2e] text-[10px] font-bold mb-1">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                </p>
                <ul className="space-y-0.5">
                  {exp.responsibilities.map((r, j) => (
                    <li key={j} className="text-gray-700 leading-snug">{r}</li>
                  ))}
                </ul>
              </div>
              {/* Key projects + tools */}
              <div className="border-l border-gray-200 pl-4">
                {exp.technologies.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest font-bold text-[#1a1a2e] mb-1">Tools</p>
                    <p className="text-[9px] text-gray-500">{exp.technologies.join(" | ")}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </SarathSection>

        {certifications.length > 0 && (
          <SarathSection title="CERTIFICATIONS">
            <div className="grid grid-cols-2 gap-2">
              {certifications.map((c, i) => (
                <div key={i} className="border border-gray-100 rounded p-2">
                  <p className="font-bold text-[10px] text-[#1a1a2e]">{c.title}</p>
                  <p className="text-gray-500 text-[9px]">{c.issuer}{c.date ? ` · ${c.date}` : ""}</p>
                </div>
              ))}
            </div>
          </SarathSection>
        )}

        {skills.length > 0 && (
          <SarathSection title="TECHNICAL SKILLS">
            <div className="space-y-1">
              {skills.map((group, i) => (
                <p key={i} className="text-gray-700">
                  <span className="font-bold text-[#1a1a2e]">{group.category}:</span>{" "}
                  {group.items.join(", ")}
                </p>
              ))}
            </div>
          </SarathSection>
        )}

        {education.length > 0 && (
          <SarathSection title="EDUCATION">
            {education.map((e, i) => (
              <div key={i} className="flex justify-between mb-1">
                <div>
                  <span className="font-bold">{e.degree}</span>
                  <span className="text-gray-500"> · {e.institution}</span>
                </div>
                <span className="text-gray-400">{e.endDate ?? ""}</span>
              </div>
            ))}
          </SarathSection>
        )}
      </div>
    </div>
  );
}

function SarathSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#1a1a2e] border-b-2 border-[#1a1a2e] pb-1 mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
