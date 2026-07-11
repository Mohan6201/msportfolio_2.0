import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllProfileData } from "@/domains/profile/services/profile.service";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import Link from "next/link";
import { MapPin, Mail, Phone, Globe, GitBranch, ArrowRight, Briefcase, Star } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getAllProfileData();
  return {
    title: data ? `${data.profile.fullName} | Professional Profile` : "Professional Profile",
    description: data?.profile.bio ?? "DevOps & Cloud Engineering professional profile.",
    alternates: { canonical: "/profile" },
  };
}

export default async function PublicProfilePage() {
  const data = await getAllProfileData();
  if (!data) redirect("/");

  const { profile, experiences, yearsOfExperience, socialLinks } = data;
  const hasGithubLink = socialLinks.some((s) => s.platform === "github");
  const hasLinkedinLink = socialLinks.some((s) => s.platform === "linkedin");

  const identityLinks = [
    { href: "/skills",           label: "Skills Matrix" },
    { href: "/projects",         label: "Projects" },
    { href: "/certifications",   label: "Certifications" },
    { href: "/career-progress",  label: "Career Progress" },
    { href: "/recruiter",        label: "Recruiter View" },
  ];

  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">

        {/* Identity card */}
        <div className="glass rounded-2xl border border-white/10 p-8">
          <p className="section-tag mb-3">Professional Profile</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-2">{profile.fullName}</h1>
          <p className="text-cyan font-mono text-xl mb-5">{profile.title}</p>
          <p className="text-lightGrey font-mono text-sm leading-relaxed mb-6 max-w-2xl">{profile.bio}</p>

          <div className="flex flex-wrap gap-5 mb-6">
            {profile.location && (
              <span className="flex items-center gap-2 text-lightGrey/70 text-sm font-mono">
                <MapPin className="w-4 h-4 text-cyan" />{profile.location}
              </span>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-lightGrey/70 hover:text-cyan text-sm font-mono transition-colors">
                <Mail className="w-4 h-4 text-cyan" />{profile.email}
              </a>
            )}
            {profile.phone && (
              <span className="flex items-center gap-2 text-lightGrey/70 text-sm font-mono">
                <Phone className="w-4 h-4 text-cyan" />{profile.phone}
              </span>
            )}
          </div>

          {/* Social */}
          <div className="flex flex-wrap gap-3">
            {profile.githubUrl && !hasGithubLink && (
              <a href={profile.githubUrl} target="_blank" rel="noopener"
                className="flex items-center gap-2 px-4 py-2 glass border border-white/10 hover:border-cyan/30 hover:text-cyan text-lightGrey rounded-xl text-xs font-mono transition-all">
                <GitBranch className="w-4 h-4" /> GitHub
              </a>
            )}
            {profile.linkedinUrl && !hasLinkedinLink && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener"
                className="flex items-center gap-2 px-4 py-2 glass border border-white/10 hover:border-cyan/30 hover:text-cyan text-lightGrey rounded-xl text-xs font-mono transition-all">
                <Globe className="w-4 h-4" /> LinkedIn
              </a>
            )}
            {socialLinks.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener"
                className="flex items-center gap-2 px-4 py-2 glass border border-white/10 hover:border-cyan/30 hover:text-cyan text-lightGrey rounded-xl text-xs font-mono transition-all">
                <Globe className="w-4 h-4" /> {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass rounded-xl border border-cyan/20 p-5 text-center">
            <p className="text-2xl font-bold text-cyan font-mono">{yearsOfExperience}</p>
            <p className="text-lightGrey/50 text-[10px] font-mono uppercase tracking-wider mt-1">Experience</p>
          </div>
          <div className="glass rounded-xl border border-white/10 p-5 text-center">
            <p className="text-2xl font-bold text-orange font-mono">{experiences.length}</p>
            <p className="text-lightGrey/50 text-[10px] font-mono uppercase tracking-wider mt-1">Roles</p>
          </div>
          {profile.currentCompany && (
            <div className="glass rounded-xl border border-white/10 p-5 text-center col-span-2">
              <p className="text-lightGrey/40 text-[9px] font-mono uppercase tracking-wider mb-1.5">Most Recent Role · Open to Work</p>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-cyan" />
                <p className="text-white font-mono text-sm font-bold">{profile.currentCompany}</p>
              </div>
              <p className="text-lightGrey/50 text-[10px] font-mono">{profile.currentDesignation}</p>
            </div>
          )}
        </div>

        {/* Experience summary */}
        <div>
          <h2 className="text-white font-special text-xl font-bold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyan" /> Career Timeline
          </h2>
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id} className="glass rounded-xl border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <div>
                  <p className="text-white font-mono font-bold text-sm">{exp.jobTitle}</p>
                  <p className="text-cyan text-xs font-mono">{exp.company}</p>
                </div>
                <p className="text-lightGrey/40 text-xs font-mono whitespace-nowrap">
                  {exp.startDate} — {exp.isCurrent ? "Present" : (exp.endDate ?? "")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Identity Hub navigation */}
        <div className="glass rounded-2xl border border-cyan/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-cyan" />
            <p className="text-white font-mono font-bold text-sm">Professional Digital Identity Hub</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {identityLinks.map((l) => (
              <Link key={l.href} href={l.href}
                className="flex items-center justify-center gap-2 py-2.5 glass border border-white/10 hover:border-cyan/30 hover:text-cyan text-lightGrey rounded-xl text-xs font-mono transition-all">
                {l.label} <ArrowRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
