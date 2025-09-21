"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // shadcn utility

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/complaints", label: "Complaints" },
  { href: "/territories", label: "Territories" },
  { href: "/employees", label: "Employees" },
  { href: "/employee-territories", label: "Employee Territories" },
];

const settings = [
  { href: "/settings/roles", label: "Roles" },
  { href: "/settings/users", label: "users" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === link.href
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}

        <div className="mt-6">
          <p className="text-gray-400 text-xs uppercase mb-2">Settings</p>
          {settings.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        © {new Date().getFullYear()} Shanthi Gears
      </div>
    </div>
  );
}
