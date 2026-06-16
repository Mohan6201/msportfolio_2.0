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
      <div className="max-w-6xl">
        <ResumeStudio />
      </div>
    </AccountLayout>
  );
}
