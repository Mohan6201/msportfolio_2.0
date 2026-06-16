"use client";
import { useState } from "react";
import { generateDockerCompose } from "../utils/dockerComposeGenerator";

const AVAILABLE_SERVICES = [
  { key: "nodejs",     label: "Node.js" },
  { key: "python",     label: "Python / Flask" },
  { key: "nextjs",     label: "Next.js" },
  { key: "react",      label: "React (static)" },
  { key: "postgresql", label: "PostgreSQL" },
  { key: "mysql",      label: "MySQL" },
  { key: "redis",      label: "Redis" },
  { key: "mongodb",    label: "MongoDB" },
  { key: "nginx",      label: "Nginx" },
];

export default function DockerComposeGenerator() {
  const [projectName, setProjectName] = useState("myapp");
  const [selected, setSelected] = useState<string[]>(["nodejs", "postgresql", "redis"]);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function toggle(key: string) {
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  function generate() {
    if (selected.length === 0) return;
    setOutput(generateDockerCompose(projectName, selected));
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Project Name</label>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)}
            placeholder="myapp" className="input-field w-full" />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-2 uppercase tracking-wider">Services</label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_SERVICES.map((s) => (
              <label key={s.key} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                selected.includes(s.key) ? "border-cyan/40 bg-cyan/5 text-cyan" : "border-white/10 text-lightGrey hover:border-white/20"
              }`}>
                <input type="checkbox" checked={selected.includes(s.key)} onChange={() => toggle(s.key)} className="hidden" />
                <span className={`w-3 h-3 rounded border flex-shrink-0 flex items-center justify-center ${
                  selected.includes(s.key) ? "bg-cyan border-cyan" : "border-white/30"
                }`}>
                  {selected.includes(s.key) && <span className="text-[8px] text-black font-bold">✓</span>}
                </span>
                <span className="text-xs font-mono">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={selected.length === 0}
          className="w-full py-2.5 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors disabled:opacity-40">
          Generate docker-compose.yml
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-lightGrey/60 uppercase tracking-wider">docker-compose.yml</span>
          {output && (
            <button onClick={copy} className="text-[10px] font-mono text-cyan hover:text-white transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-[10px] font-mono text-green overflow-auto h-[420px] whitespace-pre-wrap">
          {output || <span className="text-lightGrey/30">docker-compose.yml will appear here…</span>}
        </pre>
      </div>
    </div>
  );
}
