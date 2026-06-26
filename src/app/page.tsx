// src/app/page.tsx
// UPDATED — reads section visibility from DB settings
// Sections hidden in admin Site Settings will not render

export const dynamic = "force-dynamic";

import { getAllProfileData, getSetting } from "@/domains/profile/services/profile.service";
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
import FooterMain from "@/domains/profile/components/footer/FooterMain";
import AchievementsSection from "@/domains/profile/components/achievements/AchievementsSection";
import ServicesSection from "@/domains/profile/components/services/ServicesSection";
import PipelineStrip from "@/domains/profile/components/pipeline/PipelineStrip";
import CareerCentreSection from "@/domains/profile/components/careerCentre/CareerCentreSection";

const DEFAULTS: Record<string, boolean> = {
  about: true, experience: true, skills: true, projects: true,
  certifications: true, achievements: true, resume: true, services: true,
  careerCentre: true, githubStats: true, ktCentre: true, blog: true, contact: true,
};

async function getVisibility(): Promise<Record<string, boolean>> {
  try {
    const raw = await getSetting("section_visibility");
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export default async function Home() {
  const [data, vis] = await Promise.all([getAllProfileData(), getVisibility()]);

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
  const show = (key: string) => vis[key] !== false;

  return (
    <main className="bg-darkBrown">
      <NavbarMain />
      <HeroMain profile={profile} yearsOfExperience={data.yearsOfExperience} socialLinks={socialLinks} />
      <PipelineStrip />
      {show("about")          && <AboutMeMain profile={profile} yearsOfExperience={data.yearsOfExperience} socialLinks={socialLinks} />}
      {show("experience")     && <ExperienceMain experiences={experiences} />}
      {show("skills")         && <SkillsMain skills={skills} />}
      {show("projects")       && <ProjectsMain projects={projects} githubUrl={profile.githubUrl} />}
      {show("certifications") && <CertificateMain certifications={certifications} />}
      {show("achievements")   && <AchievementsSection />}
      {show("resume")         && <ResumeMain resumeUrl={profile.resumeUrl} />}
      {show("services")       && <ServicesSection />}
      {show("careerCentre")   && <CareerCentreSection />}
      {show("githubStats")    && <GitHubStats />}
      {show("ktCentre")       && <KnowledgeBase />}
      {show("contact")        && <ContactMeMain profile={profile} socialLinks={socialLinks} />}
      <FooterMain profile={profile} />
    </main>
  );
}
