import AboutMeMain from "./components/aboutMeSection/AboutMeMain";
import CertificateCard from "./components/certificatesSection/CertificateCard";
import CertificateMain from "./components/certificatesSection/CertificateMain";
import CertificatesMain from "./components/certificatesSection/CertificateMain";
import ContactMeMain from "./components/contactMeSection/ContactMeMain";
import ExperienceMain from "./components/experienceSection/ExperienceMain";
import FooterMain from "./components/footer/FooterMain";
import HeroGradient from "./components/heroSection/HeroGradient";
import HeroMain from "./components/heroSection/HeroMain";
import NavbarMain from "./components/navbar/NavbarMain";
import ProjectsMain from "./components/projectsSection/ProjectsMain";
import ResumeMain from "./components/resumeSection/ResumeMain";
import SkillsMain from "./components/skillsSection/SkillsMain";
import SubSkills from "./components/skillsSection/SubSkills";
import SubHeroMain from "./components/subHeroSection/SubHeroMain";

function App() {
  return (
    <main className="font-body text-white relative overflow-hidden">
      <NavbarMain />
      <HeroMain />
      <HeroGradient />
      <SubHeroMain />
      <AboutMeMain />
      <SkillsMain />
      <SubSkills />
      <ExperienceMain />
      <CertificateMain />
      <ProjectsMain />
      <ResumeMain />
      <ContactMeMain />
      <FooterMain />
    </main>
  );
}

export default App;
