import "./globals.css";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for Shanthi Gears",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100 text-gray-900">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
