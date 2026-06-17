"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiGithub, FiLinkedin, FiMail, FiCode, FiServer, FiCloud } from "react-icons/fi";
import type { ProfileRow, SocialLinkRow } from "@/domains/profile/services/profile.service";

const HIGHLIGHTS = [
  { icon: FiCloud,  label: "Cloud Architecture",  desc: "AWS multi-region, HA design" },
  { icon: FiServer, label: "Infrastructure as Code", desc: "Terraform, Ansible, CloudFormation" },
  { icon: FiCode,   label: "CI/CD Automation",    desc: "GitHub Actions, CodePipeline, Jenkins" },
];

interface AboutMeMainProps {
  profile: ProfileRow;
  yearsOfExperience: string;
  socialLinks: SocialLinkRow[];
}

export default function AboutMeMain({ profile, yearsOfExperience }: AboutMeMainProps) {
  const yrsNum = Math.floor(parseFloat(yearsOfExperience));

  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-5 sm:gap-6 min-w-0 order-2 lg:order-1"
          >
            <div>
              <p className="section-tag mb-3 sm:mb-4">About Me</p>
              <h2 className="font-special text-2xl sm:text-4xl font-bold text-white mb-4 leading-snug">
                Building the infra that{" "}
                <span className="gradient-text">keeps production running</span>
              </h2>
            </div>

            <div className="terminal w-full">
              <div className="terminal-bar gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red/70 flex-shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-orange/70 flex-shrink-0" />
                <span className="w-2.5 h-2.5 rounded-full bg-green/70 flex-shrink-0" />
                <span className="font-mono text-xs text-lightGrey/50 ml-2">about.md</span>
              </div>
              <div className="terminal-body !px-4 sm:!px-6 text-[0.8rem] sm:text-sm leading-relaxed break-words">
                <p className="text-lightGrey mb-3">
                  I&apos;m a <span className="text-cyan font-semibold">{profile.title}</span> currently at{" "}
                  <span className="text-orange font-semibold">{profile.currentCompany}</span>,
                  building cloud-native payment infrastructure on AWS.
                </p>
                <p className="text-lightGrey mb-3">
                  Over <span className="text-green font-semibold">{yrsNum}+ years</span>, I&apos;ve designed
                  CI/CD pipelines, containerised microservices with Docker on AWS ECS,
                  and automated infrastructure with Terraform &amp; Ansible — reducing deployment times
                  from <span className="text-cyan">hours to minutes</span>.
                </p>
                <p className="text-lightGrey">
                  My approach: <span className="text-white font-semibold">automate everything, monitor obsessively,
                  and keep the pager quiet</span>. If it can be scripted, it should be.
                </p>
              </div>
            </div>

            {/* Highlight cards */}
            <div className="grid gap-3">
              {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="glass glass-hover rounded-xl p-4 flex items-start gap-3 border border-white/5 cursor-default">
                  <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-cyan" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{label}</p>
                    <p className="text-lightGrey text-xs font-mono mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg border border-lightBrown/40 text-lightGrey hover:text-white hover:border-white/20 transition-all text-sm font-mono">
                  <FiGithub className="w-4 h-4" /> GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg border border-lightBrown/40 text-lightGrey hover:text-cyan hover:border-cyan/30 transition-all text-sm font-mono">
                  <FiLinkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
              <a href={`mailto:${profile.email}`}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg border border-lightBrown/40 text-lightGrey hover:text-orange hover:border-orange/30 transition-all text-sm font-mono">
                <FiMail className="w-4 h-4" /> Email
              </a>
            </div>
          </motion.div>

          {/* Right: Image + Stats */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center gap-6 w-full order-1 lg:order-2"
          >
            {/* Profile image */}
            <div className="relative w-56 h-64 sm:w-64 sm:h-72 lg:w-72 lg:h-80 max-w-full">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan/20 via-transparent to-orange/10 blur-xl" />
              <div className="relative rounded-2xl overflow-hidden border border-cyan/15 shadow-cyanGlow w-full h-full">
                <Image src="/images/profile/avatar.png" alt={profile.fullName} fill className="object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                  <p className="font-special font-bold text-white text-base sm:text-lg break-words">{profile.fullName}</p>
                  <p className="text-cyan text-[11px] sm:text-xs font-mono break-words">{profile.title} @ {profile.currentCompany}</p>
                </div>
              </div>
              {/* Brand badge accent */}
              <div className="absolute -top-4 -right-4 z-10 w-14 h-14 rounded-xl overflow-hidden bg-darkBrown ring-2 ring-orange/20 shadow-lg">
                <Image
                  src="/images/icons/badge-hex-bronze.png"
                  alt="MS Badge"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { label: "Location",   value: profile.location,       color: "cyan" },
                { label: "Status",     value: "Open to Work",         color: "green" },
                { label: "Focus",      value: "AWS + Docker/ECS",     color: "orange" },
                { label: "Experience", value: `${yrsNum}+ Years`,     color: "purple" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`glass rounded-xl p-3 border border-${color}/12`}>
                  <p className="text-[10px] font-mono text-lightGrey uppercase tracking-wider mb-0.5">{label}</p>
                  <p className={`text-sm font-semibold text-${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
