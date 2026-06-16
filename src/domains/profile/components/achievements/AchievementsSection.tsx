import { getAchievements } from "@/domains/analytics/services/achievements.service";

const STATS = [
  { key: "yearsExperience",    label: "Experience",          icon: "⚡", color: "text-cyan" },
  { key: "projectsDelivered",  label: "Projects Delivered",  icon: "🚀", color: "text-orange" },
  { key: "certificationsEarned", label: "Certifications",   icon: "🏆", color: "text-yellow-400" },
  { key: "ktDocuments",        label: "KT Documents",        icon: "📚", color: "text-green" },
  { key: "interviewQuestions", label: "Interview Q&A",       icon: "💡", color: "text-[#a78bfa]" },
  { key: "blogPosts",          label: "Blog Posts",          icon: "✍️",  color: "text-[#ff4d94]" },
] as const;

type StatKey = (typeof STATS)[number]["key"];

export default async function AchievementsSection() {
  const achievements = await getAchievements();

  return (
    <section id="achievements" className="py-20 bg-darkBrown border-y border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="section-tag mb-3">Platform Statistics</p>
          <h2 className="font-special text-3xl sm:text-4xl font-bold text-white">
            By the <span className="gradient-text">Numbers</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map(({ key, label, icon, color }) => {
            const value = achievements[key as StatKey];
            return (
              <div
                key={key}
                className="glass rounded-xl border border-white/10 p-5 text-center hover:border-white/20 transition-all group"
              >
                <div className="text-2xl mb-2">{icon}</div>
                <p className={`font-mono font-bold text-xl ${color}`}>{value}</p>
                <p className="text-lightGrey/50 text-[10px] font-mono uppercase tracking-wider mt-1 leading-tight">
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
