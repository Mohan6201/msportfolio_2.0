"use client";
import { Link } from "react-scroll";
import NextLink from "next/link";
import { FiGithub, FiLinkedin, FiMail, FiHeart } from "react-icons/fi";
import { Terminal } from "lucide-react";
import type { ProfileRow } from "@/domains/profile/services/profile.service";

const NAV = [
  { label: "About",       to: "about",       type: "scroll" },
  { label: "Skills",      to: "skills",      type: "scroll" },
  { label: "Experience",  to: "experience",  type: "scroll" },
  { label: "Projects",    to: "projects",    type: "scroll" },
  { label: "Certs",       to: "certificates",type: "scroll" },
  { label: "Contact",     to: "contact",     type: "scroll" },
  { label: "Blog",        to: "/blog",       type: "link" },
];

interface FooterMainProps {
  profile: ProfileRow;
}

export default function FooterMain({ profile }: FooterMainProps) {
  const SOCIALS = [
    { Icon: FiGithub,   href: profile.githubUrl ?? "#",   label: "GitHub" },
    { Icon: FiLinkedin, href: profile.linkedinUrl ?? "#", label: "LinkedIn" },
    { Icon: FiMail,     href: `mailto:${profile.email}`,  label: "Email" },
  ].filter((s) => s.href !== "#");

  const firstName = profile.fullName.split(" ")[0].toLowerCase();

  return (
    <footer className="relative pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/5 overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[1px] bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-cyan" />
              </div>
              <span className="font-mono font-semibold text-white">
                <span className="text-cyan">~/</span>{firstName}
              </span>
            </div>
            <p className="text-lightGrey text-sm leading-relaxed max-w-xs">
              {profile.title} building scalable cloud infrastructure and automated delivery pipelines.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs font-mono">
              <div className="status-dot" />
              <span className="text-green">Available for DevOps roles</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-widest mb-4">Navigation</p>
            <ul className="grid grid-cols-2 gap-2">
              {NAV.map((item) => (
                <li key={item.label}>
                  {item.type === "scroll" ? (
                    <Link to={item.to} smooth duration={500} offset={-80}
                      className="text-lightGrey text-sm font-mono hover:text-cyan transition-colors cursor-pointer">
                      <span className="text-cyan/30 mr-1">›</span>{item.label}
                    </Link>
                  ) : (
                    <NextLink href={item.to}
                      className="text-lightGrey text-sm font-mono hover:text-cyan transition-colors">
                      <span className="text-cyan/30 mr-1">›</span>{item.label}
                    </NextLink>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-widest mb-4">Connect</p>
            <div className="flex flex-col gap-3">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a key={label} href={href} target={label !== "Email" ? "_blank" : undefined} rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-lightGrey text-sm font-mono hover:text-cyan transition-colors group">
                  <div className="w-7 h-7 rounded-lg bg-darkGrey/60 flex items-center justify-center group-hover:bg-cyan/10 group-hover:border-cyan/20 border border-transparent transition-all">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {label}
                </a>
              ))}
              <a href={`mailto:${profile.email}`}
                className="text-lightGrey/50 text-xs font-mono hover:text-cyan transition-colors mt-1">
                {profile.email}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] sm:text-xs font-mono text-lightGrey/40">
            © {new Date().getFullYear()} {profile.fullName} · Built with Next.js + Tailwind v4
          </p>
          <p className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-lightGrey/40">
            Made with <FiHeart className="w-3 h-3 text-orange/60" /> Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
