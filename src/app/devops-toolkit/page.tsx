import type { Metadata } from "next";
import DevOpsToolkit from "@/domains/devops-toolkit/components/DevOpsToolkit";

export const metadata: Metadata = {
  title: "DevOps Toolkit | MS Portfolio",
  description: "Free DevOps tools: Nginx config generator, Docker Compose generator, GitHub Actions generator, EC2 cost calculator, and AI AWS architecture designer.",
  alternates: { canonical: "/devops-toolkit" },
};

export default function DevOpsToolkitPage() {
  return (
    <main className="min-h-screen bg-darkBrown">
      {/* Nav spacer */}
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <p className="section-tag mb-4">Free DevOps Tools</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-4">
            DevOps <span className="gradient-text">Toolkit</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            Generate production-ready configs for Nginx, Docker Compose, and GitHub Actions.
            Calculate EC2 costs. Design AWS architectures with AI.
          </p>
        </div>

        <DevOpsToolkit />
      </div>
    </main>
  );
}
