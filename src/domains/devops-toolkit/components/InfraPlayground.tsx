"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  generateTerraform,
  type InfraComponent,
  type TerraformOutput,
} from "../utils/terraformGenerator";

const COMPONENT_OPTIONS: { id: InfraComponent; label: string; desc: string; tier: string; color: string }[] = [
  { id: "vpc",        label: "VPC + Networking",   desc: "Subnets, IGW, route tables",        tier: "Foundation", color: "text-white" },
  { id: "ec2",        label: "EC2 Server",          desc: "Application server instance",        tier: "Compute",    color: "text-orange" },
  { id: "asg",        label: "Auto Scaling Group",  desc: "EC2 fleet with auto-scaling",        tier: "Compute",    color: "text-orange" },
  { id: "alb",        label: "App Load Balancer",   desc: "HTTP/HTTPS traffic routing",         tier: "Compute",    color: "text-orange" },
  { id: "waf",        label: "WAF",                 desc: "Web Application Firewall",           tier: "Security",   color: "text-red" },
  { id: "rds",        label: "RDS PostgreSQL",      desc: "Managed relational database",        tier: "Data",       color: "text-[#a78bfa]" },
  { id: "redis",      label: "ElastiCache Redis",   desc: "In-memory cache layer",              tier: "Data",       color: "text-[#a78bfa]" },
  { id: "s3",         label: "S3 Bucket",           desc: "Object storage",                     tier: "Storage",    color: "text-orange" },
  { id: "cloudfront", label: "CloudFront CDN",      desc: "Edge cache and CDN",                 tier: "Edge",       color: "text-cyan" },
  { id: "route53",    label: "Route53 DNS",         desc: "Hosted zone and DNS records",        tier: "Edge",       color: "text-cyan" },
];

const TABS = ["Diagram", "main.tf", "variables.tf", "outputs.tf", "Cost"] as const;
type Tab = (typeof TABS)[number];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 rounded border border-white/10 text-lightGrey hover:border-cyan/30 hover:text-cyan transition-colors">
      {copied ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function InfraPlayground() {
  const [selected, setSelected] = useState<InfraComponent[]>(["vpc", "ec2", "alb"]);
  const [projectName, setProjectName] = useState("myapp");
  const [region, setRegion] = useState("us-east-1");
  const [activeTab, setActiveTab] = useState<Tab>("Diagram");
  const [output, setOutput] = useState<TerraformOutput | null>(null);

  function toggle(id: InfraComponent) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function generate() {
    const result = generateTerraform({ components: selected, projectName, region });
    setOutput(result);
    setActiveTab("Diagram");
  }

  const tierGroups = COMPONENT_OPTIONS.reduce<Record<string, typeof COMPONENT_OPTIONS>>((acc, c) => {
    if (!acc[c.tier]) acc[c.tier] = [];
    acc[c.tier].push(c);
    return acc;
  }, {});

  const tabContent: Record<Tab, string> = output
    ? {
        Diagram:       output.asciiDiagram,
        "main.tf":     output.mainTf,
        "variables.tf": output.variablesTf,
        "outputs.tf":  output.outputsTf,
        Cost:          [
          `Estimated Monthly Cost (us-east-1)`,
          ``,
          `Selected components:`,
          ...selected.map((c) => {
            const opt = COMPONENT_OPTIONS.find((o) => o.id === c)!;
            return `  · ${opt.label}`;
          }),
          ``,
          `────────────────────────────────────`,
          `Min estimate:  $${output.estimatedMonthlyMin}/month`,
          `Max estimate:  $${output.estimatedMonthlyMax}/month`,
          ``,
          `Notes:`,
          `  · EC2/RDS prices based on us-east-1 On-Demand`,
          `  · Multi-AZ RDS and Redis included in max estimate`,
          `  · Data transfer, snapshots, and CloudWatch not included`,
          `  · Use AWS Pricing Calculator for precise quotes`,
        ].join("\n"),
      }
    : { Diagram: "", "main.tf": "", "variables.tf": "", "outputs.tf": "", Cost: "" };

  return (
    <div className="space-y-6">
      {/* Config row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">Project Name</label>
          <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="input-field w-full" />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-lightGrey/60 mb-1 uppercase tracking-wider">AWS Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="input-field w-full">
            {["us-east-1","us-west-2","eu-west-1","eu-central-1","ap-southeast-1","ap-northeast-1"].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={generate} disabled={selected.length === 0}
            className="w-full py-2.5 bg-cyan text-black font-mono font-bold text-sm rounded-xl hover:bg-lightCyan transition-colors disabled:opacity-50">
            Generate Terraform
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Component selector */}
        <div className="space-y-3">
          <p className="text-[10px] font-mono text-lightGrey/60 uppercase tracking-wider">Select Components</p>
          {Object.entries(tierGroups).map(([tier, opts]) => (
            <div key={tier}>
              <p className="text-[9px] font-mono text-lightGrey/30 uppercase tracking-widest mb-1.5">{tier}</p>
              <div className="space-y-1">
                {opts.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggle(opt.id)}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-lg border text-left transition-all ${
                      selected.includes(opt.id)
                        ? "border-cyan/40 bg-cyan/5"
                        : "border-white/5 hover:border-white/15 hover:bg-white/3"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      selected.includes(opt.id) ? "bg-cyan border-cyan" : "border-white/20"
                    }`}>
                      {selected.includes(opt.id) && <Check className="w-2.5 h-2.5 text-black" />}
                    </div>
                    <div>
                      <p className={`text-[11px] font-mono font-bold ${selected.includes(opt.id) ? opt.color : "text-lightGrey"}`}>
                        {opt.label}
                      </p>
                      <p className="text-[9px] font-mono text-lightGrey/40">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Output panel */}
        <div>
          {output ? (
            <div>
              {/* Tab bar */}
              <div className="flex items-center gap-1 mb-3 border-b border-white/10 pb-2">
                {TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-mono px-3 py-1.5 rounded-t transition-colors ${
                      activeTab === tab ? "bg-white/10 text-white" : "text-lightGrey/50 hover:text-lightGrey"
                    }`}>
                    {tab}
                  </button>
                ))}
                <div className="ml-auto">
                  <CopyButton text={tabContent[activeTab]} />
                </div>
              </div>

              {/* Content */}
              <div className="relative glass rounded-xl border border-white/10 overflow-hidden">
                <pre className="text-green text-[10px] font-mono whitespace-pre overflow-x-auto p-5 max-h-[480px] overflow-y-auto">
                  {tabContent[activeTab]}
                </pre>
              </div>

              {/* Cost summary strip */}
              {activeTab !== "Cost" && (
                <div className="mt-3 flex items-center gap-4 glass rounded-lg border border-green/10 px-4 py-2">
                  <p className="text-[10px] font-mono text-lightGrey/50 uppercase tracking-wider">Estimated Cost</p>
                  <p className="text-green font-mono font-bold text-sm">
                    ${output.estimatedMonthlyMin}–${output.estimatedMonthlyMax}/month
                  </p>
                  <p className="text-lightGrey/30 text-[9px] font-mono ml-auto">{selected.length} components selected</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] glass rounded-xl border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white font-mono font-bold mb-2">Select components</p>
                <p className="text-lightGrey/50 text-xs font-mono">Choose infrastructure components on the left,<br />then click Generate Terraform</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
