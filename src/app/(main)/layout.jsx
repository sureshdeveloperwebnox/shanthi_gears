import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      <Sidebar session={session} />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
