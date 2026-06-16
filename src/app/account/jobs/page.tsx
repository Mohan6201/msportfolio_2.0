import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountLayout from "@/domains/accounts/components/AccountLayout";
import JobSearch from "@/domains/jobs/components/JobSearch";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account/login");

  return (
    <AccountLayout userName={session.user.name}>
      <div className="max-w-4xl">
        <JobSearch />
      </div>
    </AccountLayout>
  );
}
