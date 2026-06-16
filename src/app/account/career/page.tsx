import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountLayout from "@/domains/accounts/components/AccountLayout";
import CareerAdvisor from "@/domains/career/components/CareerAdvisor";

export const dynamic = "force-dynamic";

export default async function CareerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account/login");

  return (
    <AccountLayout userName={session.user.name}>
      <div className="max-w-3xl">
        <h1 className="font-special text-2xl font-bold text-white mb-1">Career Advisor</h1>
        <p className="text-lightGrey text-sm font-mono mb-8">
          AI-generated roadmap based on your resume, preferences, and job matches
        </p>
        <CareerAdvisor />
      </div>
    </AccountLayout>
  );
}
