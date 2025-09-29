import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/components/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  // Check for next-auth.session-token cookie
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("next-auth.session-token");
  
  // If we have a session token cookie, allow access regardless of session state
  if (sessionToken) {
    // Continue with rendering, session might be null but cookie exists
    console.log("Session token found, allowing access");
  } else if (!session) {
    // Only redirect if no session token cookie AND no session
    console.log("No session token and no session, redirecting to login");
    redirect("/login");
  } else {
    console.log("Session found, allowing access");
  }

return (
  <div className="relative min-h-screen">
    <Sidebar session={session} />
    
    {/* Top Header with Logout */}
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center px-4 py-3 lg:px-6">
        <div className="flex items-center">
          
        </div>
        <div className="flex items-center space-x-4">
          <LogoutButton />
        </div>
      </div>
    </header>
    
    {/* Main content area - add left margin for fixed sidebar */}
    <main className="lg:ml-64 transition-all duration-300 min-h-screen">
      {/* Content wrapper with mobile padding */}
      <div className="pt-20 lg:pt-16 min-h-screen">
        {children}
      </div>
    </main>
  </div>
);
}