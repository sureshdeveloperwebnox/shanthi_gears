import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Shanthi Gears - Management System",
  description: "Comprehensive management system for Shanthi Gears operations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50 text-gray-900">
        <div className="relative min-h-screen">
          <Sidebar />
          {/* Main content area - add left margin for fixed sidebar */}
          <main className="lg:ml-64 transition-all duration-300 min-h-screen">
            {/* Content wrapper with mobile padding */}
            <div className="pt-20 lg:pt-0 min-h-screen">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}