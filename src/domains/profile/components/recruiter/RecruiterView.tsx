"use client";
import { Briefcase, Mail, MapPin, Phone, Download, ExternalLink, Award, Code2, Layers, Globe, LogOut } from "lucide-react";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import type { getAllProfileData } from "@/domains/profile/services/profile.service";

type ProfileData = NonNullable<Awaited<ReturnType<typeof getAllProfileData>>>;

interface Props {
  data: ProfileData;
  userName: string;
}

const authClient = createAuthClient();

const SKILL_LEVEL_LABELS: Record<number, string> = {
  1: "Familiar",
  2: "Basic",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

const LEVEL_WIDTHS: Record<number, string> = {
  1: "20%",
  2: "40%",
  3: "60%",
  4: "80%",
  5: "100%",
};

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-white/30",
  2: "bg-blue-500/70",
  3: "bg-cyan/70",
  4: "bg-green/70",
  5: "bg-orange/70",
};

export default function RecruiterView({ data, userName }: Props) {
  const router = useRouter();
  const { profile, skills, experiences, certifications, projects, yearsOfExperience } = data;

  const skillsByCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/recruiter/login");
  }

  return (
    <>
      <style>{`@media print {
        .no-print { display: none !important; }
        .print-break { page-break-before: always; }
        body { background: #0d0d0d !important; -webkit-print-color-adjust: exact; }
      }`}</style>

      <main className="min-h-screen bg-darkBrown">
        {/* Sticky header */}
        <div className="no-print sticky top-0 z-50 bg-darkBrown/95 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span className="text-lightGrey text-xs font-mono">
                Recruiter Portal · <span className="text-white">{userName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan text-black font-mono font-bold text-xs rounded-lg hover:bg-lightCyan transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Profile
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 glass border border-white/10 text-lightGrey font-mono text-xs rounded-lg hover:border-white/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

          {/* ── Identity ─────────────────────────────────────────────────────── */}
          <div className="glass rounded-2xl border border-white/10 p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1">
                <p className="section-tag mb-2">Open to Opportunities</p>
                <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-1">
                  {profile.fullName}
                </h1>
                <p className="text-cyan font-mono text-lg mb-4">{profile.title}</p>
                <p className="text-lightGrey font-mono text-sm leading-relaxed max-w-2xl">{profile.bio}</p>
                <div className="flex flex-wrap gap-4 mt-5">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 text-lightGrey/70 text-xs font-mono">
                      <MapPin className="w-3.5 h-3.5 text-cyan" />{profile.location}
                    </span>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 text-lightGrey/70 hover:text-cyan text-xs font-mono transition-colors">
                      <Mail className="w-3.5 h-3.5 text-cyan" />{profile.email}
                    </a>
                  )}
                  {profile.phone && (
                    <span className="flex items-center gap-1.5 text-lightGrey/70 text-xs font-mono">
                      <Phone className="w-3.5 h-3.5 text-cyan" />{profile.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="glass rounded-xl border border-cyan/20 p-5 text-center min-w-[130px]">
                  <p className="text-3xl font-bold text-cyan font-mono">{yearsOfExperience}</p>
                  <p className="text-lightGrey/60 text-[10px] font-mono uppercase tracking-wider mt-1">Experience</p>
                </div>
                <div className="flex gap-2">
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener"
                      className="flex-1 glass rounded-lg border border-white/10 p-2.5 text-center text-lightGrey hover:text-cyan hover:border-cyan/30 transition-all text-[10px] font-mono">
                      GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener"
                      className="flex-1 glass rounded-lg border border-white/10 p-2.5 text-center text-lightGrey hover:text-cyan hover:border-cyan/30 transition-all text-[10px] font-mono">
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Skills ───────────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-white font-special text-xl font-bold mb-5 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan" /> Technical Skills
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(skillsByCategory).map(([category, catSkills]) => (
                <div key={category} className="glass rounded-xl border border-white/10 p-4">
                  <p className="text-cyan text-[10px] font-mono uppercase tracking-wider mb-3">{category}</p>
                  <div className="space-y-2.5">
                    {catSkills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-white text-xs font-mono">{skill.name}</span>
                          <span className="text-lightGrey/40 text-[9px] font-mono">
                            {SKILL_LEVEL_LABELS[skill.level] ?? String(skill.level)}
                          </span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${LEVEL_COLORS[skill.level] ?? "bg-white/40"}`}
                            style={{ width: LEVEL_WIDTHS[skill.level] ?? "0%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Experience ───────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-white font-special text-xl font-bold mb-5 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan" /> Professional Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="glass rounded-xl border border-white/10 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-white font-mono font-bold">{exp.jobTitle}</h3>
                      <p className="text-cyan text-sm font-mono">{exp.company}</p>
                    </div>
                    <p className="text-lightGrey/50 text-xs font-mono whitespace-nowrap">
                      {exp.startDate} — {exp.isCurrent ? "Present" : (exp.endDate ?? "")}
                    </p>
                  </div>
                  {exp.responsibilities.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {exp.responsibilities.slice(0, 3).map((r, i) => (
                        <li key={i} className="text-lightGrey text-xs font-mono flex gap-2">
                          <span className="text-cyan flex-shrink-0">▸</span>{r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.tech.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tech.map((t) => (
                        <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-lightGrey">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Projects ─────────────────────────────────────────────────────── */}
          <div>
            <h2 className="text-white font-special text-xl font-bold mb-5 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan" /> Featured Projects
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {projects.slice(0, 6).map((project) => (
                <div key={project.id} className="glass rounded-xl border border-white/10 p-5 group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-mono font-bold text-sm group-hover:text-cyan transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex gap-2 ml-2 flex-shrink-0">
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener" className="text-lightGrey/40 hover:text-cyan transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-lightGrey text-[11px] font-mono leading-relaxed mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.tech.slice(0, 6).map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan/10 text-cyan border border-cyan/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Certifications ────────────────────────────────────────────────── */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-white font-special text-xl font-bold mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan" /> Certifications
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="glass rounded-xl border border-white/10 p-4 hover:border-cyan/20 transition-colors">
                    <p className="text-white text-xs font-mono font-bold mb-1">{cert.title}</p>
                    <p className="text-cyan text-[10px] font-mono">{cert.issuer}</p>
                    <p className="text-lightGrey/50 text-[9px] font-mono mt-1">{cert.date}</p>
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener"
                        className="inline-flex items-center gap-1 text-[9px] font-mono text-lightGrey/40 hover:text-cyan transition-colors mt-2">
                        Verify <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Contact CTA ───────────────────────────────────────────────────── */}
          <div className="glass rounded-2xl border border-cyan/20 p-10 text-center">
            <h2 className="text-white font-special text-3xl font-bold mb-3">Let&apos;s Connect</h2>
            <p className="text-lightGrey font-mono text-sm mb-8 max-w-md mx-auto">
              Available for DevOps, Cloud Engineering, and Platform Engineering roles.
              Open to contract and permanent positions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {profile.email && (
                <a href={`mailto:${profile.email}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors">
                  <Mail className="w-4 h-4" /> Send Email
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 glass border border-cyan/30 text-cyan font-mono font-bold text-sm rounded-xl hover:bg-cyan/10 transition-colors">
                  <Globe className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
