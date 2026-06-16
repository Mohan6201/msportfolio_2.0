import type { Metadata } from "next";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import MonitoringDemo from "@/domains/devops-toolkit/components/MonitoringDemo";

export const metadata: Metadata = {
  title: "Live Monitoring Demo | MS Portfolio",
  description:
    "Live DevOps monitoring dashboard demo — CPU, memory, disk, request rate, service health, and log stream. Simulated real-time metrics.",
};

export default function MonitoringDemoPage() {
  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <p className="section-tag mb-4">Operational Maturity</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-4">
            Live <span className="gradient-text">Monitoring</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            Production-style monitoring dashboard with real-time metrics, service health checks, and log streaming.
            All data is synthetically generated to demonstrate operational patterns.
          </p>
        </div>

        <MonitoringDemo />
      </div>
    </main>
  );
}
