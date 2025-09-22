import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("next-auth.session-token");
  
  // If user has session or session token, redirect to dashboard
  if (session || sessionToken) {
    redirect("/dashboard");
  }
  
  // Otherwise redirect to login
  redirect("/login");
}





