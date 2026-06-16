import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/auth";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const role = (session?.user as unknown as { role?: string })?.role;

  if (!session || !["owner", "admin"].includes(role ?? "")) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
