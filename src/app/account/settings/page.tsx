import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountLayout from "@/domains/accounts/components/AccountLayout";
import PreferencesForm from "@/domains/accounts/components/PreferencesForm";

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/account/login");

  return (
    <AccountLayout userName={session.user.name}>
      <PreferencesForm />
    </AccountLayout>
  );
}
