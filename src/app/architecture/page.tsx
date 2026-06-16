import type { Metadata } from "next";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import ArchitectureShowcase from "@/domains/devops-toolkit/components/ArchitectureShowcase";

export const metadata: Metadata = {
  title: "Architecture Showcase | MS Portfolio",
  description:
    "Interactive DevOps and cloud architecture diagrams — AWS 3-Tier, CI/CD Pipeline, Kubernetes, and Microservices. Click any component to explore.",
};

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <p className="section-tag mb-4">Architecture Showcase</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-4">
            Cloud <span className="gradient-text">Architecture</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            Interactive architecture diagrams for production DevOps patterns.
            Click any component to explore its role, tech stack, and design decisions.
          </p>
        </div>

        <ArchitectureShowcase />
      </div>
    </main>
  );
}
