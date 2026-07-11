"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SkillRow } from "@/domains/profile/services/profile.service";
import { SKILL_ICONS } from "@/domains/profile/lib/icons";
import { GiArtificialIntelligence } from "react-icons/gi";

const CATS = [
  { id: "all",        label: "All Skills",    count: 0 },
  { id: "cloud",      label: "Cloud / AWS",   count: 0 },
  { id: "devops",     label: "DevOps & IaC",  count: 0 },
  { id: "backend",    label: "Languages & OS", count: 0 },
  { id: "monitoring", label: "Monitoring",    count: 0 },
];

function SkillCard({ name, level, iconKey, delay }: {
  name: string; level: number; iconKey: string; delay: number;
}) {
  const Icon = SKILL_ICONS[iconKey] ?? GiArtificialIntelligence;
  const color  = level >= 85 ? "cyan"   : level >= 75 ? "green"  : "orange";
  const glow   = level >= 85 ? "rgba(0,212,255,0.3)" : level >= 75 ? "rgba(0,255,136,0.3)" : "rgba(255,107,53,0.3)";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 12 }}
      transition={{ duration: 0.35, delay, type: "spring", stiffness: 280, damping: 24 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass rounded-xl p-4 border border-white/5 group cursor-default relative overflow-hidden"
      style={{ "--glow": glow } as React.CSSProperties}
    >
      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-xl">
        <div
          className="absolute top-0 -left-full w-1/2 h-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
            animation: "slide-right 1.2s ease-out forwards",
          }}
        />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg bg-${color}/10 border border-${color}/25 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-${color}/15 group-hover:shadow-[0_0_12px_var(--glow)]`}>
          <Icon className={`w-[18px] h-[18px] text-${color}`} />
        </div>
        <span className="text-white text-sm font-medium leading-tight flex-1 min-w-0">{name}</span>
        <span className={`text-xs font-mono text-${color} font-bold flex-shrink-0`}>{level}%</span>
      </div>

      <div className="h-1.5 bg-darkGrey rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: delay + 0.15, ease: "easeOut" }}
          className={`h-full rounded-full bg-${color} relative`}
          style={{ boxShadow: `0 0 8px ${glow}` }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/25 blur-sm rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SkillsMain({ skills }: { skills: SkillRow[] }) {
  const [active, setActive] = useState("all");
  const filtered = active === "all" ? skills : skills.filter((s) => s.category === active);

  const counts = Object.fromEntries(
    CATS.map((c) => [c.id, c.id === "all" ? skills.length : skills.filter((s) => s.category === c.id).length])
  );

  return (
    <section id="skills" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 2xl:px-16 overflow-x-hidden">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12"
        >
          <p className="section-tag mb-4">Technical Skills</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-special text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Tools I <span className="gradient-text">ship with</span>
            </h2>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 flex items-center gap-1.5 ${
                    active === c.id
                      ? "bg-cyan text-black font-bold shadow-cyanShadow"
                      : "border border-lightBrown/40 text-lightGrey hover:border-cyan/40 hover:text-cyan"
                  }`}
                >
                  {c.label}
                  <span className={`text-[9px] px-1 rounded ${active === c.id ? "bg-black/20 text-black" : "bg-white/5 text-lightGrey/60"}`}>
                    {counts[c.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={active}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3"
          >
            {filtered.map((s, i) => (
              <SkillCard
                key={s.id}
                name={s.name}
                level={s.level}
                iconKey={s.iconKey}
                delay={i * 0.035}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex items-center gap-3"
        >
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
          <span className="text-[10px] font-mono text-lightGrey/30 whitespace-nowrap text-center">
            {skills.length} skills · {Math.round(skills.reduce((a, s) => a + s.level, 0) / skills.length)}% avg
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
