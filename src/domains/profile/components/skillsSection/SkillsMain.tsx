"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { SkillRow } from "@/domains/profile/services/profile.service";
import { SKILL_ICONS } from "@/domains/profile/lib/icons";
import { GiArtificialIntelligence } from "react-icons/gi";

const CATS = [
  { id: "all",        label: "All Skills" },
  { id: "cloud",      label: "Cloud / AWS" },
  { id: "devops",     label: "DevOps & IaC" },
  { id: "backend",    label: "Languages" },
  { id: "monitoring", label: "Monitoring" },
];

function SkillCard({ name, level, iconKey, delay }: {
  name: string; level: number; iconKey: string; delay: number;
}) {
  const Icon = SKILL_ICONS[iconKey] ?? GiArtificialIntelligence;
  const color = level >= 85 ? "cyan" : level >= 75 ? "green" : "orange";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay }}
      className="glass glass-hover rounded-xl p-4 border border-white/5 group cursor-default"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg bg-${color}/10 border border-${color}/20 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4.5 h-4.5 text-${color}`} />
        </div>
        <span className="text-white text-sm font-medium leading-tight">{name}</span>
        <span className={`ml-auto text-xs font-mono text-${color} font-bold`}>{level}%</span>
      </div>
      <div className="h-1 bg-darkGrey rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
          className={`h-full rounded-full bg-${color}`}
          style={{ boxShadow: `0 0 8px var(--color-${color})` }}
        />
      </div>
    </motion.div>
  );
}

export default function SkillsMain({ skills }: { skills: SkillRow[] }) {
  const [active, setActive] = useState("all");
  const filtered = active === "all" ? skills : skills.filter((s) => s.category === active);

  return (
    <section id="skills" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-12"
        >
          <p className="section-tag mb-4">Technical Skills</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="font-special text-3xl sm:text-4xl font-bold text-white">
              Tools I <span className="gradient-text">ship with</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                    active === c.id
                      ? "bg-cyan text-black font-bold shadow-cyanShadow"
                      : "border border-lightBrown/40 text-lightGrey hover:border-cyan/40 hover:text-cyan"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((s, i) => (
            <SkillCard key={s.id} name={s.name} level={s.level} iconKey={s.iconKey} delay={i * 0.04} />
          ))}
        </div>
      </div>
    </section>
  );
}
