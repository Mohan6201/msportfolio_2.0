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

  // DevOps (general/foundational — culture, IaC philosophy, observability, incident response, SRE)
  { category: "DevOps", level: "Intermediate", tags: ["culture", "collaboration"],
    question: "What does 'you build it, you run it' mean in DevOps culture, and what are the trade-offs?",
    answer: "It means the team that writes a service is also on-call for it in production, rather than throwing code over the wall to a separate ops team. Trade-offs: engineers get direct feedback on operational pain (bad alerts, flaky deploys), which drives them to build more reliable, observable systems — ownership improves quality. The downside is on-call burden on developers who may lack deep ops experience, and the need for good tooling (runbooks, dashboards, paging) so on-call isn't miserable. It works best paired with strong platform/SRE support that provides the guardrails (golden paths, paved-road CI/CD) so each team isn't reinventing infrastructure." },
  { category: "DevOps", level: "Intermediate", tags: ["iac", "philosophy"],
    question: "Why does Infrastructure as Code matter beyond 'not clicking in a console', and why is immutability a core principle?",
    answer: "IaC makes infrastructure versioned, reviewable, and reproducible — the same config that stood up staging can stand up prod, drift is detectable via diff, and changes go through the same PR/review process as application code. Immutability means you replace resources rather than patch them in place (e.g., bake a new AMI/container image and roll it out, instead of SSHing in to apply a fix). This eliminates configuration drift, makes rollbacks trivial (redeploy the previous known-good artifact), and guarantees that what's running matches what's declared. Mutable, hand-patched servers become 'snowflakes' that no one can safely reproduce or reason about." },
  { category: "DevOps", level: "Advanced", tags: ["observability", "sre", "monitoring"],
    question: "What are the four golden signals of monitoring, and how do they inform SLOs?",
    answer: "Latency (time to serve a request, splitting successful vs failed latency), Traffic (demand on the system, e.g. requests/sec), Errors (rate of failed requests), and Saturation (how 'full' the system is — CPU, memory, queue depth, connection pools). Together they answer 'is the system healthy and how close is it to its limits.' SLOs are set on these signals (e.g., 99.9% of requests < 300ms, error rate < 0.1%) with an SLI as the measured value and an error budget as the allowed slack. Alerting should be tied to SLO burn rate on these signals rather than raw infra metrics, so pages correspond to actual user impact instead of noisy internal thresholds." },
  { category: "DevOps", level: "Advanced", tags: ["incident-response", "postmortems"],
    question: "Walk through how you'd run a blameless postmortem after a production incident.",
    answer: "1) Establish a timeline from detection to resolution using logs/metrics/chat history — facts, not opinions. 2) Identify what happened and the contributing factors (technical and process), explicitly avoiding 'who' caused it — the goal is fixing systems, not blaming people. 3) Determine root cause(s) using something like the 5 Whys, but accept that most incidents have multiple contributing factors, not one root cause. 4) Write concrete, owned, time-boxed action items (add an alert, add a canary check, fix a runbook) — not vague 'be more careful' items. 5) Share it widely; postmortems are a learning artifact for the whole org, not a compliance document. Blamelessness matters because if people fear punishment they hide information, which makes the next incident worse." },
  { category: "DevOps", level: "Advanced", tags: ["sre", "error-budget"],
    question: "What is an error budget and how does it change how a team ships?",
    answer: "If an SLO says 99.9% availability, the error budget is the remaining 0.1% — the amount of unreliability you're allowed before violating the SLO. It reframes reliability as a resource to spend, not an absolute requirement: as long as budget remains, the team can ship fast, take risks, and deploy frequently. Once the budget is exhausted, the team shifts focus to stability — freezing risky releases, prioritizing reliability work — until the budget recovers. This gives product and reliability work a shared, objective currency instead of an endless tug-of-war between 'ship features' and 'be careful', and avoids both over-engineering reliability nobody needs and under-investing in it when it matters." },
  { category: "DevOps", level: "Intermediate", tags: ["deployment-strategies", "rollback"],
    question: "Compare rolling, blue-green, and canary deployments, and how you'd think about rollback for each.",
    answer: "Rolling: instances are replaced a few at a time with the new version; low infra overhead, but rollback means rolling forward again with the old version — slower to fully undo, and you briefly run mixed versions. Blue-green: two full environments, cut traffic over instantly; rollback is just flipping traffic back to blue — fastest rollback, but costs 2x infra during the switch. Canary: shift a small percentage of traffic to the new version and watch metrics before ramping further; safest for catching regressions early since blast radius is small, but requires good metrics/automation to decide when to proceed or abort, and is the most operationally complex of the three. In practice, teams often combine them — canary within a rolling or blue-green strategy." },

  // Ansible (playbooks, inventory, idempotency, roles, handlers, vault)
  { category: "Ansible", level: "Beginner", tags: ["idempotency", "basics"],
    question: "What is idempotency in Ansible and why does it matter?",
    answer: "An idempotent operation produces the same end state no matter how many times it's run — running a playbook twice shouldn't change anything the second time if the system already matches the desired state. Ansible modules (like `package`, `file`, `service`) are built to check current state before acting, so a task that installs a package is a no-op if it's already installed. This matters because it lets you safely re-run playbooks for drift correction, use the same playbook for initial provisioning and ongoing config management, and get accurate 'changed' vs 'ok' reporting to see exactly what a run actually modified." },
  { category: "Ansible", level: "Intermediate", tags: ["inventory"],
    question: "Explain the difference between static and dynamic inventory in Ansible.",
    answer: "Static inventory is a hand-maintained file (INI or YAML) listing hosts and groups, fine for small, stable environments. Dynamic inventory is generated at runtime by a script or plugin that queries a live source of truth — AWS EC2 tags, Azure, GCP, Kubernetes, or a CMDB — so the inventory always reflects what's actually running instead of going stale. In cloud environments where instances are ephemeral (auto-scaling, spot instances), dynamic inventory is effectively required; static inventory would need constant manual updates and would misrepresent the fleet within hours." },
  { category: "Ansible", level: "Intermediate", tags: ["roles", "playbooks"],
    question: "What's the difference between an Ansible role and a playbook, and when do you reach for a role?",
    answer: "A playbook is a YAML file of plays that map hosts to tasks — the entry point for a run. A role is a standardized, reusable directory structure (tasks/, handlers/, templates/, files/, vars/, defaults/) that packages a coherent piece of configuration (e.g., 'nginx', 'postgres-client') so it can be shared across playbooks and projects. You reach for a role once a set of tasks is reused in more than one playbook, or once a single playbook grows large enough that separating concerns (webserver setup vs database setup vs monitoring agent) improves readability. Roles can be shared via Ansible Galaxy, making them the unit of reuse across teams." },
  { category: "Ansible", level: "Advanced", tags: ["vault", "secrets"],
    question: "How does Ansible Vault work, and what are the trade-offs of encrypting whole files vs individual variables?",
    answer: "Ansible Vault encrypts sensitive data (passwords, API keys, certs) at rest using AES256, decrypting it in memory at runtime given a vault password or a password file/script. You can encrypt an entire YAML file (`ansible-vault encrypt vars/secrets.yml`) or just individual string values inline (`ansible-vault encrypt_string`) while leaving the rest of the file in plaintext. Whole-file encryption is simpler but makes diffs in git opaque — you can't see what changed in a PR. Per-variable encryption keeps the surrounding structure readable and diffable while still protecting the sensitive values, at the cost of slightly more setup. Vault passwords themselves should be managed by a secrets manager or CI vault integration, not committed anywhere." },
  { category: "Ansible", level: "Intermediate", tags: ["handlers"],
    question: "Explain Ansible handlers and `notify` — how do they differ from regular tasks?",
    answer: "A handler is a task that only runs when explicitly triggered via `notify` from another task, and only if that task reports 'changed'. Handlers are deduplicated and run once at the end of the play (or at explicit `meta: flush_handlers` points), regardless of how many tasks notified them. The classic use case is restarting a service only when its config file actually changed — you don't want to restart nginx on every playbook run, only when the config task modified something. This keeps playbooks efficient (no unnecessary restarts) and correct (the restart is guaranteed to happen if the change did, even if multiple tasks touch related config)." },
  { category: "Ansible", level: "Beginner", tags: ["ad-hoc", "modules"],
    question: "When would you use an ad-hoc Ansible command instead of writing a playbook?",
    answer: "Ad-hoc commands (`ansible webservers -m shell -a 'uptime'` or `ansible all -m ping`) are for one-off, throwaway tasks: checking connectivity, restarting a service across a fleet right now, gathering quick facts, or verifying something during an incident. They're not version-controlled, not idempotent by convention (though the underlying module might be), and not meant to be repeated. A playbook is for anything that represents desired, ongoing state — something you want tracked in git, code-reviewed, and safely re-run. Rule of thumb: if you'd want to run it again later or explain to a teammate why it happened, it belongs in a playbook, not an ad-hoc command." },
  { category: "Ansible", level: "Advanced", tags: ["comparison", "config-management"],
    question: "How does Ansible's architecture differ from Chef/Puppet, and what does that imply for how you'd use it?",
    answer: "Ansible is agentless and push-based: it connects over SSH (or WinRM) from a control node and executes modules remotely, with no persistent agent installed on managed hosts. Chef and Puppet are agent-based and typically pull-based: an agent runs on each managed node and periodically pulls its desired-state config from a central server. Ansible's model means lower operational overhead (nothing to install/maintain on targets, easier to get started) and simpler mental model (it runs when you run it, not on some background schedule), but it also means it doesn't continuously enforce state the way a Puppet agent does — drift can creep in between runs unless you schedule Ansible via cron/Tower/AWX or pair it with a drift-detection job. Chef/Puppet suit large, static fleets needing continuous enforcement; Ansible suits environments valuing simplicity, orchestration (multi-tier rollouts, not just per-node config), and ephemeral/cloud-native infrastructure." },
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
