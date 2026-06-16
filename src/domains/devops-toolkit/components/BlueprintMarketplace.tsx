"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp, Terminal, Clock, Layers, BookOpen, Copy, Check } from "lucide-react";

interface Step {
  title: string;
  description: string;
  commands?: string[];
}

interface BlueprintDef {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  tech: string[];
  architecture: string[];
  steps: Step[];
  color: string;
  badgeColor: string;
}

const COMPLEXITY_COLOR: Record<string, string> = {
  Beginner: "text-green border-green/30 bg-green/10",
  Intermediate: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Advanced: "text-red-400 border-red-400/30 bg-red-400/10",
};

const BLUEPRINTS: BlueprintDef[] = [
  {
    id: "django-aws",
    title: "Django on AWS ECS",
    description:
      "Production-ready Django app on ECS Fargate with RDS PostgreSQL, ElastiCache Redis, CloudFront CDN, WAF, and a fully automated GitHub Actions CI/CD pipeline.",
    category: "Web Application",
    complexity: "Advanced",
    estimatedTime: "3–5 days",
    tech: ["Django", "ECS Fargate", "RDS PostgreSQL", "ElastiCache Redis", "Nginx", "Docker", "GitHub Actions", "Terraform", "CloudFront"],
    architecture: [
      "Route 53 → CloudFront → WAF → Application Load Balancer",
      "ALB → ECS Fargate (Django + Nginx sidecar)",
      "ECS → RDS PostgreSQL (Multi-AZ) + ElastiCache Redis",
      "CloudFront → S3 (static/media assets)",
      "GitHub Actions → ECR → ECS Rolling Deploy",
    ],
    steps: [
      {
        title: "Containerise Django",
        description: "Write a multi-stage Dockerfile. Stage 1 installs dependencies; Stage 2 copies app code into a minimal image. Run collectstatic as part of the build.",
        commands: [
          "docker build -t django-app .",
          "docker run --env-file .env -p 8000:8000 django-app gunicorn app.wsgi:application",
        ],
      },
      {
        title: "Provision AWS Infrastructure with Terraform",
        description: "Create VPC (2 public + 2 private subnets, NAT Gateway), ECS cluster, ALB, RDS Multi-AZ, ElastiCache, ECR repo, IAM roles, and security groups.",
        commands: ["terraform init", "terraform plan -out=plan.tfplan", "terraform apply plan.tfplan"],
      },
      {
        title: "Configure Nginx Reverse Proxy",
        description: "Run Nginx as a sidecar container in the same ECS task. Nginx handles SSL termination at the ALB layer; it proxies dynamic requests to Gunicorn and serves static files from S3 via CloudFront.",
      },
      {
        title: "GitHub Actions CI/CD Pipeline",
        description: "Workflow: run pytest + linting → Trivy security scan → docker build with layer cache → push to ECR → register new ECS task definition → update service.",
        commands: [
          "aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin $ECR_URL",
          "docker push $ECR_URL/django-app:$GITHUB_SHA",
          "aws ecs update-service --cluster prod --service django-api --force-new-deployment",
        ],
      },
      {
        title: "Configure Django for Production",
        description: "Set DEBUG=False, add ALLOWED_HOSTS, configure DATABASES from env vars, use django-storages for S3 static/media, set SECURE_HSTS_SECONDS and CSRF_COOKIE_SECURE.",
      },
      {
        title: "DNS & SSL",
        description: "Request an ACM certificate for your domain. Point Route 53 alias records to the ALB. Configure CloudFront with the same certificate for edge caching.",
      },
    ],
    color: "border-green/30",
    badgeColor: "text-green border-green/30 bg-green/5",
  },
  {
    id: "nextjs-vercel",
    title: "Next.js Full-Stack on Vercel",
    description:
      "Modern Next.js App Router application on Vercel with LibSQL/Turso (serverless SQLite), Drizzle ORM, Better Auth, Vercel Blob storage, and Vercel AI SDK.",
    category: "Full-Stack Web",
    complexity: "Intermediate",
    estimatedTime: "1–2 days",
    tech: ["Next.js 16", "TypeScript", "Tailwind CSS", "Turso", "Drizzle ORM", "Better Auth", "Vercel Blob", "Vercel AI SDK"],
    architecture: [
      "Vercel Edge Network → Next.js (App Router, Server Components)",
      "Server Components → LibSQL/Turso (Drizzle ORM)",
      "API Routes → Better Auth (email/password + sessions)",
      "Upload Routes → Vercel Blob (public/private)",
      "AI Routes → Vercel AI Gateway → Gemini / Claude",
    ],
    steps: [
      {
        title: "Scaffold Project",
        description: "Create a Next.js 16 project with TypeScript, Tailwind CSS v4, and App Router. Install Drizzle ORM and @libsql/client.",
        commands: [
          "npx create-next-app@latest --typescript --tailwind --app my-app",
          "npm install drizzle-orm @libsql/client drizzle-kit",
        ],
      },
      {
        title: "Set Up Turso Database",
        description: "Create a Turso database, generate a token, define your Drizzle schema per domain, and run migrations.",
        commands: [
          "turso db create myapp",
          "turso db tokens create myapp",
          "npx drizzle-kit generate",
          "npx drizzle-kit migrate",
        ],
      },
      {
        title: "Add Better Auth",
        description: "Install Better Auth, create the auth config with Drizzle adapter, add the catch-all route handler, and wrap your app with a session provider.",
        commands: ["npm install better-auth", "npx better-auth generate"],
      },
      {
        title: "Add Vercel Blob Storage",
        description: "Install @vercel/blob. Create an upload route handler. Use put() for uploads and del() for deletions. Store the returned URL in your database.",
        commands: ["npm install @vercel/blob"],
      },
      {
        title: "Integrate Vercel AI SDK",
        description: "Install the AI SDK. Use generateText() for chat, generateObject() + Zod for structured outputs, and streamText() for streaming responses.",
        commands: ["npm install ai @ai-sdk/google"],
      },
      {
        title: "Deploy to Vercel",
        description: "Connect your GitHub repository to Vercel. Add environment variables (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, BETTER_AUTH_SECRET, BLOB_READ_WRITE_TOKEN). Deploy.",
        commands: ["vercel --prod"],
      },
    ],
    color: "border-cyan/30",
    badgeColor: "text-cyan border-cyan/30 bg-cyan/5",
  },
  {
    id: "wordpress-aws",
    title: "WordPress on AWS EC2",
    description:
      "Hardened WordPress on EC2 with RDS MySQL, Nginx + PHP-FPM, Let's Encrypt SSL, CloudFront CDN, and automated nightly S3 backups.",
    category: "CMS",
    complexity: "Intermediate",
    estimatedTime: "4–8 hours",
    tech: ["WordPress", "EC2", "RDS MySQL", "Nginx", "PHP-FPM", "Let's Encrypt", "CloudFront", "S3"],
    architecture: [
      "Route 53 → CloudFront (CDN + SSL) → EC2 (Nginx + PHP-FPM)",
      "Nginx → WordPress (PHP 8.3) → RDS MySQL 8.0 (private subnet)",
      "EC2 → S3 (nightly backup via cron)",
    ],
    steps: [
      {
        title: "Launch EC2 Instance",
        description: "Launch Ubuntu 24.04 LTS (t3.small or larger). Open security groups: 22 (SSH, your IP only), 80 (HTTP), 443 (HTTPS). Associate an Elastic IP.",
      },
      {
        title: "Install Nginx + PHP-FPM",
        description: "Install Nginx, PHP 8.3-FPM, and all WordPress-required extensions.",
        commands: [
          "apt update && apt install -y nginx php8.3-fpm php8.3-mysql php8.3-gd php8.3-curl php8.3-mbstring php8.3-xml php8.3-zip",
        ],
      },
      {
        title: "Create RDS MySQL Instance",
        description: "Create an RDS MySQL 8.0 instance in private subnets. Set a strong password, restrict the security group to your EC2's SG only. Create the WordPress database and user.",
        commands: [
          "mysql -h your-rds-endpoint -u admin -p -e \"CREATE DATABASE wordpress; CREATE USER 'wpuser'@'%' IDENTIFIED BY 'strongpassword'; GRANT ALL ON wordpress.* TO 'wpuser'@'%';\"",
        ],
      },
      {
        title: "Install and Configure WordPress",
        description: "Download WordPress, configure wp-config.php with RDS credentials, set correct ownership.",
        commands: [
          "wget https://wordpress.org/latest.tar.gz && tar -xzf latest.tar.gz -C /var/www/html --strip-components=1",
          "chown -R www-data:www-data /var/www/html",
        ],
      },
      {
        title: "Configure Nginx Server Block",
        description: "Create an Nginx server block for your domain with PHP-FPM proxying and WordPress permalink support (try_files $uri $uri/ /index.php?$args).",
      },
      {
        title: "SSL with Let's Encrypt",
        description: "Install Certbot, obtain a certificate, enable auto-renewal. Certbot automatically modifies the Nginx config for HTTPS.",
        commands: [
          "apt install certbot python3-certbot-nginx -y",
          "certbot --nginx -d yourdomain.com -d www.yourdomain.com",
        ],
      },
      {
        title: "S3 Backups + CloudFront",
        description: "Create a cron job to dump the database and sync /wp-content/uploads to S3 nightly. Set up a CloudFront distribution in front of your EC2 for global caching.",
        commands: [
          "0 2 * * * mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS wordpress | gzip | aws s3 cp - s3://my-backup/db-$(date +%Y%m%d).sql.gz",
        ],
      },
    ],
    color: "border-orange/30",
    badgeColor: "text-orange border-orange/30 bg-orange/5",
  },
  {
    id: "cicd-gha",
    title: "GitHub Actions CI/CD Pipeline",
    description:
      "Complete CI/CD pipeline for any Dockerised app: automated tests, Trivy security scan, Docker build with layer caching, ECR push, and zero-downtime ECS rolling deploy.",
    category: "CI/CD",
    complexity: "Intermediate",
    estimatedTime: "4–8 hours",
    tech: ["GitHub Actions", "Docker Buildx", "AWS ECR", "AWS ECS", "Trivy", "OIDC Auth", "Slack"],
    architecture: [
      "git push → GitHub Actions trigger",
      "Job 1: Test → ESLint / pytest → CodeQL scan",
      "Job 2: Build → Docker Buildx (layer cache) → Trivy image scan → ECR push",
      "Job 3: Deploy → ECS task definition update → service rolling deploy",
      "Job 4: Notify → Slack success/failure webhook",
    ],
    steps: [
      {
        title: "Set Up OIDC Auth (No Static Keys)",
        description: "Create an OIDC provider in IAM for GitHub Actions. Create an IAM role with permissions for ECR and ECS. Reference it in your workflow — no long-lived secrets.",
        commands: [
          "aws iam create-open-id-connect-provider --url https://token.actions.githubusercontent.com --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1",
        ],
      },
      {
        title: "Write the Test Job",
        description: "Run unit tests, linting, and SAST (CodeQL for code vulnerabilities). Fail fast — don't build if tests fail.",
        commands: ["pytest --cov=app tests/", "eslint . --max-warnings 0"],
      },
      {
        title: "Docker Build with Layer Caching",
        description: "Use docker/build-push-action with GitHub Actions cache (type=gha). Tag images with both the Git SHA (immutable) and 'latest'.",
        commands: [
          "docker buildx build --cache-from type=gha --cache-to type=gha,mode=max --tag $ECR_URL:$SHA --tag $ECR_URL:latest --push .",
        ],
      },
      {
        title: "Trivy Security Scan",
        description: "Run Trivy against the pushed ECR image. Fail the pipeline on CRITICAL vulnerabilities. Generate a sarif report uploaded to GitHub Security tab.",
        commands: ["trivy image --severity CRITICAL --exit-code 1 $ECR_URL:$SHA"],
      },
      {
        title: "Deploy to ECS",
        description: "Download the current task definition, update the image tag, register a new revision, and update the ECS service. Use wait deploy-stable to block until healthy.",
        commands: [
          "aws ecs register-task-definition --cli-input-json file://task-def.json",
          "aws ecs update-service --cluster prod --service my-api --task-definition my-task:$NEW_REVISION",
          "aws ecs wait services-stable --cluster prod --services my-api",
        ],
      },
      {
        title: "Slack Notification",
        description: "Post a success or failure message to Slack using a webhook. Include the commit SHA, actor, environment, and a link to the Actions run.",
      },
    ],
    color: "border-[#ff4d94]/30",
    badgeColor: "text-[#ff4d94] border-[#ff4d94]/30 bg-[#ff4d94]/5",
  },
  {
    id: "k8s-eks",
    title: "Kubernetes on AWS EKS",
    description:
      "Production Kubernetes cluster on EKS with Helm charts, HPA, Cluster Autoscaler, Nginx Ingress, cert-manager TLS, and Prometheus + Grafana monitoring stack.",
    category: "Container Orchestration",
    complexity: "Advanced",
    estimatedTime: "1–2 weeks",
    tech: ["Kubernetes", "EKS", "Helm", "Nginx Ingress", "cert-manager", "HPA", "Cluster Autoscaler", "Prometheus", "Grafana", "Terraform"],
    architecture: [
      "Route 53 → Nginx Ingress Controller (NLB) → Services → Pods",
      "Pods: HPA (CPU/Memory) → Cluster Autoscaler (EC2 Node Groups)",
      "cert-manager → Let's Encrypt (automatic TLS for all Ingress)",
      "Prometheus → Grafana dashboards + AlertManager → PagerDuty",
    ],
    steps: [
      {
        title: "Provision EKS with Terraform",
        description: "Use the terraform-aws-eks module to create the cluster, managed node groups, and all required IAM roles (IRSA for cert-manager, AWS LBC, Cluster Autoscaler).",
        commands: ["terraform apply -target=module.eks", "aws eks update-kubeconfig --name prod-cluster --region eu-west-2"],
      },
      {
        title: "Install AWS Load Balancer Controller",
        description: "The AWS LBC manages the NLB that fronts the Nginx Ingress. Install via Helm with IRSA credentials.",
        commands: ["helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=prod-cluster"],
      },
      {
        title: "Install Nginx Ingress Controller",
        description: "Deploy the Nginx Ingress Controller. It creates a Network Load Balancer automatically via the AWS LBC annotations.",
        commands: ["helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace"],
      },
      {
        title: "Install cert-manager",
        description: "Install cert-manager with CRDs. Create a ClusterIssuer for Let's Encrypt (staging first, then production). All Ingress resources with the annotation will auto-get TLS.",
        commands: [
          "helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set installCRDs=true",
          "kubectl apply -f cluster-issuer.yaml",
        ],
      },
      {
        title: "Write Application Helm Chart",
        description: "Package your app as a Helm chart: Deployment, Service, HorizontalPodAutoscaler (CPU 70%, min 2, max 10), Ingress, ConfigMap, and Secret (from AWS Secrets Manager via External Secrets Operator).",
      },
      {
        title: "Install Prometheus Stack",
        description: "The kube-prometheus-stack Helm chart installs Prometheus, Grafana, AlertManager, and a full set of Kubernetes dashboards in one go.",
        commands: [
          "helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace",
          "kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring",
        ],
      },
      {
        title: "CI/CD with Helm Upgrade",
        description: "GitHub Actions: docker build → ECR push → helm upgrade --install (atomic, --wait). Failed deploys auto-rollback. Tag the release with the Git SHA.",
        commands: ["helm upgrade --install my-app ./charts/my-app --set image.tag=$SHA --atomic --timeout 5m"],
      },
    ],
    color: "border-[#a78bfa]/30",
    badgeColor: "text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/5",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="p-1 rounded text-lightGrey/40 hover:text-cyan transition-colors flex-shrink-0">
      {copied ? <Check className="w-3 h-3 text-green" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function BlueprintMarketplace() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {BLUEPRINTS.map((bp) => {
        const isOpen = expanded === bp.id;
        return (
          <div key={bp.id} className={`glass rounded-2xl border transition-all ${isOpen ? bp.color : "border-white/10 hover:border-white/20"}`}>
            {/* Card header — always visible */}
            <button
              onClick={() => setExpanded(isOpen ? null : bp.id)}
              className="w-full text-left p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${bp.badgeColor}`}>
                      {bp.category}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${COMPLEXITY_COLOR[bp.complexity]}`}>
                      {bp.complexity}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-mono text-lightGrey/40">
                      <Clock className="w-2.5 h-2.5" />{bp.estimatedTime}
                    </span>
                  </div>
                  <h3 className="text-white font-mono font-bold text-sm mb-1 group-hover:text-cyan transition-colors">
                    {bp.title}
                  </h3>
                  <p className="text-lightGrey text-xs font-mono leading-relaxed">{bp.description}</p>
                </div>
                <div className="flex-shrink-0 w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center text-lightGrey/40 mt-0.5">
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Tech stack — always visible */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {bp.tech.map((t) => (
                  <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-lightGrey/60">
                    {t}
                  </span>
                ))}
              </div>
            </button>

            {/* Expanded body */}
            {isOpen && (
              <div className="px-6 pb-6 space-y-6 border-t border-white/10 pt-6">
                {/* Architecture */}
                <div>
                  <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-3 h-3" /> Architecture Overview
                  </p>
                  <div className="space-y-1.5">
                    {bp.architecture.map((line, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-cyan text-[10px] font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
                        <p className="text-lightGrey text-xs font-mono leading-relaxed">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <p className="text-[10px] font-mono text-lightGrey/40 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Deployment Steps
                  </p>
                  <div className="space-y-4">
                    {bp.steps.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        {/* Step number */}
                        <div className="flex-shrink-0 w-6 h-6 rounded-full border border-cyan/30 bg-cyan/5 flex items-center justify-center mt-0.5">
                          <span className="text-cyan text-[10px] font-mono font-bold">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-mono font-bold text-xs mb-1">{step.title}</p>
                          <p className="text-lightGrey text-xs font-mono leading-relaxed mb-2">{step.description}</p>
                          {step.commands && step.commands.length > 0 && (
                            <div className="space-y-1.5">
                              {step.commands.map((cmd, j) => (
                                <div key={j} className="flex items-start gap-2 bg-black/30 rounded-lg px-3 py-2 border border-white/5">
                                  <Terminal className="w-3 h-3 text-cyan mt-0.5 flex-shrink-0" />
                                  <code className="text-[10px] font-mono text-lightGrey/80 flex-1 break-all">{cmd}</code>
                                  <CopyButton text={cmd} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
