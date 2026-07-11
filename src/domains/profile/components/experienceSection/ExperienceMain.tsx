"use client";
import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ExternalLink, Building2, Calendar, CheckCircle2, Zap, ChevronDown, Star } from "lucide-react";
import type { ParsedExperience } from "@/domains/profile/services/profile.service";

const COLLAPSED_COUNT = 2;

function TimelineNode({ isCurrent, isFeatured, index, inView }: {
  isCurrent: boolean; isFeatured: boolean; index: number; inView: boolean;
}) {
  const highlighted = isCurrent || isFeatured;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay: index * 0.12 + 0.1, type: "spring", stiffness: 260, damping: 20 }}
      className={`absolute left-0 md:left-2 top-6 z-10 w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center
        ${highlighted
          ? "border-cyan bg-cyan/15 shadow-[0_0_16px_rgba(0,212,255,0.5)]"
          : "border-green/50 bg-green/8"
        }`}
    >
      {isCurrent
        ? <Zap className="w-3.5 h-3.5 text-cyan" />
        : isFeatured
        ? <Star className="w-3.5 h-3.5 text-cyan" />
        : <CheckCircle2 className="w-3.5 h-3.5 text-green/70" />
      }
      {highlighted && (
        <span className="absolute inset-0 rounded-full border-2 border-cyan animate-ping opacity-30" />
      )}
    </motion.div>
  );
}

function ExperienceCard({ exp, index, inView, isFeatured }: {
  exp: ParsedExperience; index: number; inView: boolean; isFeatured: boolean;
}) {
  const [expanded, setExpanded] = useState(isFeatured);
  const hasMore = exp.responsibilities.length > COLLAPSED_COUNT;
  const visibleBullets = expanded ? exp.responsibilities : exp.responsibilities.slice(0, COLLAPSED_COUNT);
  const highlighted = exp.isCurrent || isFeatured;

  return (
    <div className="relative">
      <TimelineNode isCurrent={exp.isCurrent} isFeatured={isFeatured} index={index} inView={inView} />

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -3 }}
      >
        <div className={`glass rounded-2xl p-4 sm:p-6 border transition-all duration-300 hover:border-cyan/25 hover:shadow-[0_8px_32px_rgba(0,212,255,0.08)] group
          ${highlighted ? "border-cyan/20 shadow-[0_0_32px_rgba(0,212,255,0.06)]" : "border-white/5"}`}
        >
          {/* Pipeline stage label */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1
              ${highlighted
                ? "border-cyan/30 bg-cyan/8 text-cyan"
                : "border-green/20 bg-green/5 text-green/70"
              }`}>
              {exp.isCurrent ? "● RUNNING" : isFeatured ? <><Star className="w-2.5 h-2.5" /> MOST RECENT</> : "✓ COMPLETED"}
            </span>
            <span className="text-[9px] font-mono text-lightGrey/30">
              stage/{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className={`font-special font-bold group-hover:text-cyan transition-colors duration-200 ${isFeatured ? "text-lg sm:text-xl" : "text-base sm:text-lg"} text-white`}>
                  {exp.jobTitle}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-orange text-sm font-mono">
                <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                {exp.companyUrl ? (
                  <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer"
                    className="hover:text-lightOrange transition-colors flex items-center gap-1 truncate">
                    {exp.company} <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                ) : (
                  <span className="truncate">{exp.company}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-lightGrey text-xs font-mono bg-darkGrey/40 px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 self-start">
              <Calendar className="w-3 h-3" />
              {exp.isCurrent
                ? `${exp.startDate} – Present`
                : `${exp.startDate} – ${exp.endDate ?? ""}`}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {exp.tech.map((t) => (
              <span key={t} className="badge badge-cyan">{t}</span>
            ))}
          </div>

          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {visibleBullets.map((r, j) => (
                <motion.li
                  key={j}
                  initial={j >= COLLAPSED_COUNT ? { opacity: 0, height: 0 } : false}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start gap-2.5 text-sm text-lightGrey leading-relaxed overflow-hidden"
                >
                  <span className="text-cyan/60 font-mono mt-0.5 flex-shrink-0 text-xs">▶</span>
                  <span>{r}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1.5 mt-3 text-xs font-mono text-cyan/70 hover:text-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-cyan/60 rounded"
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.span>
              {expanded ? "Show less" : `+${exp.responsibilities.length - COLLAPSED_COUNT} more`}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ExperienceMain({ experiences }: { experiences: ParsedExperience[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  return (
    <section id="experience" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 2xl:px-16 overflow-x-hidden" ref={sectionRef}>
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-14"
        >
          <p className="section-tag mb-4">Work History</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <h2 className="font-special text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Experience <span className="gradient-text">timeline</span>
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-mono text-lightGrey/50 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Star className="w-3 h-3 text-cyan" /> Most Recent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-[2px] bg-green/60 inline-block" /> Completed
              </span>
            </div>
          </div>
        </motion.div>

        <div className="relative pl-9 sm:pl-10 md:pl-12">
          {/* Animated timeline pipe */}
          <div className="absolute left-3 md:left-5 top-0 bottom-0 w-[2px] overflow-hidden">
            {/* Static base */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan/30 via-cyan/15 to-transparent" />
            {/* Flowing animation */}
            {inView && (
              <div
                className="absolute inset-0 timeline-flow"
                style={{ backgroundSize: "2px 32px" }}
              />
            )}
            {/* Moving dot */}
            {inView && (
              <div
                className="flow-dot-v"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  animationDuration: "3s",
                  animationDelay: "0.5s",
                }}
              />
            )}
          </div>

          <div className="flex flex-col gap-10">
            {experiences.map((exp, i) => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                index={i}
                inView={inView}
                isFeatured={i === 0 && !exp.isCurrent}
              />
            ))}
          </div>

          {/* Pipeline end marker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-cyan/25 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan/40 text-xs font-mono">+</span>
            </div>
            <p className="text-xs font-mono text-lightGrey/40">next role · open to opportunities</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
