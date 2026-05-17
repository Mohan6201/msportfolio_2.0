import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

interface Props {
  searchParams: Promise<{ secret?: string }>;
}

export default async function AdminPage({ searchParams }: Props) {
  const { secret } = await searchParams;

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    redirect("/");
  }

  return <AdminDashboard secret={secret} />;
}
