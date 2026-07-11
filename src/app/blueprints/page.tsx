import type { Metadata } from "next";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import BlueprintMarketplace from "@/domains/devops-toolkit/components/BlueprintMarketplace";

export const metadata: Metadata = {
  title: "Blueprint Marketplace | MS Portfolio",
  description:
    "Reusable DevOps deployment blueprints — Django on AWS ECS, Next.js on Vercel, WordPress on EC2, GitHub Actions CI/CD, and Kubernetes on EKS. Step-by-step guides with commands.",
  alternates: { canonical: "/blueprints" },
};

export default function BlueprintsPage() {
  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-12">
          <p className="section-tag mb-4">Deployment Blueprints</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-4">
            Blueprint <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            Production-grade deployment blueprints — click any card to expand the full architecture, step-by-step guide, and commands.
            Use these as a starting point for your own infrastructure.
          </p>
        </div>

        <BlueprintMarketplace />
      </div>
    </main>
  );
}
