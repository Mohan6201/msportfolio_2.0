import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllProfileData } from "@/domains/profile/services/profile.service";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Skills Matrix | Mohana Srinivasan",
  description: "Full technical skills matrix — DevOps, Cloud, Containers, Monitoring, IaC, Scripting, and more.",
};

const LEVEL_LABELS: Record<number, string> = { 1: "Familiar", 2: "Basic", 3: "Intermediate", 4: "Advanced", 5: "Expert" };
const LEVEL_COLORS: Record<number, string> = {
  1: "bg-white/20",
  2: "bg-blue-500/60",
  3: "bg-cyan/60",
  4: "bg-green/60",
  5: "bg-orange/80",
};
const LEVEL_TEXT: Record<number, string> = {
  1: "text-white/40",
  2: "text-blue-400",
  3: "text-cyan",
  4: "text-green",
  5: "text-orange",
};

export default async function SkillsPage() {
  const data = await getAllProfileData();
  if (!data) redirect("/");

  const { skills } = data;

  const byCategory = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/profile" className="inline-flex items-center gap-2 text-lightGrey hover:text-cyan transition-colors text-sm font-mono mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div className="mb-10">
          <p className="section-tag mb-3">Technical Expertise</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-3">
            Skills <span className="gradient-text">Matrix</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            {skills.length} skills across {Object.keys(byCategory).length} categories.
            Levels from Familiar (1) to Expert (5).
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <div key={lvl} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${LEVEL_COLORS[lvl]}`} />
              <span className={`text-[10px] font-mono ${LEVEL_TEXT[lvl]}`}>{LEVEL_LABELS[lvl]}</span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(byCategory).map(([category, catSkills]) => (
            <div key={category} className="glass rounded-2xl border border-white/10 p-5">
              <p className="text-cyan text-xs font-mono uppercase tracking-widest font-bold mb-4">{category}</p>
              <div className="space-y-3">
                {catSkills
                  .sort((a, b) => b.level - a.level)
                  .map((skill) => (
                    <div key={skill.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm font-mono">{skill.name}</span>
                        <span className={`text-[10px] font-mono ${LEVEL_TEXT[skill.level] ?? "text-lightGrey/40"}`}>
                          {LEVEL_LABELS[skill.level] ?? String(skill.level)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${LEVEL_COLORS[skill.level] ?? "bg-white/20"}`}
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
