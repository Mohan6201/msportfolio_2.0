import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllProfileData } from "@/domains/profile/services/profile.service";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import Link from "next/link";
import { ArrowLeft, ExternalLink, GitBranch } from "lucide-react";

export const metadata: Metadata = {
  title: "Projects | Mohana Srinivasan",
  description: "Portfolio of DevOps and Cloud Engineering projects — AWS infrastructure, CI/CD pipelines, containerisation, and more.",
};

export default async function ProjectsPage() {
  const data = await getAllProfileData();
  if (!data) redirect("/");

  const { projects } = data;

  const allTech = Array.from(new Set(projects.flatMap((p) => p.tech))).sort();

  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link href="/profile" className="inline-flex items-center gap-2 text-lightGrey hover:text-cyan transition-colors text-sm font-mono mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div className="mb-10">
          <p className="section-tag mb-3">Portfolio</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-3">
            Featured <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            {projects.length} projects spanning AWS infrastructure, CI/CD automation, containerisation, and cloud architecture.
          </p>
        </div>

        {/* Tech filter cloud */}
        <div className="flex flex-wrap gap-2 mb-10">
          {allTech.slice(0, 30).map((t) => (
            <span key={t} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-lightGrey/60 hover:text-cyan hover:border-cyan/30 cursor-default transition-colors">
              {t}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="glass rounded-2xl border border-white/10 p-6 flex flex-col group hover:border-white/20 transition-all">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lightGrey/40 text-[10px] font-mono uppercase tracking-wider mb-1">{project.year}</p>
                  <h2 className="text-white font-special text-lg font-bold group-hover:text-cyan transition-colors">
                    {project.name}
                  </h2>
                </div>
                <div className="flex gap-2 ml-3 flex-shrink-0">
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener"
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lightGrey/40 hover:text-cyan hover:border-cyan/30 transition-all">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener"
                      className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lightGrey/40 hover:text-cyan hover:border-cyan/30 transition-all">
                      <GitBranch className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-lightGrey text-sm font-mono leading-relaxed mb-4 flex-1">{project.description}</p>

              {/* Highlights */}
              {project.responsibilities.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {project.responsibilities.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-mono text-lightGrey/60">
                      <span className="text-cyan flex-shrink-0">▸</span>{r}
                    </li>
                  ))}
                </ul>
              )}

              {/* Tech */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                {project.tech.map((t) => (
                  <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan/8 text-cyan border border-cyan/15">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
