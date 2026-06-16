"use client";
import { useState } from "react";
import { Server, Container, GitBranch, Calculator, Cloud, Layers, Search, BookOpen } from "lucide-react";
import NginxGenerator from "./NginxGenerator";
import DockerComposeGenerator from "./DockerComposeGenerator";
import GithubActionsGenerator from "./GithubActionsGenerator";
import EC2Calculator from "./EC2Calculator";
import AWSArchitectGenerator from "./AWSArchitectGenerator";
import InfraPlayground from "./InfraPlayground";
import ProjectEvaluator from "./ProjectEvaluator";
import BlueprintMarketplace from "./BlueprintMarketplace";

const TOOLS = [
  {
    id: "nginx",
    label: "Nginx Config",
    icon: Server,
    description: "Reverse proxy, load balancer, static server, SSL",
    badge: "Generator",
    badgeColor: "text-green border-green/30 bg-green/5",
  },
  {
    id: "docker",
    label: "Docker Compose",
    icon: Container,
    description: "Multi-container stacks with one click",
    badge: "Generator",
    badgeColor: "text-cyan border-cyan/30 bg-cyan/5",
  },
  {
    id: "gha",
    label: "GitHub Actions",
    icon: GitBranch,
    description: "CI/CD pipelines for any language & deploy target",
    badge: "Generator",
    badgeColor: "text-orange border-orange/30 bg-orange/5",
  },
  {
    id: "ec2",
    label: "EC2 Cost Calculator",
    icon: Calculator,
    description: "On-Demand vs Reserved pricing comparison",
    badge: "Calculator",
    badgeColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  },
  {
    id: "aws-arch",
    label: "AWS Architecture",
    icon: Cloud,
    description: "AI-designed architecture for your requirements",
    badge: "AI",
    badgeColor: "text-[#ff4d94] border-[#ff4d94]/30 bg-[#ff4d94]/5",
  },
  {
    id: "infra",
    label: "Infra Playground",
    icon: Layers,
    description: "Select AWS components → get Terraform + cost estimate",
    badge: "Builder",
    badgeColor: "text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/5",
  },
  {
    id: "eval",
    label: "Project Evaluator",
    icon: Search,
    description: "AI evaluates your project: score, market value, salary range",
    badge: "AI",
    badgeColor: "text-green border-green/30 bg-green/5",
  },
  {
    id: "blueprints",
    label: "Blueprints",
    icon: BookOpen,
    description: "Step-by-step deployment blueprints with architecture + commands",
    badge: "Guide",
    badgeColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export default function DevOpsToolkit() {
  const [active, setActive] = useState<ToolId>("nginx");
  const activeTool = TOOLS.find((t) => t.id === active)!;
  const ActiveIcon = activeTool.icon;

  return (
    <div>
      {/* Tool selector */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActive(tool.id)}
              className={`p-4 rounded-xl border text-left transition-all group ${
                active === tool.id
                  ? "border-cyan/40 bg-cyan/5"
                  : "border-white/10 hover:border-white/20 hover:bg-white/3"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${active === tool.id ? "text-cyan" : "text-lightGrey group-hover:text-white"}`} />
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${tool.badgeColor}`}>
                  {tool.badge}
                </span>
              </div>
              <p className={`text-xs font-mono font-bold mb-1 ${active === tool.id ? "text-cyan" : "text-white"}`}>
                {tool.label}
              </p>
              <p className="text-[9px] font-mono text-lightGrey/50 leading-relaxed">{tool.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active tool panel */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg border border-cyan/30 bg-cyan/10 flex items-center justify-center">
            <ActiveIcon className="w-4 h-4 text-cyan" />
          </div>
          <div>
            <h2 className="text-white font-mono font-bold text-sm">{activeTool.label}</h2>
            <p className="text-lightGrey/50 text-[10px] font-mono">{activeTool.description}</p>
          </div>
        </div>

        {active === "nginx"    && <NginxGenerator />}
        {active === "docker"   && <DockerComposeGenerator />}
        {active === "gha"      && <GithubActionsGenerator />}
        {active === "ec2"      && <EC2Calculator />}
        {active === "aws-arch" && <AWSArchitectGenerator />}
        {active === "infra"    && <InfraPlayground />}
        {active === "eval"       && <ProjectEvaluator />}
        {active === "blueprints" && <BlueprintMarketplace />}
      </div>
    </div>
  );
}
