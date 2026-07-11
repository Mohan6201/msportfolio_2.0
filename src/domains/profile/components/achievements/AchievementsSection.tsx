import { getAchievements } from "@/domains/analytics/services/achievements.service";
import AchievementsGrid from "./AchievementsGrid";

export default async function AchievementsSection() {
  const achievements = await getAchievements();

  return (
    <section id="achievements" className="py-12 sm:py-16 border-y border-white/5">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <AchievementsGrid achievements={achievements} />
      </div>
    </section>
  );
}
