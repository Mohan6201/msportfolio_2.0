"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { FiGithub as Github } from "react-icons/fi";
import type { ParsedProject } from "@/domains/profile/services/profile.service";
import LiveProjectPreview from "./LiveProjectPreview";

function ProjectCard({ project, index }: { project: ParsedProject; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="glass glass-hover rounded-2xl overflow-hidden border border-white/5 group"
    >
      <div className="relative h-48 overflow-hidden">
        <LiveProjectPreview
          liveUrl={project.link}
          embeddable={project.embeddable}
          fallbackImageUrl={project.imageUrl}
          alt={project.name}
        />
        {/* Scrim over the card image/iframe so the overlay text and controls below stay legible —
            intentionally raw black (not the theme's `black` token, which is white in light mode)
            since this is darkening a photo/live-embed, not part of the page's own surface color. */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000]/80 via-[#000]/30 to-transparent pointer-events-none" />

        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#000]/40 backdrop-blur-[2px]">
          <a href={project.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan text-black text-sm font-mono font-bold hover:bg-lightCyan transition-colors shadow-cyanShadow">
            <ExternalLink className="w-3.5 h-3.5" /> Live Demo
          </a>
          {/* Raw white, not the theme's `white` token (near-black in light mode) — this sits on
              the always-dark scrim above, not the page background. */}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fff]/10 border border-[#fff]/20 text-[#fff] text-sm font-mono hover:bg-[#fff]/20 transition-colors">
              <Github className="w-3.5 h-3.5" /> Source
            </a>
          )}
        </div>

        {/* Text color fixed too, not just the background — it sits over a photo/live-embed in
            both themes, so it can't follow the page's own light/dark text swap without going
            illegible in light mode. */}
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-[#000]/60 text-xs font-mono text-[#7a8fa6] border border-white/10">
          {project.year}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-special font-bold text-lg text-white mb-2 group-hover:text-cyan transition-colors duration-200">
          {project.name}
        </h3>
        <p className="text-lightGrey text-sm leading-relaxed mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tech.map((t) => (
            <span key={t} className="badge badge-cyan">{t}</span>
          ))}
        </div>

        <ul className="flex flex-col gap-1.5">
          {project.responsibilities.slice(0, 3).map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-lightGrey leading-relaxed">
              <span className="text-cyan/70 mt-0.5 flex-shrink-0 font-mono">›</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>

        <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
          <a href={project.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-cyan text-xs font-mono hover:text-lightCyan transition-colors">
            <ExternalLink className="w-3 h-3" /> View Project
          </a>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-lightGrey text-xs font-mono hover:text-white transition-colors">
              <Github className="w-3 h-3" /> Source Code
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsMain({ projects, githubUrl }: {
  projects: ParsedProject[];
  githubUrl?: string | null;
}) {
  return (
    <section id="projects" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 2xl:px-16 overflow-x-hidden">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-14"
        >
          <p className="section-tag mb-4">Portfolio</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="font-special text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Projects I&apos;ve <span className="gradient-text">shipped</span>
            </h2>
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-mono text-lightGrey hover:text-cyan transition-colors">
                <Github className="w-4 h-4" /> View GitHub →
              </a>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
