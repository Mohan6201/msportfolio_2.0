"use client";
import { useState } from "react";
import { generateGithubActions, type GHAConfig } from "../utils/githubActionsGenerator";

const LANGUAGES = [
  { key: "node",   label: "Node.js" },
  { key: "python", label: "Python" },
  { key: "go",     label: "Go" },
  { key: "java",   label: "Java" },
  { key: "docker", label: "Docker only" },
] as const;

const STEPS = [
  { key: "lint",        label: "Lint" },
  { key: "test",        label: "Run Tests" },
  { key: "build",       label: "Build" },
  { key: "docker-build", label: "Build & Push Docker Image" },
  { key: "deploy-ec2",  label: "Deploy to EC2 (SSH)" },
  { key: "deploy-ecs",  label: "Deploy to Amazon ECS" },
  { key: "deploy-k8s",  label: "Deploy to Kubernetes" },
];

export default function GithubActionsGenerator() {
  const [projectName, setProjectName] = useState("my-app");
  const [language, setLanguage] = useState<GHAConfig["language"]>("node");
  const [steps, setSteps] = useState<string[]>(["test", "docker-build", "deploy-ec2"]);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function toggleStep(key: string) {
    setSteps((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  }

  function generate() {
    setOutput(generateGithubActions({ projectName, language, steps }));
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
            placeholder="my-app" className="input-field w-full" />
        </div>

        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-2 uppercase tracking-wider">Language / Stack</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button key={l.key} onClick={() => setLanguage(l.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                  language === l.key ? "bg-cyan/15 border-cyan/40 text-cyan" : "border-white/10 text-lightGrey hover:border-white/20 hover:text-white"
                }`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-2 uppercase tracking-wider">Pipeline Steps</label>
          <div className="space-y-2">
            {STEPS.map((s) => (
              <label key={s.key} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                steps.includes(s.key) ? "border-cyan/30 bg-cyan/5" : "border-white/5 hover:border-white/10"
              }`}>
                <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${
                  steps.includes(s.key) ? "bg-cyan border-cyan" : "border-white/30"
                }`}>
                  {steps.includes(s.key) && <span className="text-[8px] text-black font-bold">✓</span>}
                </span>
                <input type="checkbox" checked={steps.includes(s.key)} onChange={() => toggleStep(s.key)} className="hidden" />
                <span className={`text-xs font-mono ${steps.includes(s.key) ? "text-cyan" : "text-lightGrey"}`}>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={generate}
          className="w-full py-2.5 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors">
          Generate Workflow
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono text-lightGrey/60 uppercase tracking-wider">.github/workflows/ci.yml</span>
          {output && (
            <button onClick={copy} className="text-[10px] font-mono text-cyan hover:text-white transition-colors">
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-[10px] font-mono text-green overflow-auto h-[440px] whitespace-pre-wrap">
          {output || <span className="text-lightGrey/30">GitHub Actions workflow will appear here…</span>}
        </pre>
      </div>
    </div>
  );
}
