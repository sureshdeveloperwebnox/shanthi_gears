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
          className="bg-orange-600 text-white p-3 rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
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
        "bg-orange-600 text-white flex flex-col shadow-lg transition-transform duration-300 ease-in-out z-50",
        // Desktop styles - fixed position to stay in place during scroll
        "lg:w-64 lg:fixed lg:top-0 lg:left-0 lg:translate-x-0 lg:h-screen lg:min-h-full",
        // Mobile styles
        "fixed top-0 left-0 h-screen w-80 max-w-[80vw]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-orange-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="Logo.gif" 
                alt="Shanthi Gears Logo" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <h1 className="text-xl font-bold text-white" style={{display: 'none'}}>
                
              </h1>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-orange-200 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-h-0">
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                  pathname === link.href
                    ? "bg-orange-700 text-white"
                    : "text-orange-100 hover:bg-orange-700 hover:text-white"
                )}
              >
                <span className="mr-3 text-lg">{link.icon}</span>
                <span>{link.label}</span>
                {pathname === link.href && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-6">
            <div className="flex items-center mb-3">
              <span className="text-orange-200 text-xs uppercase font-semibold">Settings</span>
              <div className="flex-1 ml-3 border-t border-orange-500"></div>
            </div>
            <div className="space-y-1">
              {settings.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                    pathname === link.href
                      ? "bg-orange-700 text-white"
                      : "text-orange-100 hover:bg-orange-700 hover:text-white"
                  )}
                >
                  <span className="mr-3 text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                  {pathname === link.href && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-orange-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm font-bold">SG</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-orange-200">© {new Date().getFullYear()} Shanthi Gears</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}