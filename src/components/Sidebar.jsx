"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // shadcn utility

const links = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/complaints", label: "Complaints", icon: "📋" },
  { href: "/territories", label: "Territories", icon: "🗺️" },
  { href: "/employees", label: "Employees", icon: "👥" },
  { href: "/employee-territories", label: "Employee Territories", icon: "🎯" },
];

const settings = [
  { href: "/settings/roles", label: "Roles", icon: "👑" },
  { href: "/settings/users", label: "Users", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        >
          <div className="flex flex-col space-y-1">
            <div className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-5 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-gray-900 text-white flex flex-col shadow-lg transition-transform duration-300 ease-in-out z-50",
        // Desktop styles
        "lg:w-64 lg:relative lg:translate-x-0",
        // Mobile styles
        "fixed top-0 left-0 h-full w-80 max-w-[80vw]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Shanthi Gears</h1>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-1">Management System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                  pathname === link.href
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                <span>{link.label}</span>
                {pathname === link.href && (
                  <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-6">
            <div className="flex items-center mb-3">
              <span className="text-gray-400 text-xs uppercase font-semibold">Settings</span>
              <div className="flex-1 ml-3 border-t border-gray-700"></div>
            </div>
            <div className="space-y-1">
              {settings.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                    pathname === link.href
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <span className="mr-3 text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                  {pathname === link.href && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">SG</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">© {new Date().getFullYear()} Shanthi Gears</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}