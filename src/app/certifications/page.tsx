import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAllProfileData } from "@/domains/profile/services/profile.service";
import NavbarMain from "@/domains/profile/components/navbar/NavbarMain";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Certifications | Mohana Srinivasan",
  description: "Professional certifications in AWS, DevOps, Cloud Engineering, and Linux administration.",
  alternates: { canonical: "/certifications" },
};

export default async function CertificationsPage() {
  const data = await getAllProfileData();
  if (!data) redirect("/");

  const { certifications } = data;

  const byIssuer = certifications.reduce<Record<string, typeof certifications>>((acc, c) => {
    if (!acc[c.issuer]) acc[c.issuer] = [];
    acc[c.issuer].push(c);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-darkBrown">
      <NavbarMain />
      <div className="h-20" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/profile" className="inline-flex items-center gap-2 text-lightGrey hover:text-cyan transition-colors text-sm font-mono mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>

        <div className="mb-10">
          <p className="section-tag mb-3">Verified Credentials</p>
          <h1 className="font-special text-4xl sm:text-5xl font-bold text-white mb-3">
            <span className="gradient-text">Certifications</span>
          </h1>
          <p className="text-lightGrey font-mono text-sm max-w-xl">
            {certifications.length} professional certifications from{" "}
            {Object.keys(byIssuer).join(", ")}.
          </p>
        </div>

        {/* Grouped by issuer */}
        <div className="space-y-10">
          {Object.entries(byIssuer).map(([issuer, certs]) => (
            <div key={issuer}>
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-cyan" />
                <h2 className="text-white font-mono font-bold text-sm">{issuer}</h2>
                <span className="text-lightGrey/30 text-[10px] font-mono">({certs.length} cert{certs.length !== 1 ? "s" : ""})</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certs.map((cert) => (
                  <div key={cert.id}
                    className="glass rounded-xl border border-white/10 p-5 hover:border-cyan/20 transition-all group flex flex-col">
                    {/* Badge image */}
                    {cert.imageUrl && (
                      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 overflow-hidden flex-shrink-0">
                        <img src={cert.imageUrl} alt={cert.title} className="w-10 h-10 object-contain" />
                      </div>
                    )}

                    <h3 className="text-white font-mono font-bold text-sm leading-tight mb-1 group-hover:text-cyan transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-cyan text-[11px] font-mono mb-1">{cert.issuer}</p>
                    <p className="text-lightGrey/40 text-[10px] font-mono mb-3">Issued {cert.date}</p>

                    {cert.description && (
                      <p className="text-lightGrey text-[11px] font-mono leading-relaxed mb-3 flex-1">{cert.description}</p>
                    )}

                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener"
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono text-lightGrey/40 hover:text-cyan transition-colors mt-auto">
                        <ExternalLink className="w-3 h-3" /> Verify Credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {certifications.length === 0 && (
          <div className="glass rounded-2xl border border-white/10 p-12 text-center">
            <Award className="w-10 h-10 text-lightGrey/20 mx-auto mb-3" />
            <p className="text-lightGrey/40 font-mono text-sm">Certifications not yet seeded. Run: <code className="text-cyan">npm run db:seed</code></p>
          </div>
        )}
      </div>
    </main>
  );
}
