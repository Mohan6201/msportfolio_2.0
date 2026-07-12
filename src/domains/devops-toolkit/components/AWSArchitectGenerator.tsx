"use client";
import { useState } from "react";
import type { AWSArchitecture } from "@/ai/agents/generateDevOpsConfig";

const EXAMPLES = [
  "Django REST API with 5000 daily active users, PostgreSQL database, Redis cache, need high availability and auto-scaling",
  "React SPA + Node.js API, 50k monthly visitors, need CDN, SSL, and zero-downtime deployments",
  "Microservices architecture with 5 services, event-driven communication, needs to handle traffic spikes of 10x",
  "Data pipeline ingesting 1TB/day from IoT devices, need real-time processing and S3 data lake",
];

export default function AWSArchitectGenerator() {
  const [requirements, setRequirements] = useState("");
  const [result, setResult] = useState<AWSArchitecture | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!requirements.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/devops/architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed"); return; }
      setResult(data.architecture);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] font-mono text-lightGrey/60 mb-2 uppercase tracking-wider">Describe Your Requirements</label>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Describe your application: tech stack, expected traffic, scaling needs, compliance requirements, budget constraints…"
          className="input-field w-full resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setRequirements(ex)}
                className="text-[9px] font-mono text-lightGrey/40 hover:text-cyan border border-white/5 hover:border-cyan/20 rounded px-2 py-0.5 transition-colors">
                Example {i + 1}
              </button>
            ))}
          </div>
          <span className="text-[9px] font-mono text-lightGrey/30">{requirements.length}/1000</span>
        </div>
      </div>

      <button onClick={generate} disabled={loading || !requirements.trim()}
        className="w-full sm:w-auto px-8 py-2.5 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors disabled:opacity-50">
        {loading ? "Generating Architecture…" : "Generate AWS Architecture"}
      </button>

      {error && <p className="text-red text-xs font-mono">{error}</p>}

      {result && (
        <div className="space-y-4 mt-2">
          <div className="glass rounded-xl border border-cyan/20 p-5">
            <h3 className="text-white font-mono font-bold text-base mb-1">{result.title}</h3>
            <p className="text-lightGrey text-xs font-mono">{result.overview}</p>
          </div>

          {/* ASCII Diagram */}
          <div className="glass rounded-xl border border-white/10 p-4">
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-2">Architecture Diagram</p>
            <pre className="text-green text-[10px] font-mono whitespace-pre overflow-x-auto">{result.diagramAscii}</pre>
          </div>

          {/* Components */}
          <div className="glass rounded-xl border border-white/10 p-4">
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-3">AWS Services</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {result.components.map((c, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange text-[10px] font-mono font-bold">{c.awsService}</span>
                    <span className="text-lightGrey/30 text-[9px] font-mono">·</span>
                    <span className="text-white text-[10px] font-mono">{c.name}</span>
                  </div>
                  <p className="text-lightGrey/60 text-[10px] font-mono">{c.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "Data Flow", items: result.dataFlow, color: "text-cyan" },
              { title: "Security", items: result.security, color: "text-red" },
              { title: "Scaling", items: result.scaling, color: "text-green" },
            ].map((s) => (
              <div key={s.title} className="glass rounded-xl border border-white/10 p-4">
                <p className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-2 ${s.color}`}>{s.title}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item, i) => (
                    <li key={i} className="text-lightGrey text-[10px] font-mono flex gap-1.5">
                      <span className={s.color}>▸</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl border border-green/10 p-4 flex items-center gap-4">
            <p className="text-[10px] font-mono text-lightGrey/60 uppercase tracking-wider">Estimated Monthly Cost</p>
            <p className="text-green font-mono font-bold text-lg">{result.estimatedMonthlyCost}</p>
          </div>
        </div>
      )}
    </div>
  );
}
