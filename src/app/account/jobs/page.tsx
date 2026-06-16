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
        <h1 className="font-special text-2xl font-bold text-white mb-1">Jobs</h1>
        <p className="text-lightGrey text-sm font-mono mb-8">
          Suggested matches · Search · Application tracker
        </p>
        <JobSearch />
      </div>
    </AccountLayout>
  );
}
