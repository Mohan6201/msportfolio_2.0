"use client";
import { useState, useEffect, useCallback, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface MetricPoint {
  value: number;
  timestamp: string;
}

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  code: number;
  uptime: string;
}

interface LogLine {
  id: number;
  time: string;
  level: "INFO" | "WARN" | "ERROR";
  message: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toFixed(1); }

function now() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function nextValue(prev: number, min: number, max: number, drift: number = 5): number {
  return clamp(prev + (Math.random() * drift * 2 - drift), min, max);
}

const LOG_MESSAGES = [
  () => ({ l: "INFO" as const, m: `[nginx] ${Math.floor(Math.random() * 50) + 5} req/s — ${200} OK — ${(Math.random() * 5 + 1).toFixed(0)}ms avg latency` }),
  () => ({ l: "INFO" as const, m: `[app] healthcheck OK — DB: ${(Math.random() * 3 + 1).toFixed(1)}ms — Redis: ${(Math.random() * 0.5).toFixed(2)}ms` }),
  () => ({ l: "INFO" as const, m: `[scheduler] job run_analytics completed in ${(Math.random() * 0.9 + 0.1).toFixed(2)}s` }),
  () => ({ l: "WARN" as const, m: `[rds] connection pool at ${Math.floor(Math.random() * 30 + 60)}% capacity` }),
  () => ({ l: "INFO" as const, m: `[ecs] task ${Math.floor(Math.random() * 8 + 1)} healthy — memory: ${Math.floor(Math.random() * 40 + 30)}%` }),
  () => ({ l: "INFO" as const, m: `[cloudfront] cache hit rate: ${(Math.random() * 10 + 87).toFixed(1)}%` }),
  () => ({ l: "INFO" as const, m: `[alb] target group healthy — 4/4 targets passing` }),
];

const INIT_SERVICES: ServiceStatus[] = [
  { name: "App Server",   endpoint: "/api/health",   status: "healthy",  latency: 12,  code: 200, uptime: "99.97%" },
  { name: "Database",     endpoint: "/db/ping",      status: "healthy",  latency: 4,   code: 200, uptime: "99.99%" },
  { name: "Redis Cache",  endpoint: "/cache/ping",   status: "healthy",  latency: 0.8, code: 200, uptime: "100%" },
  { name: "Nginx",        endpoint: "/nginx/status", status: "healthy",  latency: 0.3, code: 200, uptime: "100%" },
  { name: "S3 Bucket",    endpoint: "/s3/check",     status: "healthy",  latency: 45,  code: 200, uptime: "99.99%" },
  { name: "ECR Registry", endpoint: "/ecr/check",    status: "healthy",  latency: 120, code: 200, uptime: "99.95%" },
];

const MAX_POINTS = 20;

function genPoints(base: number, range: number): MetricPoint[] {
  return Array.from({ length: MAX_POINTS }, (_, i) => ({
    value: clamp(base + (Math.random() * range - range / 2), 0, 100),
    timestamp: `T-${MAX_POINTS - i}s`,
  }));
}

// ── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ points, color, fill }: { points: MetricPoint[]; color: string; fill?: string }) {
  const W = 280;
  const H = 60;
  const pad = 4;

  const vals = points.map((p) => p.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals) || 1;

  const toX = (i: number) => pad + ((W - pad * 2) / (vals.length - 1)) * i;
  const toY = (v: number) => H - pad - ((v - minV) / (maxV - minV || 1)) * (H - pad * 2);

  const linePath = vals.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");
  const areaPath = [
    `M ${toX(0)} ${H}`,
    ...vals.map((v, i) => `L ${toX(i)} ${toY(v)}`),
    `L ${toX(vals.length - 1)} ${H}`,
    "Z",
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14 overflow-visible">
      {fill && <path d={areaPath} fill={fill} opacity={0.15} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={toX(vals.length - 1)} cy={toY(vals[vals.length - 1])} r={3} fill={color} />
    </svg>
  );
}

// ── Gauge ─────────────────────────────────────────────────────────────────────

function Gauge({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ServiceStatus["status"] }) {
  const styles: Record<typeof status, string> = {
    healthy:  "text-green border-green/30 bg-green/10",
    degraded: "text-orange border-orange/30 bg-orange/10",
    down:     "text-red border-red/30 bg-red/10",
  };
  return (
    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MonitoringDemo() {
  const [cpu,    setCpu]    = useState(() => genPoints(42, 30));
  const [mem,    setMem]    = useState(() => genPoints(58, 15));
  const [reqRate, setReqRate] = useState(() => genPoints(35, 25));
  const [disk,   setDisk]   = useState(37);
  const [services, setServices] = useState<ServiceStatus[]>(INIT_SERVICES);
  const [logs,   setLogs]   = useState<LogLine[]>([]);
  const [tick,   setTick]   = useState(0);
  const logId = useRef(0);

  const addPoint = (prev: MetricPoint[], newVal: number): MetricPoint[] => [
    ...prev.slice(1),
    { value: newVal, timestamp: now() },
  ];

  const update = useCallback(() => {
    setCpu((p) => addPoint(p, nextValue(p[p.length - 1].value, 10, 90, 6)));
    setMem((p) => addPoint(p, nextValue(p[p.length - 1].value, 40, 80, 3)));
    setReqRate((p) => addPoint(p, nextValue(p[p.length - 1].value, 5, 75, 8)));
    setDisk((p) => clamp(p + (Math.random() > 0.95 ? 0.1 : 0), 30, 95));

    setServices((prev) =>
      prev.map((svc) => ({
        ...svc,
        latency: clamp(nextValue(svc.latency, 0, 200, svc.latency * 0.15), 0.1, 300),
        status: Math.random() > 0.98 ? "degraded" : "healthy",
      }))
    );

    const template = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]();
    setLogs((prev) => [
      { id: ++logId.current, time: now(), level: template.l, message: template.m },
      ...prev.slice(0, 14),
    ]);

    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    // Generate initial logs
    for (let i = 0; i < 8; i++) {
      const template = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)]();
      setLogs((prev) => [
        ...prev,
        { id: logId.current++, time: now(), level: template.l, message: template.m },
      ]);
    }
    const id = setInterval(update, 2000);
    return () => clearInterval(id);
  }, [update]);

  const cpuVal = cpu[cpu.length - 1].value;
  const memVal = mem[mem.length - 1].value;
  const rpsVal = reqRate[reqRate.length - 1].value;

  const cpuColor = cpuVal > 80 ? "#f97316" : cpuVal > 60 ? "#facc15" : "#22d3ee";
  const memColor = memVal > 85 ? "#f97316" : memVal > 70 ? "#facc15" : "#a78bfa";

  return (
    <div className="space-y-5">
      {/* Live indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
        <span className="text-green text-[10px] font-mono">LIVE — updates every 2s</span>
        <span className="text-lightGrey/30 text-[9px] font-mono ml-auto">Tick #{tick} · Synthetic data</span>
      </div>

      {/* Service health overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {services.map((svc) => (
          <div key={svc.name} className={`glass rounded-xl border p-3 text-center transition-colors ${
            svc.status === "healthy" ? "border-green/20" : "border-orange/30"
          }`}>
            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${svc.status === "healthy" ? "bg-green animate-pulse" : "bg-orange"}`} />
            <p className="text-white text-[10px] font-mono font-bold">{svc.name}</p>
            <p className="text-lightGrey/40 text-[9px] font-mono mt-0.5">{svc.latency.toFixed(1)}ms</p>
          </div>
        ))}
      </div>

      {/* Metric charts row */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* CPU */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider">CPU Usage</p>
            <p className={`font-mono font-bold text-base`} style={{ color: cpuColor }}>{fmt(cpuVal)}%</p>
          </div>
          <Sparkline points={cpu} color={cpuColor} fill={cpuColor} />
          <Gauge value={cpuVal} color={cpuColor} />
        </div>

        {/* Memory */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider">Memory</p>
            <p className="font-mono font-bold text-base" style={{ color: memColor }}>{fmt(memVal)}%</p>
          </div>
          <Sparkline points={mem} color={memColor} fill={memColor} />
          <Gauge value={memVal} color={memColor} />
        </div>

        {/* Request Rate */}
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider">Requests / sec</p>
            <p className="text-orange font-mono font-bold text-base">{fmt(rpsVal)}</p>
          </div>
          <Sparkline points={reqRate} color="#f97316" fill="#f97316" />
          <Gauge value={(rpsVal / 75) * 100} color="#f97316" />
        </div>
      </div>

      {/* Disk + Service table row */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Disk */}
        <div className="glass rounded-xl border border-white/10 p-5">
          <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-4">Disk Usage</p>
          <div className="space-y-3">
            {[
              { label: "/",          used: disk,         color: disk > 80 ? "#f97316" : "#22d3ee" },
              { label: "/var/log",   used: clamp(disk * 0.3, 0, 100),  color: "#a78bfa" },
              { label: "/var/data",  used: clamp(disk * 1.5, 0, 100),  color: "#4ade80" },
            ].map((d) => (
              <div key={d.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-lightGrey text-[11px] font-mono">{d.label}</span>
                  <span className="text-[10px] font-mono" style={{ color: d.color }}>{fmt(d.used)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.used}%`, backgroundColor: d.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service health table */}
        <div className="glass rounded-xl border border-white/10 p-5 overflow-x-auto">
          <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-3">Service Health</p>
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="text-lightGrey/30 border-b border-white/5">
                <th className="text-left pb-2">Service</th>
                <th className="text-right pb-2">Status</th>
                <th className="text-right pb-2">Latency</th>
                <th className="text-right pb-2">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.name} className="border-b border-white/5 last:border-0">
                  <td className="py-1.5 text-lightGrey">{svc.name}</td>
                  <td className="py-1.5 text-right"><StatusBadge status={svc.status} /></td>
                  <td className="py-1.5 text-right text-lightGrey/60">{svc.latency.toFixed(1)}ms</td>
                  <td className="py-1.5 text-right text-green">{svc.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log stream */}
      <div className="glass rounded-xl border border-white/10 p-4">
        <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-3">Live Log Stream</p>
        <div className="font-mono text-[10px] space-y-0.5 max-h-40 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <span className="text-lightGrey/30 flex-shrink-0">{log.time}</span>
              <span className={`flex-shrink-0 ${
                log.level === "ERROR" ? "text-red" : log.level === "WARN" ? "text-orange" : "text-green/70"
              }`}>{log.level}</span>
              <span className="text-lightGrey/60">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
