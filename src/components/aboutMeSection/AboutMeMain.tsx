"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiGithub, FiLinkedin, FiMail, FiCode, FiServer, FiCloud } from "react-icons/fi";

const HIGHLIGHTS = [
  { icon: FiCloud,  label: "Cloud Architecture",  desc: "AWS multi-region, HA design" },
  { icon: FiServer, label: "Infrastructure as Code", desc: "Terraform, Ansible, CloudFormation" },
  { icon: FiCode,   label: "CI/CD Automation",    desc: "GitHub Actions, CodePipeline, Jenkins" },
];

export default function AboutMeMain() {
  return (
    <section id="about" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="section-tag mb-4">About Me</p>
              <h2 className="font-special text-3xl sm:text-4xl font-bold text-white mb-4">
                Building the infra that{" "}
                <span className="gradient-text">keeps production running</span>
              </h2>
            </div>

            <div className="terminal w-full">
              <div className="terminal-bar gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-orange/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green/70" />
                <span className="font-mono text-xs text-lightGrey/50 ml-2">about.md</span>
              </div>
              <div className="terminal-body text-sm leading-relaxed">
                <p className="text-lightGrey mb-3">
                  I&apos;m a <span className="text-cyan font-semibold">DevOps Engineer</span> currently at{" "}
                  <a href="https://swirepay.com" target="_blank" rel="noopener noreferrer"
                    className="text-orange hover:text-lightOrange transition-colors font-semibold">Swirepay</a>,
                  building cloud-native payment infrastructure on AWS.
                </p>
                <p className="text-lightGrey mb-3">
                  Over <span className="text-green font-semibold">4+ years</span>, I&apos;ve designed
                  CI/CD pipelines, containerised microservices with Docker and Kubernetes,
                  and automated infrastructure with Terraform — reducing deployment times
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
            <div className="flex gap-3">
              <a href="https://github.com/Mohan6201" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-lightBrown/40 text-lightGrey hover:text-white hover:border-white/20 transition-all text-sm font-mono">
                <FiGithub className="w-4 h-4" /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/mohan6201" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-lightBrown/40 text-lightGrey hover:text-cyan hover:border-cyan/30 transition-all text-sm font-mono">
                <FiLinkedin className="w-4 h-4" /> LinkedIn
              </a>
              <a href="mailto:mohandevopssme@gmail.com"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-lightBrown/40 text-lightGrey hover:text-orange hover:border-orange/30 transition-all text-sm font-mono">
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
            className="flex flex-col items-center gap-6"
          >
            {/* Profile image */}
            <div className="relative w-64 h-72 lg:w-72 lg:h-80">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan/20 via-transparent to-orange/10 blur-xl" />
              <div className="relative rounded-2xl overflow-hidden border border-cyan/15 shadow-cyanGlow w-full h-full">
                <Image src="/images/mebg.png" alt="Mohana Srinivasan" fill className="object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-special font-bold text-white text-lg">Mohana Srinivasan</p>
                  <p className="text-cyan text-xs font-mono">DevOps Engineer @ Swirepay</p>
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { label: "Location",   value: "Hyderabad, IN", color: "cyan" },
                { label: "Status",     value: "Open to Work",  color: "green" },
                { label: "Focus",      value: "AWS + K8s",     color: "orange" },
                { label: "Experience", value: "4+ Years",      color: "purple" },
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
