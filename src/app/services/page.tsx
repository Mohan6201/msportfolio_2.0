import type { Metadata } from "next";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import ServicesSection from "@/domains/profile/components/services/ServicesSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "DevOps Services | Mohana Srinivasan",
  description:
    "Freelance DevOps & Cloud Engineering services — AWS setup, CI/CD pipelines, containerisation, Linux administration, and cloud architecture design.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <ServicesSection />

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 pb-24 text-center">
        <p className="text-lightGrey/50 text-xs font-mono">
          Available for remote and on-site engagements worldwide. ·{" "}
          <Link href="/" className="text-cyan hover:underline">
            Back to Portfolio
          </Link>
        </p>
      </div>
    </main>
  );
}
