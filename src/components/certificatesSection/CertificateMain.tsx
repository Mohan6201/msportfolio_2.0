"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Award } from "lucide-react";
import { certificates } from "@/data/portfolio.config";

export default function CertificateMain() {
  return (
    <section id="certificates" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-14"
        >
          <p className="section-tag mb-4">Credentials</p>
          <h2 className="font-special text-3xl sm:text-4xl font-bold text-white">
            Certifications &amp; <span className="gradient-text">Achievements</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="glass glass-hover rounded-2xl p-5 border border-white/5 flex flex-col gap-4"
            >
              {/* Logo / Image */}
              <div className="relative h-20 rounded-xl overflow-hidden bg-darkGrey/30 border border-white/5">
                {cert.image !== "images/blank.png" ? (
                  <Image
                    src={`/${cert.image}`}
                    alt={cert.title}
                    fill
                    className="object-contain p-3"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Award className="w-10 h-10 text-cyan/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-white text-sm font-semibold leading-snug">{cert.title}</p>
                <p className="text-cyan text-xs font-mono">{cert.issuer}</p>
                <p className="text-lightGrey text-xs leading-relaxed flex-1">{cert.description}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono text-lightGrey/60">
                    {new Date(cert.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  {cert.link && (
                    <a href={cert.link} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan text-[10px] font-mono hover:text-lightCyan transition-colors">
                      Verify <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {!cert.link && <span className="badge badge-orange text-[9px]">In Progress</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
