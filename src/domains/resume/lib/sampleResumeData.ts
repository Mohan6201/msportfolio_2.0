import type { ResumeData } from "@/ai/schemas/resumeExtraction";

// Fixed, realistic sample data for template thumbnails and any other place a template needs to
// render without a real uploaded resume. Deliberately long enough (4 roles, several bullets
// each) to span 2 pages in the paginated preview — a thumbnail that only ever shows a 1-page
// resume would never visually prove pagination works. Never pass this to a template alongside
// real user data; it exists so thumbnails/previews stay identical for every visitor regardless
// of whether they've uploaded a resume yet.
export const SAMPLE_RESUME_DATA: ResumeData = {
  contact: {
    fullName: "Jordan Rivera",
    email: "jordan.rivera@example.com",
    phone: "+1 (555) 012-3456",
    location: "Austin, TX",
    linkedinUrl: "linkedin.com/in/jordanrivera",
    githubUrl: "github.com/jordanrivera",
    portfolioUrl: "jordanrivera.dev",
  },
  summary:
    "Cloud infrastructure engineer with 6 years building and operating production AWS platforms. Led migrations from EC2 to ECS Fargate, cut deployment time by 60% through CI/CD automation, and built observability stacks that reduced incident response time by half. Comfortable owning systems end-to-end, from Terraform to on-call.",
  experiences: [
    {
      jobTitle: "Senior Cloud Infrastructure Engineer",
      company: "Northwind Systems",
      location: "Austin, TX",
      startDate: "Mar 2023",
      endDate: undefined,
      isCurrent: true,
      responsibilities: [
        "Led migration of 40+ microservices from EC2 to ECS Fargate, reducing infrastructure spend by 32% and eliminating manual patching",
        "Designed a multi-account AWS Organizations structure with SCPs, cutting cross-team blast radius incidents to zero over 18 months",
        "Built a Terraform module library adopted by 6 teams, reducing new-environment provisioning time from 2 weeks to under a day",
        "Implemented centralized observability with Prometheus, Grafana, and Loki, reducing mean time to detection from 40 to 9 minutes",
      ],
      technologies: ["AWS", "ECS", "Terraform", "Prometheus", "Grafana", "GitHub Actions"],
    },
    {
      jobTitle: "DevOps Engineer",
      company: "Fieldstone Analytics",
      location: "Remote",
      startDate: "Jul 2020",
      endDate: "Feb 2023",
      isCurrent: false,
      responsibilities: [
        "Automated CI/CD pipelines for 15 services using GitHub Actions and CodeBuild, cutting release cycle time from days to hours",
        "Migrated on-prem PostgreSQL databases to Amazon RDS with zero data loss and under 5 minutes of downtime",
        "Introduced Infrastructure as Code (CloudFormation → Terraform) across the org, replacing manual console changes",
        "On-call rotation lead; wrote runbooks that cut average incident resolution time by 45%",
      ],
      technologies: ["Docker", "CloudFormation", "Terraform", "RDS", "Python"],
    },
    {
      jobTitle: "Systems Administrator",
      company: "Fieldstone Analytics",
      location: "Remote",
      startDate: "Jun 2018",
      endDate: "Jun 2020",
      isCurrent: false,
      responsibilities: [
        "Managed a fleet of 80+ Linux servers across staging and production environments",
        "Built internal monitoring dashboards that surfaced disk/memory pressure issues before they caused outages",
        "Wrote Ansible playbooks to standardize server configuration, cutting new-server setup time by 70%",
      ],
      technologies: ["Linux", "Ansible", "Bash", "Nagios"],
    },
    {
      jobTitle: "IT Support Specialist",
      company: "Cascade Retail Group",
      location: "Portland, OR",
      startDate: "Jan 2017",
      endDate: "May 2018",
      isCurrent: false,
      responsibilities: [
        "Provided tier 1/2 support for 300+ employees across 4 retail locations",
        "Automated recurring ticket resolutions with PowerShell scripts, reducing average resolution time by 25%",
      ],
      technologies: ["Windows Server", "Active Directory", "PowerShell"],
    },
  ],
  education: [
    {
      degree: "B.S. Computer Science",
      institution: "University of Texas at Austin",
      location: "Austin, TX",
      startDate: "Aug 2013",
      endDate: "May 2017",
      gpa: "3.6",
      honors: "Dean's List, 3 semesters",
    },
  ],
  skills: [
    { category: "Cloud & Infrastructure", items: ["AWS", "ECS", "Fargate", "Lambda", "VPC", "IAM", "S3", "RDS"] },
    { category: "IaC & Automation", items: ["Terraform", "CloudFormation", "Ansible", "GitHub Actions"] },
    { category: "Observability", items: ["Prometheus", "Grafana", "Loki", "CloudWatch"] },
    { category: "Languages", items: ["Python", "Bash", "Go"] },
  ],
  certifications: [
    { title: "AWS Certified Solutions Architect – Professional", issuer: "Amazon Web Services", date: "2024" },
    { title: "AWS Certified DevOps Engineer – Professional", issuer: "Amazon Web Services", date: "2023" },
    { title: "Certified Kubernetes Administrator (CKA)", issuer: "CNCF", date: "2022" },
  ],
  projects: [
    {
      name: "terraform-aws-blueprints",
      description:
        "Open-source library of production-ready Terraform modules for common AWS architectures (VPC, ECS, RDS), used by 6 internal teams and 200+ GitHub stars.",
      technologies: ["Terraform", "AWS", "GitHub Actions"],
      url: "jordanrivera.dev/projects/blueprints",
      githubUrl: "github.com/jordanrivera/terraform-aws-blueprints",
    },
    {
      name: "incident-radar",
      description:
        "Self-hosted Slack bot that correlates CloudWatch alarms with recent deploys to flag likely root causes during incidents, cutting triage time by 30%.",
      technologies: ["Python", "AWS Lambda", "Slack API"],
      githubUrl: "github.com/jordanrivera/incident-radar",
    },
  ],
};
