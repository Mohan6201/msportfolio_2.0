import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountLayout from "@/domains/accounts/components/AccountLayout";
import InterviewLab from "@/domains/interview/components/InterviewLab";

export const dynamic = "force-dynamic";

export default async function InterviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account/login");

  return (
    <AccountLayout userName={session.user.name}>
      <div className="max-w-3xl">
        <h1 className="font-special text-2xl font-bold text-white mb-1">Interview Lab</h1>
        <p className="text-lightGrey text-sm font-mono mb-8">
          Browse questions · Practice with AI feedback · Track performance
        </p>
        <InterviewLab />
      </div>
    </AccountLayout>
  );
}
