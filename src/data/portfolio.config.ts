import {
  FaAws,
  FaDocker,
  FaJenkins,
  FaReact,
  FaLinkedinIn,
  FaInstagram,
  FaPython,
  FaFire,
} from "react-icons/fa";
import {
  SiGithubactions,
  SiKubernetes,
  SiLinux,
  SiTerraform,
  SiGrafana,
  SiPrometheus,
  SiHelm,
  SiVault,
  SiAnsible,
  SiDjango,
} from "react-icons/si";
import { GiArtificialIntelligence } from "react-icons/gi";
import { HiOutlineMail } from "react-icons/hi";
import { FiPhone, FiGithub } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import type { ComponentType } from "react";

export interface Skill {
  skill: string;
  icon: ComponentType<{ className?: string }>;
  level: number;
  category: "cloud" | "devops" | "backend" | "monitoring";
}

export interface Experience {
  job: string;
  company: string;
  companyUrl?: string;
  date: string;
  current?: boolean;
  tech: string[];
  responsibilities: string[];
}

export interface Certificate {
  title: string;
  issuer: string;
  date: string;
  description: string;
  image: string;
  link?: string;
}

export interface Project {
  name: string;
  year: string;
  description: string;
  align: "left" | "right";
  image: string;
  link: string;
  github?: string;
  tech: string[];
  responsibilities: string[];
}

export interface ContactDetail {
  text: string;
  Icon: ComponentType<{ className?: string }>;
}

export interface SocialLink {
  Icon: ComponentType<{ className?: string }>;
  link: string;
  label: string;
  target?: string;
  rel?: string;
}

export const skills: Skill[] = [
  { skill: "AWS (EC2, ECS, S3, IAM, RDS)", icon: FaAws,          level: 92, category: "cloud" },
  { skill: "Docker & Containers",          icon: FaDocker,        level: 88, category: "devops" },
  { skill: "Kubernetes (EKS)",             icon: SiKubernetes,    level: 80, category: "devops" },
  { skill: "Terraform (IaC)",              icon: SiTerraform,     level: 83, category: "devops" },
  { skill: "GitHub Actions",               icon: SiGithubactions, level: 90, category: "devops" },
  { skill: "Jenkins CI",                   icon: FaJenkins,       level: 78, category: "devops" },
  { skill: "Ansible",                      icon: SiAnsible,       level: 72, category: "devops" },
  { skill: "Python & Shell",               icon: FaPython,        level: 82, category: "backend" },
  { skill: "Django Framework",             icon: SiDjango,        level: 70, category: "backend" },
  { skill: "ReactJS",                      icon: FaReact,         level: 68, category: "backend" },
  { skill: "Grafana",                      icon: SiGrafana,       level: 76, category: "monitoring" },
  { skill: "Prometheus",                   icon: SiPrometheus,    level: 74, category: "monitoring" },
  { skill: "Helm Charts",                  icon: SiHelm,          level: 70, category: "devops" },
  { skill: "Vault (Secrets)",              icon: SiVault,         level: 65, category: "devops" },
  { skill: "Linux Administration",         icon: SiLinux,         level: 88, category: "backend" },
  { skill: "Firebase",                      icon: FaFire,                   level: 65, category: "backend" },
  { skill: "AI/ML Deployments",            icon: GiArtificialIntelligence, level: 72, category: "backend" },
];

export const experiences: Experience[] = [
  {
    job: "DevOps Engineer",
    company: "Swirepay",
    companyUrl: "https://swirepay.com",
    date: "SEP 2025 – Present",
    current: true,
    tech: ["AWS", "Kubernetes", "Terraform", "GitHub Actions", "Vault", "Helm"],
    responsibilities: [
      "Architecting and managing cloud infrastructure for PCI-DSS-compliant payment processing on AWS.",
      "Implementing Kubernetes (EKS) with Helm for microservices orchestration and zero-downtime deployments.",
      "Designing multi-stage CI/CD pipelines for secure, automated fintech application releases.",
      "Managing secrets using HashiCorp Vault and AWS Secrets Manager across environments.",
      "Ensuring 99.99% availability for payment gateway systems with auto-scaling and DR strategy.",
    ],
  },
  {
    job: "AWS DevOps Engineer",
    company: "Enterprise SoftLabs Pvt Ltd",
    date: "JUL 2023 – AUG 2025",
    current: false,
    tech: ["AWS", "Docker", "ECS", "CodePipeline", "GitHub Actions", "CloudWatch"],
    responsibilities: [
      "Built production CI/CD pipelines with GitHub Actions + AWS CodePipeline for an AI/ML WMS application.",
      "Deployed and orchestrated Dockerised services (prediction engine, data sync, reporting) via ECS Fargate.",
      "Managed core AWS stack — EC2, S3, IAM, Route 53, VPC — for scalable, secure infrastructure.",
      "Set up CloudWatch dashboards and custom alarms, reducing mean time to detect incidents by 60%.",
      "Automated infrastructure provisioning with Terraform, eliminating manual environment drift.",
    ],
  },
  {
    job: "Staff Consultant",
    company: "Enterprise SoftLabs Pvt Ltd",
    date: "DEC 2022 – JUL 2023",
    current: false,
    tech: ["WMS", "Körber", "SQL Server", "IIS", "Windows Server"],
    responsibilities: [
      "Led end-to-end WMS platform migration from HighJump to Körber across DEV, UAT, and PROD.",
      "Managed high-scalability WMS deployments; configured IIS, Bartender, and remote printing services.",
      "Provisioned and configured Windows Server 2022 on physical hardware for production use.",
    ],
  },
  {
    job: "Trainee Consultant",
    company: "Enterprise SoftLabs Pvt Ltd",
    date: "APR 2022 – DEC 2022",
    current: false,
    tech: ["Azure", "SQL", "Active Directory", "Cisco VPN"],
    responsibilities: [
      "Managed supply chain change requests for Maersk — analysed and modified SQL stored procedures.",
      "Troubleshot Azure and Cisco VPN connectivity issues, and administered Windows Active Directory.",
      "Handled product installation, configuration, and server network resolution.",
    ],
  },
];

export const certificates: Certificate[] = [
  {
    title: "DevOps Certified Expert (In-Progress)",
    issuer: "Guvi",
    date: "2025-05-17",
    description: "Hands-on training with Git, Jenkins, Docker, Ansible, Terraform, and Kubernetes covering end-to-end DevOps workflows.",
    image: "images/blank.png",
  },
  {
    title: "AWS Solutions Architect Associate",
    issuer: "RedSys9 Tech Pvt Ltd",
    date: "2025-04-21",
    description: "Designing scalable, secure, and reliable AWS cloud architectures using EC2, S3, VPC, IAM, and more.",
    image: "images/ASA Certificate.jfif",
  },
  {
    title: "Warehouse Advantage Certified Associate",
    issuer: "Körber Supply Chain",
    date: "2023-09-09",
    description: "Real-time warehouse operations and inventory management expertise; supply chain efficiency optimization.",
    link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
    image: "images/Korber.png",
  },
  {
    title: "Full Stack Developer",
    issuer: "3Edge Solutions Pvt Ltd",
    date: "2022-12-27",
    description: "Complete web application development with front-end and back-end technologies.",
    link: "https://www.credly.com/badges/e12dca0f-078f-40ab-b8e9-647121ddf599/linked_in_profile",
    image: "images/3Edge.png",
  },
];

export const projects: Project[] = [
  {
    name: "Next.js DevOps Portfolio",
    year: "2025",
    description: "This very portfolio — built with Next.js 15, TypeScript, Tailwind v4, LibSQL, and deployed on Vercel. Features AI chatbot, blog CMS, admin dashboard, and full analytics.",
    align: "right",
    image: "/images/Reactp2.png",
    link: "https://msportfolio.vercel.app",
    github: "https://github.com/Mohan6201",
    tech: ["Next.js 15", "TypeScript", "Tailwind", "LibSQL", "Vercel", "Gemini AI"],
    responsibilities: [
      "Architected production-grade Next.js 15 app with App Router and server components.",
      "Integrated Google Gemini 2.0 Flash AI chatbot with context-aware DevOps responses.",
      "Built blog CMS with MDX, OG image generation, comments, and newsletter subscription.",
      "Implemented SQLite/LibSQL database with admin dashboard for content management.",
      "Deployed with Vercel Analytics, Speed Insights, and automated CI/CD on every push.",
    ],
  },
  {
    name: "Txenia AI/ML WMS Platform",
    year: "Nov 2023",
    description: "End-to-end DevOps for an AI-powered Warehouse Management System — from containerisation to CI/CD to production monitoring.",
    align: "left",
    image: "/images/Txenia.png",
    link: "https://txenia.ai/",
    tech: ["AWS ECS", "Docker", "CodePipeline", "GitHub Actions", "MLflow", "CloudWatch"],
    responsibilities: [
      "Built CI/CD pipeline with GitHub Actions + AWS CodePipeline enabling one-click deploys.",
      "Dockerised Django/React/ML services and deployed via ECS Fargate with auto-scaling.",
      "Integrated MLflow for live ML model tracking and Apache Superset for dashboards.",
      "Configured Route 53 + ALB DNS for zero-downtime blue/green deployments.",
      "Set up CloudWatch alarms and custom metrics for ML inference latency monitoring.",
    ],
  },
  {
    name: "Good Eggs WMS Migration",
    year: "Jan 2023",
    description: "Mission-critical WMS platform migration from HighJump to Körber for Good Eggs, a fresh grocery delivery service.",
    align: "right",
    image: "/images/Goodeggs.png",
    link: "https://www.goodeggs.com/",
    tech: ["Körber WMS", "SQL Server", "IIS", "Bartender", "Confluence"],
    responsibilities: [
      "Migrated DB, apps, configs, Bartender, IIS, and remote printers across DEV/UAT/PROD.",
      "Modified application URLs in Page Editor and configured IIS for Körber Core hosting.",
      "Managed ticketing portal and Confluence documentation for seamless knowledge transfer.",
    ],
  },
  {
    name: "Dr.Max Pharmacy WMS",
    year: "Jun 2023",
    description: "Full lifecycle WMS deployment and migration for Dr.Max, one of Europe's largest pharmacy chains.",
    align: "left",
    image: "/images/dr.max.png",
    link: "https://www.drmax.eu/en/default",
    tech: ["Körber WMS", "SQL Server", "Windows Server", "Bartender", "Sanity Testing"],
    responsibilities: [
      "Executed end-to-end warehouse operations — receiving, picking, packing, and shipping.",
      "Configured Bartender software and modified stored procedures for deployment requirements.",
      "Performed sanity testing across DEV, UAT, and PROD to validate deployment stability.",
      "Set up initial and remote printer configurations across all three environments.",
    ],
  },
];

export const contactDetails: ContactDetail[] = [
  { text: "mohandevopssme@gmail.com", Icon: HiOutlineMail },
  { text: "+91 80988 85683",          Icon: FiPhone },
  { text: "Hitech City, Hyderabad",   Icon: IoLocationOutline },
];

export const socialLinks: SocialLink[] = [
  { Icon: FaLinkedinIn, link: "https://www.linkedin.com/in/mohan6201", label: "LinkedIn", target: "_blank", rel: "noopener noreferrer" },
  { Icon: FiGithub,     link: "https://github.com/Mohan6201",          label: "GitHub",   target: "_blank", rel: "noopener noreferrer" },
  { Icon: FaInstagram,  link: "#",                                      label: "Instagram" },
];
