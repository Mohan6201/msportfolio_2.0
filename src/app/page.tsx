import NavbarMain from "@/components/navbar/NavbarMain";
import HeroMain from "@/components/heroSection/HeroMain";
import AboutMeMain from "@/components/aboutMeSection/AboutMeMain";
import SkillsMain from "@/components/skillsSection/SkillsMain";
import ExperienceMain from "@/components/experienceSection/ExperienceMain";
import ProjectsMain from "@/components/projectsSection/ProjectsMain";
import GitHubStats from "@/components/github/GitHubStats";
import KnowledgeBase from "@/components/knowledge/KnowledgeBase";
import CertificateMain from "@/components/certificatesSection/CertificateMain";
import ResumeMain from "@/components/resumeSection/ResumeMain";
import ContactMeMain from "@/components/contactMeSection/ContactMeMain";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import FooterMain from "@/components/footer/FooterMain";

export default function Home() {
  return (
    <main className="bg-darkBrown">
      <NavbarMain />
      <HeroMain />
      <AboutMeMain />
      <SkillsMain />
      <ExperienceMain />
      <ProjectsMain />
      <GitHubStats />
      <KnowledgeBase />
      <CertificateMain />
      <ResumeMain />
      <ContactMeMain />
      <NewsletterSignup />
      <FooterMain />
    </main>
  );
}
