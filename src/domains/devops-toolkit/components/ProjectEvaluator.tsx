"use client";
import { useState } from "react";
import type { ProjectEvaluation } from "@/ai/agents/evaluateProject";

const EXAMPLES = [
  "GitHub repo: https://github.com/user/project — Django REST API deployed on AWS ECS Fargate with Terraform, CI/CD via GitHub Actions, PostgreSQL RDS Multi-AZ, ElastiCache Redis, CloudFront CDN, WAF, and Route53. Prometheus + Grafana monitoring.",
  "Portfolio with 3 projects: 1) Kubernetes cluster setup on EKS with Helm, HPA, and Ingress. 2) Docker Compose stack for local dev. 3) Linux bash scripts for server automation. No CI/CD yet.",
  "Microservices architecture with 5 services in Python (FastAPI) and Node.js. Event-driven via Kafka. Each service has its own PostgreSQL/MongoDB. Deployed manually via SSH to EC2.",
  "Jenkins CI/CD pipeline deploying a React + Node.js app to AWS EC2 behind an ALB. Automated testing with Jest. Docker containers. Basic CloudWatch alarms.",
];

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "text-green" : s >= 60 ? "text-cyan" : s >= 40 ? "text-orange" : "text-red";

const SCORE_LABEL = (s: number) =>
  s >= 80 ? "Strong" : s >= 60 ? "Good" : s >= 40 ? "Developing" : "Needs Work";

export default function ProjectEvaluator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ProjectEvaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function evaluate() {
    if (!input.trim() || input.trim().length < 20) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/devops/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Evaluation failed"); return; }
      setResult(data.evaluation);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[10px] font-mono text-lightGrey/60 mb-2 uppercase tracking-wider">
          Describe Your Project or Portfolio
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Paste a GitHub URL, describe your architecture, list your tech stack, mention your deployment approach, and any DevOps practices in use…"
          className="input-field w-full resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setInput(ex)}
                className="text-[9px] font-mono text-lightGrey/40 hover:text-cyan border border-white/5 hover:border-cyan/20 rounded px-2 py-0.5 transition-colors">
                Example {i + 1}
              </button>
            ))}
          </div>
          <span className="text-[9px] font-mono text-lightGrey/30">{input.length}/2000</span>
        </div>
      </div>

      <button onClick={evaluate} disabled={loading || input.trim().length < 20}
        className="w-full sm:w-auto px-8 py-2.5 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors disabled:opacity-50">
        {loading ? "Evaluating with AI…" : "Evaluate Project"}
      </button>

      {error && <p className="text-red text-xs font-mono">{error}</p>}

      {result && (
        <div className="space-y-4 mt-2">
          {/* Score header */}
          <div className="glass rounded-2xl border border-white/10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-white font-special text-xl font-bold mb-1">{result.projectName}</h3>
                <p className={`font-mono text-sm font-bold ${SCORE_COLOR(result.overallScore)}`}>
                  {result.marketValue}
                </p>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-mono font-bold ${SCORE_COLOR(result.overallScore)}`}>
                  {result.overallScore}
                </div>
                <p className="text-lightGrey/50 text-[10px] font-mono uppercase tracking-wider">{SCORE_LABEL(result.overallScore)} / 100</p>
              </div>
            </div>

            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  result.overallScore >= 80 ? "bg-green" : result.overallScore >= 60 ? "bg-cyan" : result.overallScore >= 40 ? "bg-orange" : "bg-red"
                }`}
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
          </div>

          {/* Tech stack + salary */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass rounded-xl border border-white/10 p-4">
              <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-3">Tech Stack Identified</p>
              <div className="flex flex-wrap gap-1.5">
                {result.techStack.map((t) => (
                  <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-lightGrey">{t}</span>
                ))}
              </div>
            </div>
            <div className="glass rounded-xl border border-green/10 p-4 flex flex-col justify-center">
              <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-1">Estimated Salary Range</p>
              <p className="text-green font-mono font-bold text-lg">{result.estimatedSalaryRange}</p>
              <p className="text-lightGrey/40 text-[10px] font-mono mt-1">Target roles: {result.matchingRoles.join(", ")}</p>
            </div>
          </div>

          {/* Strengths + weaknesses + improvements */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl border border-green/10 p-4">
              <p className="text-[10px] font-mono text-green uppercase tracking-wider font-bold mb-3">Strengths</p>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-lightGrey text-[11px] font-mono flex gap-2">
                    <span className="text-green flex-shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl border border-red/10 p-4">
              <p className="text-[10px] font-mono text-red uppercase tracking-wider font-bold mb-3">Weaknesses</p>
              <ul className="space-y-2">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="text-lightGrey text-[11px] font-mono flex gap-2">
                    <span className="text-red flex-shrink-0">✗</span>{w}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-xl border border-cyan/10 p-4">
              <p className="text-[10px] font-mono text-cyan uppercase tracking-wider font-bold mb-3">Improvements</p>
              <ul className="space-y-2">
                {result.improvements.map((imp, i) => (
                  <li key={i} className="text-lightGrey text-[11px] font-mono flex gap-2">
                    <span className="text-cyan flex-shrink-0">▸</span>{imp}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hireability note */}
          <div className="glass rounded-xl border border-white/10 p-4">
            <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider mb-2">Recruiter Assessment</p>
            <p className="text-lightGrey text-sm font-mono leading-relaxed">{result.hirabilityNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
