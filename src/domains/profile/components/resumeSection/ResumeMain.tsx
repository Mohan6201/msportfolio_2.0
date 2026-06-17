"use client";
import { motion } from "framer-motion";
import ResumePreview from "./ResumePreview";

interface ResumeMainProps {
  resumeUrl: string | null;
}

export default function ResumeMain({ resumeUrl }: ResumeMainProps) {
  const pdfUrl = resumeUrl ?? "/resume/Mohana_Srinivasan_Resume.pdf";

  return (
    <section id="resume" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-10 sm:mb-14"
        >
          <p className="section-tag mb-4">Documents</p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
            <h2 className="font-special text-2xl sm:text-4xl font-bold text-white">
              My <span className="gradient-text">Resume</span>
            </h2>
            <p className="text-lightGrey text-xs sm:text-sm font-mono max-w-xs text-left sm:text-right">
              Embedded live · scroll inside to navigate pages
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <ResumePreview pdfUrl={pdfUrl} />
        </motion.div>
      </div>
    </section>
  );
}
