import { getAchievements } from "@/domains/analytics/services/achievements.service";
import { Zap, Rocket, Award, BookOpen, MessageSquare, PenLine } from "lucide-react";

const STATS = [
  { key: "yearsExperience",      label: "Years Experience",   Icon: Zap,           color: "text-cyan",       border: "border-cyan/20",       bg: "bg-cyan/5" },
  { key: "projectsDelivered",    label: "Projects Delivered", Icon: Rocket,         color: "text-orange",     border: "border-orange/20",     bg: "bg-orange/5" },
  { key: "certificationsEarned", label: "Certifications",     Icon: Award,          color: "text-yellow-400", border: "border-yellow-400/20", bg: "bg-yellow-400/5" },
  { key: "ktDocuments",          label: "KT Documents",       Icon: BookOpen,       color: "text-green",      border: "border-green/20",      bg: "bg-green/5" },
  { key: "interviewQuestions",   label: "Interview Q&A",      Icon: MessageSquare,  color: "text-[#a78bfa]",  border: "border-[#a78bfa]/20",  bg: "bg-[#a78bfa]/5" },
  { key: "blogPosts",            label: "Blog Posts",         Icon: PenLine,        color: "text-[#ff4d94]",  border: "border-[#ff4d94]/20",  bg: "bg-[#ff4d94]/5" },
] as const;

type StatKey = (typeof STATS)[number]["key"];

export default async function AchievementsSection() {
  const achievements = await getAchievements();

  return (
    <section id="achievements" className="py-12 sm:py-16 border-y border-white/5">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {STATS.map(({ key, label, Icon, color, border, bg }) => {
            const value = achievements[key as StatKey];
            return (
              <div
                key={key}
                className={`glass rounded-xl border ${border} ${bg} p-3 sm:p-4 text-center transition-all hover:scale-[1.02]`}
              >
                <div className={`flex justify-center mb-1.5 sm:mb-2`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className={`font-mono font-bold text-xl sm:text-2xl ${color}`}>{value}</p>
                <p className="text-lightGrey/50 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider mt-1 leading-tight break-words">
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
