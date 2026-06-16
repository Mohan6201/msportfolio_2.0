import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllProfileData } from "@/domains/profile/services/profile.service";
import RecruiterView from "@/domains/profile/components/recruiter/RecruiterView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recruiter Portal | MS Portfolio",
  description: "Recruiter-facing professional profile view for Mohana Srinivasan — DevOps & Cloud Engineer.",
};

export default async function RecruiterPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/recruiter/login");

  const role = (session.user as unknown as { role?: string })?.role ?? "user";
  if (!["owner", "admin", "recruiter"].includes(role)) {
    return (
      <main className="min-h-screen bg-darkBrown flex items-center justify-center px-4">
        <div className="glass rounded-2xl border border-white/10 p-8 text-center max-w-sm">
          <p className="text-white font-mono font-bold mb-2">Access Restricted</p>
          <p className="text-lightGrey text-sm font-mono">
            This portal is for authorized recruiters only.
          </p>
        </div>
      </main>
    );
  }

  const data = await getAllProfileData();
  if (!data) redirect("/");

  return <RecruiterView data={data} userName={session.user.name} />;
}
