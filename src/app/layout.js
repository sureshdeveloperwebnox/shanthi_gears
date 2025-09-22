import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Shanthi Gears - Management System",
  description: "Comprehensive management system for Shanthi Gears operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main content area */}
          <main className="flex-1 lg:ml-0 transition-all duration-300">
            {/* Content wrapper with mobile padding */}
            <div className="pt-20 lg:pt-0 px-0 lg:px-0">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}