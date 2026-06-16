import { db } from "../src/db/client";
import { interviewQuestions } from "../src/db/schema/interview";

const QUESTIONS = [
  // AWS
  { category: "AWS", level: "Intermediate", tags: ["ec2", "compute"],
    question: "Explain the difference between an EC2 instance store and EBS. When would you use each?",
    answer: "Instance store is ephemeral storage physically attached to the host; data is lost on stop/terminate. EBS is persistent network-attached block storage. Use instance store for temporary, high-IOPS scratch data (caches, buffers). Use EBS for databases, OS volumes, or any data that must survive reboots/termination." },
  { category: "AWS", level: "Intermediate", tags: ["s3", "storage"],
    question: "What is S3 versioning and why would you enable it?",
    answer: "S3 versioning stores every version of an object, including overwrites and deletes. It protects against accidental deletion or corruption — you can restore previous versions. Enable it for compliance, backup, or when data changes must be auditable. Note: versioning increases storage costs since every version is billed." },
  { category: "AWS", level: "Advanced", tags: ["iam", "security"],
    question: "What is the difference between an IAM role and an IAM policy?",
    answer: "A policy is a JSON document that defines permissions (Allow/Deny on actions and resources). A role is an IAM identity that can be assumed by entities (EC2 instances, Lambda functions, other accounts) — it has policies attached. Roles don't have permanent credentials; they issue temporary credentials via STS. Best practice: use roles instead of access keys for AWS-to-AWS communication." },
  { category: "AWS", level: "Beginner", tags: ["vpc", "networking"],
    question: "What is a VPC and why is it important?",
    answer: "A Virtual Private Cloud (VPC) is a logically isolated network in AWS where you launch resources. It gives you control over IP ranges, subnets (public/private), routing tables, internet gateways, and security groups. Without a VPC, all resources would be on a shared flat network. VPCs enable network segmentation, security boundaries, and hybrid connectivity via VPN or Direct Connect." },
  { category: "AWS", level: "Advanced", tags: ["elb", "auto-scaling"],
    question: "How does Auto Scaling work with an Application Load Balancer?",
    answer: "An ASG maintains a fleet of EC2 instances using scaling policies. When scaling out, new instances are registered with the ALB target group automatically. The ALB then distributes incoming traffic across all healthy registered instances. Health checks from the ALB determine instance health; unhealthy instances are replaced. This pattern provides high availability and elastic scaling without manual intervention." },

  // Docker
  { category: "Docker", level: "Beginner", tags: ["basics"],
    question: "What is the difference between a Docker image and a Docker container?",
    answer: "An image is a read-only template (a stack of layers) built from a Dockerfile. A container is a running instance of that image — it adds a writable layer on top and runs as an isolated process. Multiple containers can run from the same image concurrently. Deleting a container doesn't affect the image; the image persists until explicitly removed." },
  { category: "Docker", level: "Intermediate", tags: ["networking"],
    question: "Explain Docker bridge networking and when you'd use a custom bridge network.",
    answer: "By default, containers on the default bridge network can communicate only via IP — no DNS resolution by name. A custom bridge network provides automatic DNS resolution (containers reach each other by name), better isolation, and the ability to connect/disconnect containers at runtime. Custom bridge networks are best practice for multi-container setups. Use Docker Compose which creates a custom network automatically." },
  { category: "Docker", level: "Advanced", tags: ["security", "best-practices"],
    question: "What are the security best practices when writing a production Dockerfile?",
    answer: "1) Use a minimal base image (distroless, alpine). 2) Run as a non-root user (USER directive). 3) Don't store secrets in the image — use env vars or secrets managers at runtime. 4) Pin base image tags to a digest, not 'latest'. 5) Use multi-stage builds to exclude build tools from the final image. 6) Scan images with tools like Trivy or Snyk. 7) Apply read-only filesystems where possible." },
  { category: "Docker", level: "Intermediate", tags: ["volumes"],
    question: "What is the difference between a Docker volume and a bind mount?",
    answer: "A volume is managed by Docker (stored in /var/lib/docker/volumes), decoupled from the host path, easier to back up, and portable. A bind mount maps a specific host path into the container, giving direct access to host filesystem — useful for development (live code reload) but not portable. Prefer volumes for production data; bind mounts for local development." },

  // Kubernetes
  { category: "Kubernetes", level: "Intermediate", tags: ["pods", "deployments"],
    question: "What is the difference between a Deployment and a StatefulSet?",
    answer: "A Deployment manages stateless pods — pods are interchangeable, can be replaced in any order, and share a single PVC. A StatefulSet manages stateful applications — each pod has a stable network identity (pod-0, pod-1...), its own PVC, and pods are created/deleted in order. Use StatefulSets for databases (PostgreSQL, Cassandra, etc.) where pod identity and stable storage matter." },
  { category: "Kubernetes", level: "Advanced", tags: ["scheduling", "resources"],
    question: "What are resource requests and limits in Kubernetes and why do they matter?",
    answer: "Requests are what the scheduler uses to find a node with enough capacity — the pod is guaranteed these resources. Limits are the maximum the container can use; exceeding CPU limits causes throttling; exceeding memory limits causes OOMKill. Without requests, the scheduler can't make good decisions and may overcommit nodes. Without limits, a runaway container can starve others. Always set both in production." },
  { category: "Kubernetes", level: "Intermediate", tags: ["services", "networking"],
    question: "What are the different Kubernetes Service types and when would you use each?",
    answer: "ClusterIP (default): internal-only, cluster-local communication. NodePort: exposes on each node's IP at a static port — useful for testing. LoadBalancer: provisions a cloud load balancer (AWS ELB, GCP LB) — for public-facing services. ExternalName: maps to an external DNS name (no proxy). For production, use ClusterIP for internal services, LoadBalancer for internet-facing apps, or an Ingress controller (NGINX, Traefik) in front of ClusterIP services." },
  { category: "Kubernetes", level: "Beginner", tags: ["configmaps", "secrets"],
    question: "What is the difference between a ConfigMap and a Secret in Kubernetes?",
    answer: "A ConfigMap stores non-sensitive configuration data as key-value pairs (app settings, config files). A Secret stores sensitive data (passwords, tokens, certificates) encoded in base64. Secrets can be encrypted at rest (with KMS), have more restrictive RBAC, and are kept out of logs and dashboards by default. Use ConfigMaps for app config, Secrets for credentials — never hardcode either in container images." },

  // Linux
  { category: "Linux", level: "Intermediate", tags: ["processes", "signals"],
    question: "What is the difference between kill -9 and kill -15?",
    answer: "kill -15 (SIGTERM) is a graceful termination request — the process can catch it, clean up, save state, and exit. kill -9 (SIGKILL) is immediate, unblockable termination by the kernel — no cleanup happens. Always try SIGTERM first; use SIGKILL only when the process doesn't respond. Many init systems send SIGTERM, wait a timeout, then send SIGKILL if the process hasn't stopped." },
  { category: "Linux", level: "Intermediate", tags: ["filesystems", "disk"],
    question: "What command would you use to find which directory is consuming the most disk space?",
    answer: "Use `du -sh /* | sort -rh | head -20` to see top-level directories sorted by size. For a specific path: `du -sh /var/* | sort -rh`. Use `df -h` to see filesystem usage. For a visual tree: `du -h --max-depth=2 /var | sort -rh`. `ncdu` is an interactive TUI tool for navigating disk usage. Always check /var/log, /var/lib/docker, and /tmp first on production servers." },
  { category: "Linux", level: "Advanced", tags: ["performance", "monitoring"],
    question: "How would you diagnose high CPU usage on a Linux server?",
    answer: "1) `top` or `htop` to see per-process CPU usage. 2) `ps aux --sort=-%cpu | head -20` to list top consumers. 3) `sar -u 1 10` for 10-second CPU history. 4) `perf top` or `strace -p <pid>` to see what system calls are expensive. 5) Check `/proc/<pid>/status` for thread count. 6) Look at `iowait` in top — high iowait means disk, not CPU, is the bottleneck. 7) `vmstat 1` for overall system pressure." },
  { category: "Linux", level: "Beginner", tags: ["permissions"],
    question: "Explain Linux file permissions and the chmod command.",
    answer: "Each file has three permission sets: owner, group, others. Each set has read (r=4), write (w=2), execute (x=1). `chmod 755 file` sets owner=rwx (7), group=r-x (5), others=r-x (5). Symbolic: `chmod u+x file` adds execute for owner. `ls -l` shows permissions. Directories need execute to be entered. `chown user:group file` changes owner. For security, avoid 777 (world-writable). Use 644 for files, 755 for directories." },

  // Terraform
  { category: "Terraform", level: "Intermediate", tags: ["state", "backend"],
    question: "What is Terraform state and why should you store it remotely?",
    answer: "Terraform state maps real infrastructure to your config — it tracks resource IDs, metadata, and dependencies. Without state, Terraform can't know what already exists. Remote state (S3 + DynamoDB for AWS, Terraform Cloud) enables: 1) Team collaboration (multiple engineers sharing state), 2) State locking (DynamoDB prevents concurrent applies), 3) State encryption at rest, 4) Backup and versioning. Never commit state files to git — they contain sensitive outputs." },
  { category: "Terraform", level: "Advanced", tags: ["modules", "reusability"],
    question: "What are Terraform modules and when should you create one?",
    answer: "A module is a directory of .tf files used as a reusable unit. Create a module when you repeat the same pattern in multiple places (e.g., a VPC setup, an ECS service pattern, an RDS cluster). Modules accept input variables and return outputs. For internal use, keep modules in the same repo under `/modules`. For shared use, publish to the Terraform Registry or a private registry. Avoid premature modularization — wait until you have 2-3 repetitions of a pattern." },
  { category: "Terraform", level: "Intermediate", tags: ["plan", "apply"],
    question: "What is the difference between terraform plan and terraform apply?",
    answer: "`terraform plan` shows what changes Terraform would make (additions, modifications, destructions) without making them — it reads the current state and diffs against your config. `terraform apply` executes those changes. Always run `plan` first and review carefully, especially for destructions. In CI/CD, save the plan with `-out=plan.tfplan` and then `apply` the saved plan to ensure what was reviewed is what gets applied." },

  // CI/CD
  { category: "CI/CD", level: "Intermediate", tags: ["pipelines"],
    question: "What are the key stages in a CI/CD pipeline?",
    answer: "1) Source: code pushed to VCS triggers the pipeline. 2) Build: compile code, build Docker image, package artifacts. 3) Test: unit tests, integration tests, code coverage. 4) Security scan: SAST (static analysis), dependency vulnerability scanning. 5) Staging deploy: deploy to a staging environment. 6) Acceptance tests: smoke tests, E2E tests against staging. 7) Production deploy: blue/green or rolling deployment. 8) Post-deploy: health checks, smoke tests, rollback if failures detected." },
  { category: "CI/CD", level: "Advanced", tags: ["deployment-strategies"],
    question: "Explain blue/green deployment vs canary deployment.",
    answer: "Blue/green: two identical environments (blue=current, green=new). Switch traffic from blue to green all at once via load balancer. Zero downtime; instant rollback by switching back. Expensive (2x infrastructure). Canary: gradually shift traffic to the new version (e.g., 5% → 25% → 100%). Monitor metrics at each step; roll back if errors spike. More complex but safer for catching issues before full rollout. Use canary for high-risk changes to production systems serving millions of users." },
];

async function seed() {
  console.log(`Seeding ${QUESTIONS.length} interview questions...`);
  for (const q of QUESTIONS) {
    await db.insert(interviewQuestions).values({
      ...q,
      tags: JSON.stringify(q.tags),
    }).onConflictDoNothing();
  }
  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
