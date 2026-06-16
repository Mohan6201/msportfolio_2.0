export const dynamic = "force-dynamic";

import { getAllProfileData } from "@/domains/profile/services/profile.service";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import HeroMain from "@/domains/profile/components/heroSection/HeroMain";
import AboutMeMain from "@/domains/profile/components/aboutMeSection/AboutMeMain";
import SkillsMain from "@/domains/profile/components/skillsSection/SkillsMain";
import ExperienceMain from "@/domains/profile/components/experienceSection/ExperienceMain";
import ProjectsMain from "@/domains/profile/components/projectsSection/ProjectsMain";
import GitHubStats from "@/domains/analytics/components/github/GitHubStats";
import KnowledgeBase from "@/domains/knowledge/components/knowledge/KnowledgeBase";
import CertificateMain from "@/domains/profile/components/certificatesSection/CertificateMain";
import ResumeMain from "@/domains/profile/components/resumeSection/ResumeMain";
import ContactMeMain from "@/domains/profile/components/contactMeSection/ContactMeMain";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import FooterMain from "@/domains/profile/components/footer/FooterMain";
import AchievementsSection from "@/domains/profile/components/achievements/AchievementsSection";
import ServicesSection from "@/domains/profile/components/services/ServicesSection";

export default async function Home() {
  const data = await getAllProfileData();

  // Fallback: if DB is empty (before seed), page still renders with empty sections
  if (!data) {
    return (
      <main className="bg-darkBrown min-h-screen flex items-center justify-center">
        <p className="text-lightGrey font-mono text-sm">
          Profile not yet seeded. Run: <code className="text-cyan">npm run db:seed</code>
        </p>
      </main>
    );
  }

  const { profile, skills, experiences, certifications, projects, socialLinks } = data;

  return (
    <main className="bg-darkBrown">
      <NavbarMain />
      <HeroMain profile={profile} yearsOfExperience={data.yearsOfExperience} socialLinks={socialLinks} />
      <AboutMeMain profile={profile} yearsOfExperience={data.yearsOfExperience} socialLinks={socialLinks} />
      <SkillsMain skills={skills} />
      <ExperienceMain experiences={experiences} />
      <AchievementsSection />
      <ProjectsMain projects={projects} githubUrl={profile.githubUrl} />
      <GitHubStats />
      <KnowledgeBase />
      <CertificateMain certifications={certifications} />
      <ResumeMain resumeUrl={profile.resumeUrl} />
      <ServicesSection />
      <ContactMeMain profile={profile} socialLinks={socialLinks} />
      <NewsletterSignup />
      <FooterMain profile={profile} />
    </main>
  );
}
