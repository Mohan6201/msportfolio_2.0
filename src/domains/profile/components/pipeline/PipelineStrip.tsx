"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  GitCommit, Package, ShieldCheck, Rocket, Activity, CheckCircle2, Clock, Loader2,
} from "lucide-react";

type StageStatus = "success" | "running" | "idle";

interface Stage {
  id: string;
  icon: React.ElementType;
  label: string;
  detail: string;
  duration: string;
  status: StageStatus;
  color: "cyan" | "green" | "orange" | "purple";
}

const STAGES: Stage[] = [
  { id: "code",    icon: GitCommit,    label: "Code",     detail: "git push origin main",    duration: "00:00", status: "success", color: "green"  },
  { id: "build",   icon: Package,      label: "Build",    detail: "docker build · ECR push",  duration: "02:14", status: "success", color: "cyan"   },
  { id: "test",    icon: ShieldCheck,  label: "Test",     detail: "47 passed · 0 failed",    duration: "01:32", status: "success", color: "cyan"   },
  { id: "deploy",  icon: Rocket,       label: "Deploy",   detail: "ECS · production",         duration: "00:48", status: "running", color: "orange" },
  { id: "monitor", icon: Activity,     label: "Monitor",  detail: "Grafana · Prometheus",    duration: "live",  status: "idle",    color: "purple" },
];

const STATUS_COLOR: Record<StageStatus, string> = {
  success: "border-green/40  bg-green/8  text-green",
  running: "border-orange/40 bg-orange/8 text-orange",
  idle:    "border-white/10  bg-white/3  text-lightGrey",
};

const STATUS_ICON: Record<StageStatus, React.ElementType> = {
  success: CheckCircle2,
  running: Loader2,
  idle:    Clock,
};

function FlowingConnector({ active, color = "cyan" }: { active: boolean; color?: string }) {
  return (
    <div className="relative flex-1 h-[2px] mx-1 overflow-visible hidden md:block" aria-hidden>
      {/* base line */}
      <div className={`absolute inset-0 bg-gradient-to-r from-${color}/40 via-${color}/20 to-${color}/5 rounded-full`} />
      {/* flowing dots */}
      {active && [0, 0.7, 1.4].map((delay) => (
        <div
          key={delay}
          className="flow-dot"
          style={{ animationDelay: `${delay}s`, background: `var(--color-${color})`, boxShadow: `0 0 6px var(--color-${color})` }}
        />
      ))}
    </div>
  );
}

function StageCard({ stage, index, active }: { stage: Stage; index: number; active: boolean }) {
  const Icon = stage.icon;
  const StatusIcon = STATUS_ICON[stage.status];
  const colorMap: Record<string, string> = {
    cyan:   "text-cyan   border-cyan/30   bg-cyan/8   shadow-cyan/10",
    green:  "text-green  border-green/30  bg-green/8  shadow-green/10",
    orange: "text-orange border-orange/30 bg-orange/8 shadow-orange/10",
    purple: "text-purple border-purple/30 bg-purple/8 shadow-purple/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
      className={`relative flex flex-col items-center gap-2 px-3 py-3 rounded-xl border
        glass transition-all duration-300 hover:scale-[1.04] cursor-default min-w-[90px] md:min-w-0
        ${colorMap[stage.color]}`}
    >
      {/* Stage number */}
      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-lightGrey/50 bg-darkBrown px-1">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${colorMap[stage.color]}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="text-center">
        <p className="text-[11px] font-mono font-bold tracking-wide text-white leading-none mb-0.5">
          {stage.label}
        </p>
        <p className="text-[9px] font-mono text-lightGrey/60 leading-tight hidden md:block">
          {stage.detail}
        </p>
      </div>

      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-mono ${STATUS_COLOR[stage.status]}`}>
        <StatusIcon className={`w-2.5 h-2.5 ${stage.status === "running" ? "animate-spin" : ""}`} />
        {stage.duration}
      </div>
    </motion.div>
  );
}

export default function PipelineStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setTick((n) => n + 1), 2000);
    return () => clearInterval(t);
  }, [inView]);

  return (
    <section ref={ref} className="relative py-8 sm:py-10 px-4 sm:px-6 border-y border-white/5 overflow-hidden">
      {/* subtle background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan/2 via-transparent to-orange/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6 gap-3 sm:gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-orange/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green/70" />
            </div>
            <span className="font-mono text-[11px] sm:text-xs text-lightGrey/60 truncate">
              <span className="text-green">$</span> ./pipeline.sh --env production --branch main
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 sm:gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-green">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse inline-block" />
              Pipeline Active
            </span>
            <span className="text-lightGrey/40">|</span>
            <span className="text-lightGrey/60">Build #{248 + (tick % 10)}</span>
            <span className="text-lightGrey/40">|</span>
            <span className="text-cyan">≈ 4m 34s avg</span>
          </div>
        </motion.div>

        {/* Pipeline stages — horizontal scroll on mobile, full row on md+ */}
        <div className="flex items-stretch gap-2 md:gap-0 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:overflow-visible md:pb-0 scrollbar-hide snap-x snap-mandatory md:snap-none">
          {STAGES.map((stage, i) => (
            <div key={stage.id} className="flex items-center flex-shrink-0 snap-start md:flex-shrink md:flex-1">
              <StageCard stage={stage} index={i} active={inView} />
              {i < STAGES.length - 1 && (
                <FlowingConnector
                  active={inView && stage.status === "success"}
                  color={STAGES[i + 1].color}
                />
              )}
            </div>
          ))}
        </div>

        {/* Bottom log line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-5 px-3 py-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-lightGrey/50 flex items-start sm:items-center gap-2 overflow-hidden"
        >
          <span className="text-green flex-shrink-0 mt-0.5 sm:mt-0">●</span>
          <span className="neon-flicker break-words sm:truncate">
            [INFO] ECS task revision 47 → healthy · ALB target group 200 OK · Prometheus scrape interval 15s · Zero incidents today
          </span>
        </motion.div>
      </div>
    </section>
  );
}
