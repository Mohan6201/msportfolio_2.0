import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountLayout from "@/domains/accounts/components/AccountLayout";
import ResumeStudio from "@/domains/resume/components/ResumeStudio";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account/login");

  return (
    <AccountLayout userName={session.user.name}>
      <div className="max-w-5xl">
        <h1 className="font-special text-2xl font-bold text-white mb-1">Resume Studio</h1>
        <p className="text-lightGrey text-sm font-mono mb-8">
          Upload · AI-extract · choose template · export PDF
        </p>
        <ResumeStudio />
      </div>
    </AccountLayout>
  );
}
