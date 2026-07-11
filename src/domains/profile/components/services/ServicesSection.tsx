import Link from "next/link";
import { Cloud, GitBranch, Container, Terminal, Network, ArrowRight } from "lucide-react";

const SERVICES = [
  {
    icon: Cloud,
    title: "AWS Cloud Setup & Migration",
    description:
      "Design and implement production-grade AWS infrastructure. Migrate on-premises workloads to AWS with minimal downtime using EC2, ECS, RDS, S3, CloudFront, and Route53.",
    deliverables: ["VPC design + multi-AZ setup", "Auto Scaling + Load Balancer", "RDS + ElastiCache", "Cost optimisation report"],
    timeline: "2–4 weeks",
    color: "text-orange border-orange/30 bg-orange/5",
    badge: "AWS",
  },
  {
    icon: GitBranch,
    title: "CI/CD Pipeline Design",
    description:
      "Build fully automated build, test, and deployment pipelines. Zero-downtime deployments with rollback, blue-green or canary strategies, and Slack/PagerDuty integration.",
    deliverables: ["GitHub Actions / Jenkins pipeline", "Docker build + ECR push", "ECS/EC2 deploy", "Security scanning (Trivy/CodeQL)"],
    timeline: "1–3 weeks",
    color: "text-cyan border-cyan/30 bg-cyan/5",
    badge: "CI/CD",
  },
  {
    icon: Container,
    title: "Containerisation & ECS Deployment",
    description:
      "Containerise your applications with Docker and deploy to production on AWS ECS. Includes multi-stage Dockerfiles, ECR image management, task definitions, auto-scaling, and full observability.",
    deliverables: ["Multi-stage Dockerfile + Compose", "ECR image pipeline", "ECS task + service definitions", "Prometheus + Grafana"],
    timeline: "2–4 weeks",
    color: "text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/5",
    badge: "Docker",
  },
  {
    icon: Terminal,
    title: "Linux Server Administration",
    description:
      "Server hardening, performance tuning, monitoring, and automation. From bare-metal provisioning to production-ready Linux systems with backup strategies and alerting.",
    deliverables: ["Server hardening (CIS Benchmark)", "Monitoring (Zabbix/Prometheus)", "Backup + disaster recovery", "Shell automation scripts"],
    timeline: "1–2 weeks",
    color: "text-green border-green/30 bg-green/5",
    badge: "Linux",
  },
  {
    icon: Network,
    title: "Cloud Architecture Design",
    description:
      "Design scalable, cost-optimised cloud architectures aligned with the AWS Well-Architected Framework. Delivered as architecture diagrams, ADRs, and Terraform templates.",
    deliverables: ["Architecture diagram (draw.io/C4)", "AWS Well-Architected review", "Terraform IaC templates", "Cost estimate + optimisation"],
    timeline: "1–2 weeks",
    color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    badge: "Architecture",
  },
] as const;

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 sm:py-24 bg-darkBrown">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
        <div className="text-center mb-10 sm:mb-14">
          <p className="section-tag mb-3">Available for Hire</p>
          <h2 className="font-special text-2xl sm:text-5xl font-bold text-white mb-4">
            DevOps <span className="gradient-text">Services</span>
          </h2>
          <p className="text-lightGrey font-mono text-xs sm:text-sm max-w-xl mx-auto">
            Freelance and contract DevOps / Cloud Engineering engagements.
            Fixed-scope, fast delivery, production-ready output.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="glass rounded-2xl border border-white/10 p-5 sm:p-6 hover:border-white/20 transition-all group flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${service.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${service.color}`}>
                      {service.badge}
                    </span>
                    <h3 className="text-white font-mono font-bold text-sm mt-1 group-hover:text-cyan transition-colors leading-tight">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lightGrey text-xs font-mono leading-relaxed mb-4 flex-1">
                  {service.description}
                </p>

                {/* Deliverables */}
                <div className="mb-4">
                  <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-wider mb-2">Deliverables</p>
                  <ul className="space-y-1">
                    {service.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-[11px] font-mono text-lightGrey/70">
                        <span className="text-cyan flex-shrink-0 mt-0.5">▸</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[10px] font-mono text-lightGrey/40">Timeline: {service.timeline}</span>
                  <Link
                    href="/#contact"
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan hover:text-lightCyan transition-colors"
                  >
                    Enquire <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* CTA card */}
          <div className="glass rounded-2xl border border-cyan/20 p-5 sm:p-6 flex flex-col items-center justify-center text-center gap-4 bg-cyan/3">
            <p className="text-white font-mono font-bold text-sm">Have a custom requirement?</p>
            <p className="text-lightGrey text-xs font-mono leading-relaxed">
              All engagements are tailored to your stack and team. Let&apos;s discuss scope and timeline.
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-5 py-2 bg-cyan text-black font-mono font-bold text-xs rounded-xl hover:bg-lightCyan transition-colors"
            >
              Get in Touch <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
