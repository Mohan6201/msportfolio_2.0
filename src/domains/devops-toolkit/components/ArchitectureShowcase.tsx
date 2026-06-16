"use client";
import { useState } from "react";

interface NodeDef {
  id: string;
  label: string;
  sublabel?: string;
  col: number; // 1-based grid column
  row: number; // 1-based grid row
  tier: "internet" | "edge" | "security" | "compute" | "data" | "monitoring" | "devtools";
  description: string;
  tech: string;
}

interface DiagramDef {
  id: string;
  title: string;
  subtitle: string;
  cols: number;
  rows: number;
  nodes: NodeDef[];
  arrows: { from: string; to: string; label?: string }[];
}

const TIER_STYLES: Record<NodeDef["tier"], string> = {
  internet:   "border-white/30 bg-white/5 text-white",
  edge:       "border-cyan/40 bg-cyan/10 text-cyan",
  security:   "border-red-400/40 bg-red-400/10 text-red-400",
  compute:    "border-orange/40 bg-orange/10 text-orange",
  data:       "border-[#a78bfa]/40 bg-[#a78bfa]/10 text-[#a78bfa]",
  monitoring: "border-green/40 bg-green/10 text-green",
  devtools:   "border-yellow-400/40 bg-yellow-400/10 text-yellow-400",
};

const DIAGRAMS: DiagramDef[] = [
  {
    id: "aws-3tier",
    title: "AWS 3-Tier Web Architecture",
    subtitle: "Production-grade multi-AZ setup with auto-scaling, CDN, and managed data tier",
    cols: 5,
    rows: 5,
    nodes: [
      { id: "users",  label: "Internet Users", col: 3, row: 1, tier: "internet",  description: "End users accessing the application globally via HTTPS.", tech: "HTTPS / TLS 1.3" },
      { id: "r53",    label: "Route 53",        col: 2, row: 2, tier: "edge",      description: "DNS service routing traffic to CloudFront or ALB. Supports health-check failover.", tech: "DNS, Health Checks, Alias Records" },
      { id: "cf",     label: "CloudFront",      col: 3, row: 2, tier: "edge",      description: "Global CDN serving static assets from S3 and caching dynamic responses at edge. 400+ PoPs worldwide.", tech: "CDN, Edge Cache, S3 Origin, SSL" },
      { id: "waf",    label: "WAF",             col: 4, row: 2, tier: "security",  description: "Web Application Firewall with AWS Managed Rules (OWASP Top 10, bad inputs, IP reputation).", tech: "AWS WAFv2, Managed Rules, Rate Limiting" },
      { id: "alb",    label: "App Load\nBalancer", col: 3, row: 3, tier: "compute", description: "Layer 7 load balancer distributing HTTP/HTTPS traffic across ECS tasks. Supports path-based routing.", tech: "ALB, Target Groups, Health Checks, SSL Termination" },
      { id: "ecs",    label: "ECS Fargate\n(Auto Scaling)", col: 2, row: 4, tier: "compute", description: "Containerized application tier running on ECS Fargate. Auto-scales 1–20 tasks based on CPU/memory. No EC2 to manage.", tech: "ECS Fargate, Auto Scaling, ECR, Docker" },
      { id: "rds",    label: "RDS PostgreSQL\n(Multi-AZ)", col: 1, row: 5, tier: "data",    description: "Managed PostgreSQL with Multi-AZ standby for 99.95% availability. Automatic failover < 60s. Encrypted at rest and in transit.", tech: "PostgreSQL 16, Multi-AZ, Automated Backups, Read Replicas" },
      { id: "redis",  label: "ElastiCache\nRedis", col: 3, row: 5, tier: "data",    description: "In-memory caching for sessions, query results, and rate limiting. Multi-AZ replication group.", tech: "Redis 7, Cluster Mode, TLS, Auth" },
      { id: "s3",     label: "S3 Bucket",       col: 5, row: 3, tier: "data",      description: "Static asset storage (images, JS, CSS), log archival, and backups. Versioning enabled.", tech: "S3 Standard, Versioning, SSE-AES256, Lifecycle" },
    ],
    arrows: [
      { from: "users", to: "r53" },
      { from: "users", to: "cf" },
      { from: "cf",    to: "waf" },
      { from: "waf",   to: "alb" },
      { from: "cf",    to: "s3",  label: "static" },
      { from: "alb",   to: "ecs" },
      { from: "ecs",   to: "rds" },
      { from: "ecs",   to: "redis" },
    ],
  },
  {
    id: "cicd",
    title: "CI/CD Pipeline — GitHub Actions → AWS ECS",
    subtitle: "Automated build, test, and zero-downtime deployment pipeline with security scanning",
    cols: 7,
    rows: 4,
    nodes: [
      { id: "dev",    label: "Developer",        col: 1, row: 2, tier: "internet",  description: "Developer pushes code or opens a Pull Request to the main branch.", tech: "Git, GitHub, Feature Branches" },
      { id: "github", label: "GitHub",           col: 2, row: 2, tier: "devtools",  description: "Source code repository. Webhooks trigger GitHub Actions on push/PR events.", tech: "GitHub, Branch Protection, CODEOWNERS" },
      { id: "gha",    label: "GitHub Actions",   col: 3, row: 2, tier: "devtools",  description: "CI/CD runner. Orchestrates the full pipeline: test → scan → build → push → deploy.", tech: "GitHub Actions, ubuntu-latest, OIDC Auth" },
      { id: "test",   label: "Test & Lint",      col: 3, row: 1, tier: "monitoring",description: "Unit tests, integration tests, linting, and SAST (CodeQL / Trivy). Pipeline fails fast.", tech: "pytest / Jest, ESLint, CodeQL, Trivy" },
      { id: "build",  label: "Docker Build",     col: 4, row: 2, tier: "compute",   description: "Multi-stage Docker build producing a minimal production image. Layer caching via Buildx.", tech: "Docker, Buildx, Multi-stage, Cache" },
      { id: "ecr",    label: "AWS ECR",          col: 5, row: 2, tier: "data",      description: "Private container registry. Images tagged with Git SHA for traceability. Vulnerability scanning enabled.", tech: "ECR, Image Scan, Lifecycle Policy" },
      { id: "ecs",    label: "ECS Deploy",       col: 6, row: 2, tier: "compute",   description: "Rolling deployment with CodeDeploy blue/green option. ECS registers new task definition and drains old tasks.", tech: "ECS Fargate, Rolling Update, Health Check Grace" },
      { id: "slack",  label: "Notify",           col: 7, row: 2, tier: "monitoring",description: "Deployment status notified to Slack. On failure: automatic rollback, alert on-call via PagerDuty.", tech: "Slack Webhooks, PagerDuty, GitHub Status" },
    ],
    arrows: [
      { from: "dev",    to: "github" },
      { from: "github", to: "gha" },
      { from: "gha",    to: "test" },
      { from: "gha",    to: "build" },
      { from: "build",  to: "ecr" },
      { from: "ecr",    to: "ecs" },
      { from: "ecs",    to: "slack" },
    ],
  },
  {
    id: "k8s",
    title: "Kubernetes with Observability Stack",
    subtitle: "Production Kubernetes cluster with full Prometheus/Grafana monitoring and centralized logging",
    cols: 5,
    rows: 5,
    nodes: [
      { id: "users",   label: "Clients",               col: 3, row: 1, tier: "internet",  description: "External clients hitting the cluster.", tech: "HTTPS" },
      { id: "lb",      label: "Load Balancer\n(AWS NLB)", col: 3, row: 2, tier: "edge", description: "Network Load Balancer with static IPs. Routes to Nginx Ingress Controller.", tech: "NLB, Static IP, TLS Passthrough" },
      { id: "ingress", label: "Ingress\nController",   col: 3, row: 3, tier: "compute",   description: "Nginx Ingress Controller routing by host/path rules. Terminates TLS using cert-manager certificates.", tech: "nginx ingress, cert-manager, Let's Encrypt" },
      { id: "svc",     label: "Kubernetes\nServices",  col: 3, row: 4, tier: "compute",   description: "ClusterIP services providing stable DNS names for pod groups. Decouples pod lifecycle from service discovery.", tech: "ClusterIP, DNS, Endpoints" },
      { id: "pods",    label: "Application\nPods",     col: 3, row: 5, tier: "compute",   description: "Application pods managed by Deployments. HPA scales pod count 2–20 based on CPU/custom metrics.", tech: "Deployment, HPA, Readiness/Liveness Probes, PodDisruptionBudget" },
      { id: "prom",    label: "Prometheus",            col: 1, row: 4, tier: "monitoring",description: "Metrics collection via ServiceMonitor CRDs. Stores 30 days of time-series data. Alerts via PrometheusRules.", tech: "Prometheus, ServiceMonitor, PrometheusRules, AlertManager" },
      { id: "grafana", label: "Grafana",               col: 1, row: 5, tier: "monitoring",description: "Dashboards for cluster health, pod performance, business KPIs. Integrated with Prometheus and Loki.", tech: "Grafana, Dashboard, Data Sources" },
      { id: "loki",    label: "Loki + Promtail",       col: 5, row: 4, tier: "monitoring",description: "Centralized log aggregation. Promtail ships pod stdout/stderr to Loki. Query with LogQL.", tech: "Loki, Promtail, LogQL, S3 Backend" },
    ],
    arrows: [
      { from: "users",   to: "lb" },
      { from: "lb",      to: "ingress" },
      { from: "ingress", to: "svc" },
      { from: "svc",     to: "pods" },
      { from: "pods",    to: "prom", label: "metrics" },
      { from: "prom",    to: "grafana" },
      { from: "pods",    to: "loki",  label: "logs" },
    ],
  },
  {
    id: "microservices",
    title: "Microservices with Event-Driven Architecture",
    subtitle: "Domain-driven microservices communicating via REST and Kafka events, each owning its data store",
    cols: 5,
    rows: 5,
    nodes: [
      { id: "client",  label: "Client Apps",        col: 3, row: 1, tier: "internet",  description: "Web and mobile clients. Communicate only with API Gateway, never directly with services.", tech: "React, React Native, HTTPS" },
      { id: "apigw",   label: "API Gateway",         col: 3, row: 2, tier: "edge",      description: "Single entry point. Handles auth (JWT validation), rate limiting, routing, and request/response transformation.", tech: "Kong / AWS API Gateway, JWT, Rate Limiting, Routing" },
      { id: "auth",    label: "Auth Service",        col: 1, row: 3, tier: "compute",   description: "Issues and validates JWT tokens. Manages user identity and OAuth2 flows.", tech: "Node.js, JWT, OAuth2, Redis Sessions" },
      { id: "users",   label: "Users Service",       col: 2, row: 3, tier: "compute",   description: "User profile CRUD. Emits UserCreated/Updated events to Kafka.", tech: "Python FastAPI, PostgreSQL, Kafka Producer" },
      { id: "orders",  label: "Orders Service",      col: 3, row: 3, tier: "compute",   description: "Order lifecycle management. Listens to InventoryReserved events. Orchestrates saga pattern.", tech: "Java Spring Boot, MySQL, Saga Pattern" },
      { id: "products",label: "Products Service",    col: 4, row: 3, tier: "compute",   description: "Product catalog and inventory. Emits InventoryReserved events on stock changes.", tech: "Go, MongoDB, Kafka Producer" },
      { id: "notify",  label: "Notification\nService", col: 5, row: 3, tier: "compute", description: "Listens to all domain events and sends email/SMS/push notifications asynchronously.", tech: "Node.js, SES, SNS, Kafka Consumer" },
      { id: "kafka",   label: "Kafka\nEvent Bus",    col: 3, row: 4, tier: "data",      description: "Distributed event streaming. Topics per domain. Enables eventual consistency and event sourcing.", tech: "Apache Kafka, MSK, Schema Registry, Avro" },
      { id: "redis",   label: "Redis Cache",         col: 1, row: 5, tier: "data",      description: "Shared L2 cache for rate limiting, sessions, and hot data. Each service uses its own key namespace.", tech: "Redis Cluster, TTL, Key Namespacing" },
    ],
    arrows: [
      { from: "client",   to: "apigw" },
      { from: "apigw",    to: "auth" },
      { from: "apigw",    to: "users" },
      { from: "apigw",    to: "orders" },
      { from: "apigw",    to: "products" },
      { from: "users",    to: "kafka", label: "events" },
      { from: "orders",   to: "kafka", label: "events" },
      { from: "products", to: "kafka", label: "events" },
      { from: "kafka",    to: "notify" },
    ],
  },
];

function Node({ node, isSelected, onClick }: {
  node: NodeDef;
  isSelected: boolean;
  onClick: () => void;
}) {
  const style = TIER_STYLES[node.tier];
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 cursor-pointer transition-all text-center select-none ${style} ${
        isSelected ? "scale-105 shadow-lg shadow-current/20 ring-2 ring-current/40" : "hover:scale-[1.03] hover:shadow-md"
      }`}
      style={{ gridColumn: node.col, gridRow: node.row }}
    >
      <p className="text-[11px] font-mono font-bold leading-tight whitespace-pre-line">{node.label}</p>
      {node.sublabel && <p className="text-[9px] font-mono opacity-60 mt-0.5">{node.sublabel}</p>}
    </div>
  );
}

export default function ArchitectureShowcase() {
  const [activeDiagram, setActiveDiagram] = useState(DIAGRAMS[0].id);
  const [selectedNode, setSelectedNode] = useState<NodeDef | null>(null);

  const diagram = DIAGRAMS.find((d) => d.id === activeDiagram)!;

  function selectNode(node: NodeDef) {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }

  return (
    <div className="space-y-6">
      {/* Diagram tabs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {DIAGRAMS.map((d) => (
          <button
            key={d.id}
            onClick={() => { setActiveDiagram(d.id); setSelectedNode(null); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeDiagram === d.id
                ? "border-cyan/40 bg-cyan/5"
                : "border-white/10 hover:border-white/20 hover:bg-white/3"
            }`}
          >
            <p className={`text-xs font-mono font-bold leading-tight ${activeDiagram === d.id ? "text-cyan" : "text-white"}`}>
              {d.title}
            </p>
          </button>
        ))}
      </div>

      {/* Diagram subtitle */}
      <p className="text-lightGrey/60 text-sm font-mono">{diagram.subtitle}</p>

      {/* Main panel */}
      <div className={`grid gap-6 ${selectedNode ? "lg:grid-cols-[1fr_320px]" : ""}`}>
        {/* Grid diagram */}
        <div className="glass rounded-2xl border border-white/10 p-6">
          <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-widest mb-4">
            Click any component to learn more
          </p>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: `repeat(${diagram.cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${diagram.rows}, auto)`,
            }}
          >
            {diagram.nodes.map((node) => (
              <Node
                key={node.id}
                node={node}
                isSelected={selectedNode?.id === node.id}
                onClick={() => selectNode(node)}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-white/10">
            {(Object.keys(TIER_STYLES) as NodeDef["tier"][]).map((tier) => (
              <div key={tier} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded border ${TIER_STYLES[tier]}`} />
                <span className="text-[9px] font-mono text-lightGrey/40 capitalize">{tier}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        {selectedNode && (
          <div className="glass rounded-2xl border border-white/10 p-6 self-start">
            <div className="flex items-start justify-between mb-4">
              <h3 className={`font-mono font-bold text-sm leading-tight ${TIER_STYLES[selectedNode.tier].split(" ")[2]}`}>
                {selectedNode.label.replace("\n", " ")}
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-lightGrey/30 hover:text-lightGrey text-lg leading-none ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>

            <p className="text-lightGrey text-xs font-mono leading-relaxed mb-5">
              {selectedNode.description}
            </p>

            <div>
              <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-wider mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.tech.split(", ").map((t) => (
                  <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-lightGrey">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection list */}
      <div className="glass rounded-xl border border-white/10 p-4">
        <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-wider mb-3">Data Flows</p>
        <div className="flex flex-wrap gap-2">
          {diagram.arrows.map((arrow, i) => {
            const fromNode = diagram.nodes.find((n) => n.id === arrow.from);
            const toNode = diagram.nodes.find((n) => n.id === arrow.to);
            return (
              <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono text-lightGrey/60 bg-white/3 rounded-lg px-2 py-1">
                <span>{fromNode?.label.replace("\n", " ")}</span>
                <span className="text-cyan">→</span>
                {arrow.label && <span className="text-lightGrey/30">[{arrow.label}]</span>}
                <span>{toNode?.label.replace("\n", " ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
