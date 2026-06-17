"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import { FiArrowRight, FiDownload, FiGithub, FiLinkedin } from "react-icons/fi";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Image from "next/image";
import type { ProfileRow, SocialLinkRow } from "@/domains/profile/services/profile.service";

const PIPELINE_STAGES = [
  { label: "Code",    status: "done",    color: "green"  },
  { label: "Build",   status: "done",    color: "cyan"   },
  { label: "Test",    status: "done",    color: "cyan"   },
  { label: "Deploy",  status: "active",  color: "orange" },
  { label: "Monitor", status: "idle",    color: "purple" },
];

const TECH_BADGES = [
  { label: "AWS",            cls: "text-orange  border-orange/25  bg-orange/5"  },
  { label: "Docker",         cls: "text-cyan    border-cyan/25    bg-cyan/5"    },
  { label: "Terraform",      cls: "text-green   border-green/25   bg-green/5"   },
  { label: "GitHub Actions", cls: "text-white   border-white/15   bg-white/3"   },
  { label: "Ansible",        cls: "text-orange  border-orange/20  bg-orange/5"  },
  { label: "Jenkins",        cls: "text-cyan    border-cyan/20    bg-cyan/5"    },
];

interface HeroMainProps {
  profile: ProfileRow;
  yearsOfExperience: string;
  socialLinks: SocialLinkRow[];
}

function TerminalBlock({ profile, yearsOfExperience }: { profile: ProfileRow; yearsOfExperience: string }) {
  const LINES = [
    { prompt: "$ whoami",           output: `${profile.fullName} — ${profile.title} @ ${profile.currentCompany}` },
    { prompt: "$ cat stack.sh",     output: "AWS · Docker · Terraform · GitHub Actions · Ansible · Jenkins" },
    { prompt: "$ uptime",           output: `${yearsOfExperience} in production  •  10+ shipped projects` },
    { prompt: "$ systemctl status", output: "● active (running)  —  Available for DevOps roles" },
  ];

  const [line, setLine] = useState(0);
  const [phase, setPhase] = useState<"prompt" | "output" | "pause">("pause");
  const [promptLen, setPromptLen] = useState(0);
  const [outputLen, setOutputLen] = useState(0);
  const [doneLines, setDoneLines] = useState(0);

  useEffect(() => {
    if (line >= LINES.length) return;
    const L = LINES[line];
    if (phase === "pause") {
      const t = setTimeout(() => { setPhase("prompt"); setPromptLen(0); }, 500);
      return () => clearTimeout(t);
    }
    if (phase === "prompt") {
      if (promptLen < L.prompt.length) {
        const t = setTimeout(() => setPromptLen((n) => n + 1), 48);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => { setPhase("output"); setOutputLen(0); }, 180);
      return () => clearTimeout(t);
    }
    if (phase === "output") {
      if (outputLen < L.output.length) {
        const t = setTimeout(() => setOutputLen((n) => n + 1), 20);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setDoneLines((n) => n + 1);
        if (line + 1 < LINES.length) { setLine((n) => n + 1); setPhase("pause"); }
      }, 700);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, promptLen, outputLen, line]);

  return (
    <div className="terminal w-full max-w-full sm:max-w-xl">
      <div className="terminal-bar gap-2">
        <span className="w-3 h-3 rounded-full bg-red/70 flex-shrink-0" />
        <span className="w-3 h-3 rounded-full bg-orange/70 flex-shrink-0" />
        <span className="w-3 h-3 rounded-full bg-green/70 flex-shrink-0" />
        <span className="ml-2 font-mono text-[10px] sm:text-xs text-lightGrey/50 truncate">
          bash — {profile.fullName.split(" ")[0].toLowerCase()}@{profile.currentCompany.toLowerCase()} ~
        </span>
      </div>
      <div className="terminal-body min-h-[260px] sm:min-h-[230px] !px-4 sm:!px-6 !text-[0.72rem] sm:!text-[0.84rem] break-words">
        {LINES.slice(0, line + 1).map((L, i) => (
          <div key={i} className="mb-1.5">
            <div className="break-words">
              <span className="terminal-prompt break-all">
                {i < line ? L.prompt : L.prompt.slice(0, promptLen)}
              </span>
              {i === line && phase === "prompt" && <span className="terminal-cursor" />}
            </div>
            {(i < line || (i === line && (phase === "output" || doneLines > line))) && (
              <div className="terminal-output pl-2 break-words">
                {i < line ? L.output : L.output.slice(0, outputLen)}
                {i === line && phase === "output" && <span className="terminal-cursor" />}
              </div>
            )}
          </div>
        ))}
        {line >= LINES.length - 1 && doneLines >= LINES.length && (
          <div className="terminal-prompt mt-1">$ <span className="terminal-cursor" /></div>
        )}
      </div>
    </div>
  );
}

export default function HeroMain({ profile, yearsOfExperience, socialLinks }: HeroMainProps) {
  const github = socialLinks.find((s) => s.platform === "github")?.url ?? profile.githubUrl ?? "#";
  const linkedin = socialLinks.find((s) => s.platform === "linkedin")?.url ?? profile.linkedinUrl ?? "#";
  const resumeUrl = profile.resumeUrl ?? "/resume/Mohana_Srinivasan_Resume.pdf";
  const yrsNum = Math.floor(parseFloat(yearsOfExperience));

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grid-bg">
      {/* Background image + ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: "url('/images/profile/brand-icon.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
        />
        <div className="absolute -top-40 -right-60 w-[700px] h-[700px] rounded-full bg-cyan/5 blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange/5 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-cyan/3 blur-[180px]" />
        {/* Diagonal grid accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/3 via-transparent to-orange/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 sm:pt-24 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left ── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-5 sm:gap-6 min-w-0"
          >
            <div className="flex items-center gap-2 w-fit max-w-full px-3 py-1.5 rounded-full bg-green/8 border border-green/20">
              <div className="status-dot flex-shrink-0" />
              <span className="text-[11px] sm:text-xs font-mono text-green truncate">Available for DevOps opportunities</span>
            </div>

            <div>
              <p className="section-tag mb-3 sm:mb-4 text-xs sm:text-sm">{profile.title} • {profile.currentCompany}</p>
              <h1 className="font-special font-bold leading-[1.08]">
                <span className="block text-3xl sm:text-5xl lg:text-[3.6rem] text-white mb-1 break-words">
                  {profile.fullName.split(" ")[0]}
                </span>
                <span className="block text-3xl sm:text-5xl lg:text-[3.6rem] gradient-text glitch break-words">
                  {profile.fullName.split(" ").slice(1).join(" ")}
                </span>
              </h1>
            </div>

            <TerminalBlock profile={profile} yearsOfExperience={yearsOfExperience} />

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-1">
              <Link to="contact" smooth duration={600} offset={-80} className="cursor-pointer w-full sm:w-auto">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl bg-cyan text-black font-mono font-bold text-sm hover:bg-lightCyan transition-colors shadow-cyanShadow"
                >
                  Hire Me <FiArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <a
                href={resumeUrl}
                download
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-xl border border-orange/40 text-orange font-mono font-semibold text-sm hover:bg-orange/8 hover:border-orange/70 transition-all"
              >
                Resume <FiDownload className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-5 text-sm font-mono">
              {github !== "#" && (
                <a href={github} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-lightGrey hover:text-white transition-colors">
                  <FiGithub className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {github !== "#" && linkedin !== "#" && <span className="text-darkGrey">·</span>}
              {linkedin !== "#" && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-lightGrey hover:text-cyan transition-colors">
                  <FiLinkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </motion.div>

          {/* ── Right ── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center gap-7 sm:gap-8 w-full min-w-0"
          >
            {/* Profile photo — clean card frame, no orbit rings */}
            <div className="relative">
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-cyan/30 via-transparent to-orange/20" />
              <div className="relative w-52 h-52 lg:w-64 lg:h-64 rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src="/images/profile/avatar.png"
                  alt={profile.fullName}
                  fill
                  className="object-cover object-top"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-darkBrown/70 to-transparent" />
              </div>
              {/* Live badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-darkBrown border border-green/30 text-green text-[11px] font-mono whitespace-nowrap shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse inline-block" />
                Open to Work
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[320px] sm:max-w-[280px] mt-2">
              {[
                { value: yrsNum, suffix: "+", label: "Years Exp.", cls: "border-cyan/15 text-cyan" },
                { value: 10,     suffix: "+", label: "Projects",  cls: "border-green/15 text-green" },
                { value: 3,      suffix: "",  label: "Certs",     cls: "border-orange/15 text-orange" },
              ].map(({ value, suffix, label, cls }) => (
                <div key={label} className={`glass rounded-xl p-2.5 sm:p-3 text-center border ${cls.split(" ")[0]}`}>
                  <p className={`text-lg sm:text-xl font-bold font-mono ${cls.split(" ")[1]}`}>
                    <AnimatedCounter target={value} suffix={suffix} />
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-lightGrey mt-0.5 font-mono">{label}</p>
                </div>
              ))}
            </div>

            {/* Mini pipeline stages */}
            <div className="w-full max-w-[320px] sm:max-w-[300px]">
              <p className="text-[9px] font-mono text-lightGrey/40 uppercase tracking-widest mb-2 text-center">CI/CD Pipeline</p>
              <div className="flex items-center justify-between gap-0">
                {PIPELINE_STAGES.map((s, i) => (
                  <div key={s.label} className="flex items-center flex-1">
                    <div className={`flex flex-col items-center gap-1 flex-1`}>
                      <div className={`w-2 h-2 rounded-full ${
                        s.status === "done"   ? "bg-green shadow-[0_0_6px_rgba(0,255,136,0.8)]" :
                        s.status === "active" ? "bg-orange shadow-[0_0_6px_rgba(255,107,53,0.8)] animate-pulse" :
                        "bg-darkGrey border border-white/10"
                      }`} />
                      <span className={`text-[9px] sm:text-[10px] font-mono ${
                        s.status === "done"   ? "text-green/80" :
                        s.status === "active" ? "text-orange/80" :
                        "text-lightGrey/30"
                      }`}>{s.label}</span>
                    </div>
                    {i < PIPELINE_STAGES.length - 1 && (
                      <div className="relative h-[1px] flex-1 mx-0.5 overflow-hidden">
                        <div className={`absolute inset-0 ${s.status === "done" ? "bg-green/30" : "bg-white/10"}`} />
                        {s.status === "done" && (
                          <div
                            className="absolute top-0 left-0 w-2 h-full bg-green/70 rounded-full"
                            style={{ animation: "flow-dot 1.8s linear infinite", animationDelay: `${i * 0.4}s` }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap justify-center gap-2 max-w-[320px] sm:max-w-[300px] px-2">
              {TECH_BADGES.map(({ label, cls }) => (
                <span
                  key={label}
                  className={`px-2.5 py-1 rounded-md border text-[10px] sm:text-[11px] font-mono font-medium whitespace-nowrap ${cls}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
        >
          <span className="text-[10px] font-mono text-lightGrey/40 tracking-widest uppercase">scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-cyan/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
