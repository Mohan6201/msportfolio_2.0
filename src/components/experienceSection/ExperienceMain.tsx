"use client";
import { motion } from "framer-motion";
import { experiences } from "@/data/portfolio.config";
import { ExternalLink, Building2, Calendar } from "lucide-react";

export default function ExperienceMain() {
  return (
    <section id="experience" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-14"
        >
          <p className="section-tag mb-4">Work History</p>
          <h2 className="font-special text-3xl sm:text-4xl font-bold text-white">
            Experience <span className="gradient-text">timeline</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-cyan/40 via-cyan/20 to-transparent" />

          <div className="flex flex-col gap-10">
            {experiences.map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-12 md:pl-16"
              >
                {/* Timeline dot */}
                <div className={`absolute left-1.5 md:left-3.5 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  exp.current
                    ? "border-cyan bg-cyan/20 pulse-cyan"
                    : "border-lightBrown bg-darkBrown"
                }`}>
                  {exp.current && <div className="w-2 h-2 rounded-full bg-cyan" />}
                </div>

                {/* Card */}
                <div className={`glass rounded-2xl p-6 border transition-all duration-300 hover:border-cyan/20 ${
                  exp.current ? "border-cyan/15" : "border-white/5"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-special font-bold text-lg text-white">{exp.job}</h3>
                        {exp.current && (
                          <span className="badge badge-green text-[10px]">● Current</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-orange text-sm font-mono">
                          <Building2 className="w-3.5 h-3.5" />
                          {exp.companyUrl ? (
                            <a href={exp.companyUrl} target="_blank" rel="noopener noreferrer"
                              className="hover:text-lightOrange transition-colors flex items-center gap-1">
                              {exp.company} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : exp.company}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-lightGrey text-xs font-mono bg-darkGrey/40 px-3 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {exp.date}
                    </div>
                  </div>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {exp.tech.map((t) => (
                      <span key={t} className="badge badge-cyan">{t}</span>
                    ))}
                  </div>

                  {/* Responsibilities */}
                  <ul className="flex flex-col gap-2">
                    {exp.responsibilities.map((r, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-lightGrey leading-relaxed">
                        <span className="text-cyan font-mono mt-0.5 flex-shrink-0">▶</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
