"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import { FiArrowRight, FiDownload, FiGithub, FiLinkedin } from "react-icons/fi";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import Image from "next/image";

const LINES = [
  { prompt: "$ whoami",           output: "Mohana Srinivasan — AWS DevOps Engineer @ Swirepay" },
  { prompt: "$ cat stack.sh",     output: "AWS · Docker · K8s · Terraform · GitHub Actions · Helm" },
  { prompt: "$ uptime",           output: "4+ years in production  •  10+ shipped projects" },
  { prompt: "$ systemctl status", output: "● active (running)  —  Available for DevOps roles" },
];

const ORBIT_ITEMS = ["AWS", "K8s", "Docker", "Terraform", "Helm", "GitHub"];

function MatrixBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const cols = Math.floor(canvas.width / 18);
    const drops: number[] = Array(cols).fill(1);
    const chars = "01ABCDEF</>{}[]AWS#$";
    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(5,8,15,0.07)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0,212,255,0.15)";
      ctx.font = "12px monospace";
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 18, y * 18);
        if (y * 18 > canvas.height && Math.random() > 0.978) drops[i] = 0;
        drops[i]++;
      });
    }, 90);
    return () => { clearInterval(interval); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" />;
}

function TerminalBlock() {
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
  }, [phase, promptLen, outputLen, line]);

  return (
    <div className="terminal w-full max-w-xl">
      <div className="terminal-bar gap-2">
        <span className="w-3 h-3 rounded-full bg-red/70" />
        <span className="w-3 h-3 rounded-full bg-orange/70" />
        <span className="w-3 h-3 rounded-full bg-green/70" />
        <span className="ml-2 font-mono text-xs text-lightGrey/50">bash — mohana@swirepay ~ </span>
      </div>
      <div className="terminal-body min-h-[230px]">
        {LINES.slice(0, line + 1).map((L, i) => (
          <div key={i} className="mb-1.5">
            <div>
              <span className="terminal-prompt">
                {i < line ? L.prompt : L.prompt.slice(0, promptLen)}
              </span>
              {i === line && phase === "prompt" && <span className="terminal-cursor" />}
            </div>
            {(i < line || (i === line && (phase === "output" || doneLines > line))) && (
              <div className="terminal-output pl-2">
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

export default function HeroMain() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grid-bg">
      <div className="absolute inset-0 pointer-events-none">
        <MatrixBg />
        <div className="absolute -top-40 -right-60 w-[700px] h-[700px] rounded-full bg-cyan/4 blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange/4 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left ── */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 w-fit px-3 py-1.5 rounded-full bg-green/8 border border-green/20">
              <div className="status-dot" />
              <span className="text-xs font-mono text-green">Available for DevOps opportunities</span>
            </div>

            <div>
              <p className="section-tag mb-4">AWS DevOps Engineer • Swirepay</p>
              <h1 className="font-special font-bold leading-[1.05]">
                <span className="block text-4xl sm:text-5xl lg:text-[3.6rem] text-white mb-1">Mohana</span>
                <span className="block text-4xl sm:text-5xl lg:text-[3.6rem] gradient-text glitch">Srinivasan</span>
              </h1>
            </div>

            <TerminalBlock />

            <div className="flex flex-wrap gap-3 mt-1">
              <Link to="contact" smooth duration={600} offset={-80} className="cursor-pointer">
                <motion.button whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan text-black font-mono font-bold text-sm hover:bg-lightCyan transition-colors shadow-cyanShadow">
                  Hire Me <FiArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <a href="/assets/Mohana Srinivasan (Resume).pdf" download
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-orange/40 text-orange font-mono font-semibold text-sm hover:bg-orange/8 hover:border-orange/70 transition-all">
                Resume <FiDownload className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center gap-5 text-sm font-mono">
              <a href="https://github.com/Mohan6201" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-lightGrey hover:text-white transition-colors">
                <FiGithub className="w-3.5 h-3.5" /> GitHub
              </a>
              <span className="text-darkGrey">·</span>
              <a href="https://www.linkedin.com/in/mohan6201" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-lightGrey hover:text-cyan transition-colors">
                <FiLinkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            </div>
          </motion.div>

          {/* ── Right ── */}
          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center gap-8"
          >
            {/* Profile with orbit */}
            <div className="relative w-60 h-60 lg:w-72 lg:h-72">
              <div className="absolute inset-0 rounded-full border border-cyan/12 animate-spin" style={{ animationDuration: "22s" }} />
              <div className="absolute inset-5 rounded-full border border-orange/8 animate-spin" style={{ animationDuration: "16s", animationDirection: "reverse" }} />
              {ORBIT_ITEMS.map((tech, i) => {
                const delay = i * (22 / ORBIT_ITEMS.length);
                return (
                  <div key={tech} className="absolute inset-0 rounded-full pointer-events-none"
                    style={{ animation: `orbit 22s linear infinite`, animationDelay: `-${delay}s` }}>
                    <div className="absolute -top-3 left-1/2 px-2 py-0.5 rounded-full bg-darkBrown border border-cyan/25 text-[9px] font-mono text-cyan whitespace-nowrap"
                      style={{ transform: "translateX(-50%)" }}>
                      {tech}
                    </div>
                  </div>
                );
              })}
              <div className="absolute inset-9 rounded-full overflow-hidden border-2 border-cyan/20 shadow-cyanGlow floating">
                <Image src="/images/mebg.png" alt="Mohana Srinivasan" fill className="object-cover object-top" priority />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
              {[
                { value: 4,  suffix: "+", label: "Years Exp.", cls: "border-cyan/15 text-cyan" },
                { value: 10, suffix: "+", label: "Projects",  cls: "border-green/15 text-green" },
                { value: 3,  suffix: "",  label: "Certs",     cls: "border-orange/15 text-orange" },
              ].map(({ value, suffix, label, cls }) => (
                <div key={label} className={`glass rounded-xl p-3 text-center border ${cls.split(" ")[0]}`}>
                  <p className={`text-xl font-bold font-mono ${cls.split(" ")[1]}`}>
                    <AnimatedCounter target={value} suffix={suffix} />
                  </p>
                  <p className="text-[10px] text-lightGrey mt-0.5 font-mono">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
          <span className="text-[10px] font-mono text-lightGrey/40 tracking-widest uppercase">scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-cyan/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
