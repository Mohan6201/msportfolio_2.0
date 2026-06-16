import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllProfileData } from "@/domains/profile/services/profile.service";
import { getAchievements } from "@/domains/analytics/services/achievements.service";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Award, Briefcase, Code2, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Career Progress | Mohana Srinivasan",
  description: "Career growth visualisation — experience timeline, skills matrix, certifications, and project history.",
};

function yearFromText(dateStr: string): string {
  const parts = dateStr.trim().split(/\s+/);
  return parts[parts.length - 1];
}

export default async function CareerProgressPage() {
  const [data, achievements] = await Promise.all([getAllProfileData(), getAchievements()]);
  if (!data) redirect("/");

  const { profile, experiences, skills, certifications, projects } = data;

  // ── Projects per year ──────────────────────────────────────────────────────
  const projectsByYear = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.year] = (acc[p.year] ?? 0) + 1;
    return acc;
  }, {});
  const projectYears = Object.entries(projectsByYear).sort(([a], [b]) => a.localeCompare(b));
  const maxProjects = Math.max(...Object.values(projectsByYear), 1);

  // ── Skills by category ─────────────────────────────────────────────────────
  const skillsByCategory = skills.reduce<Record<string, { count: number; totalLevel: number }>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = { count: 0, totalLevel: 0 };
    acc[s.category].count++;
    acc[s.category].totalLevel += s.level;
    return acc;
  }, {});
  const categoryEntries = Object.entries(skillsByCategory)
    .map(([cat, { count, totalLevel }]) => ({ cat, count, avg: totalLevel / count }))
    .sort((a, b) => b.avg - a.avg);

  // ── Certifications by year ──────────────────────────────────────────────────
  const certsByYear = certifications.reduce<Record<string, typeof certifications>>((acc, c) => {
    const yr = yearFromText(c.date);
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(c);
    return acc;
  }, {});
  const certYears = Object.entries(certsByYear).sort(([a], [b]) => b.localeCompare(a));

  // ── Level colours ───────────────────────────────────────────────────────────
  const avgColor = (avg: number) =>
    avg >= 4.5 ? "bg-orange/80" : avg >= 3.5 ? "bg-green/70" : avg >= 2.5 ? "bg-cyan/70" : "bg-blue-500/60";

  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        <div>
          <Link href="/profile" className="inline-flex items-center gap-2 text-lightGrey hover:text-cyan transition-colors text-sm font-mono mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <p className="section-tag mb-3">Professional Growth</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-3">
            Career <span className="gradient-text">Progress</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            A data-driven view of professional growth — experience, skills, certifications, and projects, all sourced live from the profile engine.
          </p>
        </div>

        {/* ── Achievement stats ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Experience",     value: achievements.yearsExperience,       color: "text-cyan",      icon: <TrendingUp className="w-4 h-4" /> },
            { label: "Roles Held",     value: experiences.length,                 color: "text-orange",    icon: <Briefcase className="w-4 h-4" /> },
            { label: "Skills",         value: skills.length,                      color: "text-[#a78bfa]", icon: <Code2 className="w-4 h-4" /> },
            { label: "Certifications", value: achievements.certificationsEarned,  color: "text-yellow-400",icon: <Award className="w-4 h-4" /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} className="glass rounded-xl border border-white/10 p-5 text-center">
              <div className={`flex items-center justify-center gap-1.5 mb-1 ${color}`}>{icon}</div>
              <p className={`font-mono font-bold text-2xl ${color}`}>{value}</p>
              <p className="text-lightGrey/50 text-[10px] font-mono uppercase tracking-wider mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Career timeline ────────────────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-special text-lg font-bold mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan" /> Experience Timeline
          </h2>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />
            <div className="space-y-6">
              {experiences.map((exp, i) => (
                <div key={exp.id} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[1.35rem] top-1 w-3 h-3 rounded-full border-2 ${exp.isCurrent ? "border-cyan bg-cyan/30" : "border-white/30 bg-darkBrown"}`} />
                  <div className="glass rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <div>
                        <p className="text-white font-mono font-bold text-sm">{exp.jobTitle}</p>
                        <p className="text-cyan text-xs font-mono">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {exp.isCurrent && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full border text-green border-green/30 bg-green/10">
                            Current
                          </span>
                        )}
                        <p className="text-lightGrey/40 text-xs font-mono whitespace-nowrap">
                          {exp.startDate} — {exp.isCurrent ? "Present" : (exp.endDate ?? "")}
                        </p>
                      </div>
                    </div>
                    {exp.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.tech.slice(0, 6).map((t) => (
                          <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-lightGrey/50">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Projects per year ──────────────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-special text-lg font-bold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-orange" /> Projects by Year
          </h2>
          {projectYears.length === 0 ? (
            <p className="text-lightGrey/40 text-xs font-mono">No project data yet. Run: <code className="text-cyan">npm run db:seed</code></p>
          ) : (
            <div className="space-y-3">
              {projectYears.map(([year, count]) => (
                <div key={year} className="flex items-center gap-4">
                  <span className="text-lightGrey/40 text-xs font-mono w-10 text-right flex-shrink-0">{year}</span>
                  <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-orange/60 rounded-lg transition-all flex items-center px-2"
                      style={{ width: `${(count / maxProjects) * 100}%` }}
                    >
                      <span className="text-[10px] font-mono text-white font-bold">{count}</span>
                    </div>
                  </div>
                  <span className="text-lightGrey/30 text-[10px] font-mono w-16 flex-shrink-0">
                    {count} project{count !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Skills by category ─────────────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-special text-lg font-bold mb-6 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#a78bfa]" /> Skills Breakdown
          </h2>
          {categoryEntries.length === 0 ? (
            <p className="text-lightGrey/40 text-xs font-mono">No skills data yet.</p>
          ) : (
            <div className="space-y-3">
              {categoryEntries.map(({ cat, count, avg }) => (
                <div key={cat} className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white text-xs font-mono">{cat}</span>
                      <span className="text-lightGrey/40 text-[10px] font-mono">{count} skills · avg {avg.toFixed(1)}</span>
                    </div>
                    <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${avgColor(avg)}`}
                        style={{ width: `${(avg / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Certifications timeline ────────────────────────────────────────── */}
        {certYears.length > 0 && (
          <div className="glass rounded-2xl border border-white/10 p-6">
            <h2 className="text-white font-special text-lg font-bold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Certifications Timeline
            </h2>
            <div className="space-y-6">
              {certYears.map(([year, certs]) => (
                <div key={year}>
                  <p className="text-cyan text-[10px] font-mono uppercase tracking-widest font-bold mb-3">{year}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {certs.map((cert) => (
                      <div key={cert.id} className="flex items-start gap-3 glass rounded-xl border border-white/8 p-3">
                        {cert.imageUrl && (
                          <img src={cert.imageUrl} alt={cert.title} className="w-8 h-8 object-contain flex-shrink-0 rounded" />
                        )}
                        <div className="min-w-0">
                          <p className="text-white font-mono text-xs font-bold truncate">{cert.title}</p>
                          <p className="text-lightGrey/40 text-[10px] font-mono">{cert.issuer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {certYears.length === 0 && (
          <div className="glass rounded-2xl border border-white/10 p-6">
            <h2 className="text-white font-special text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" /> Certifications Timeline
            </h2>
            <p className="text-lightGrey/40 text-xs font-mono">No certifications seeded yet. Run: <code className="text-cyan">npm run db:seed</code></p>
          </div>
        )}

      </div>
    </main>
  );
}
