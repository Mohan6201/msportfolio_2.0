"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Award, X, ZoomIn } from "lucide-react";
import type { CertificationRow } from "@/domains/profile/services/profile.service";

function formatCertDate(raw: string): string {
  if (!raw) return "";
  if (/[A-Za-z]/.test(raw)) return raw.trim();
  const isoMatch = raw.match(/^(\d{4})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, 1);
    return d.toLocaleString("default", { month: "long", year: "numeric" });
  }
  return raw;
}

function CertCard({ cert, index }: { cert: CertificationRow; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const raw = cert.imageUrl ?? "";
  const src =
    raw.startsWith("//") || raw.includes("blank.png") || !raw
      ? null
      : raw.startsWith("http")
      ? raw
      : `/${raw.replace(/^\/+/, "")}`;

  const displayDate = formatCertDate(cert.date ?? "");

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: index * 0.08 }}
        className="glass glass-hover rounded-2xl p-5 border border-white/5 flex flex-col gap-4"
      >
        {/* Badge image */}
        <div className="relative h-24 rounded-xl overflow-hidden border border-white/5" style={{ backgroundColor: "#0d0d14" }}>
          {src ? (
            <Image src={src} alt={cert.title} fill className="object-contain p-2" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-10 h-10 text-cyan/40" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-snug break-words">{cert.title}</p>
          <p className="text-cyan text-xs font-mono break-words">{cert.issuer}</p>
          <p className="text-lightGrey text-xs leading-relaxed flex-1 break-words">{cert.description}</p>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
            <span className="text-[10px] font-mono text-lightGrey/60">{displayDate}</span>
            {cert.link ? (
              <a
                href={cert.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-cyan text-[10px] font-mono hover:text-lightCyan transition-colors"
              >
                Verify <ExternalLink className="w-2.5 h-2.5" />
              </a>
            ) : (
              <span className="badge badge-orange text-[9px]">In Progress</span>
            )}
          </div>

          {src && (
            <button
              onClick={() => setExpanded(true)}
              className="mt-1 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-lightGrey/60 hover:text-cyan hover:border-cyan/30 transition-all"
            >
              <ZoomIn className="w-3 h-3" /> View Certificate
            </button>
          )}
        </div>
      </motion.div>

      {/* Lightbox — object-contain with padding so full cert is readable */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-white/10"
              style={{ backgroundColor: "#0d0d10" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div>
                  <p className="text-white font-semibold text-sm">{cert.title}</p>
                  <p className="text-cyan text-[11px] font-mono mt-0.5">
                    {cert.issuer} · {displayDate}
                  </p>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="p-1.5 rounded-lg border border-white/10 text-lightGrey/60 hover:text-white hover:border-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Certificate image — tall enough to read content */}
              <div className="relative w-full bg-white/5" style={{ minHeight: "520px" }}>
                <Image src={src!} alt={cert.title} fill className="object-contain" />
              </div>

              <div className="flex items-center justify-between px-5 py-4 border-t border-white/10">
                {cert.link ? (
                  <a
                    href={cert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] font-mono text-cyan hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Verify Credential
                  </a>
                ) : (
                  <span className="badge badge-orange text-[10px]">In Progress</span>
                )}
                <button
                  onClick={() => setExpanded(false)}
                  className="text-[11px] font-mono text-lightGrey/40 hover:text-white transition-colors"
                >
                  Close esc
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function CertificateMain({
  certifications,
}: {
  certifications: CertificationRow[];
}) {
  return (
    <section id="certificates" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-10 sm:mb-14"
        >
          <p className="section-tag mb-4">Credentials</p>
          <h2 className="font-special text-2xl sm:text-4xl font-bold text-white">
            Certifications &amp; <span className="gradient-text">Achievements</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert, i) => (
            <CertCard key={cert.id} cert={cert} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
