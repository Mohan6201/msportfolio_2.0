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
        <CareerAdvisor />
      </div>
    </AccountLayout>
  );
}
