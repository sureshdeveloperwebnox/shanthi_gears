"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // shadcn utility
import { 
  BarChart3, 
  FileText, 
  MapPin, 
  Users, 
  Target, 
  User,
  X
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/complaints", label: "Complaints", icon: FileText },
  { href: "/territories", label: "Territories", icon: MapPin },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/employee-territories", label: "Employee Territories", icon: Target },
];

const settings = [
  { href: "/settings/users", label: "Users", icon: User },
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
        "bg-white text-gray-800 flex flex-col shadow-lg transition-transform duration-300 ease-in-out z-50 border-r border-gray-200",
        // Desktop styles - fixed position to stay in place during scroll
        "lg:w-64 lg:fixed lg:top-0 lg:left-0 lg:translate-x-0 lg:h-screen lg:min-h-full",
        // Mobile styles
        "fixed top-0 left-0 h-screen w-80 max-w-[80vw]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-200">
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
              <h1 className="text-xl font-bold text-gray-800" style={{display: 'none'}}>
                 
              </h1>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
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
                    ? "bg-orange-600 text-white"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                )}
              >
                <link.icon className="mr-3 w-5 h-5" />
                <span>{link.label}</span>
                {pathname === link.href && (
                  <div className="ml-auto w-2 h-2 bg-orange-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          <div className="pt-6">
            <div className="flex items-center mb-3">
              <span className="text-gray-500 text-xs uppercase font-semibold">Settings</span>
              <div className="flex-1 ml-3 border-t border-gray-200"></div>
            </div>
            <div className="space-y-1">
              {settings.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors group",
                    pathname === link.href
                      ? "bg-orange-600 text-white"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  )}
                >
                  <link.icon className="mr-3 w-5 h-5" />
                  <span>{link.label}</span>
                  {pathname === link.href && (
                    <div className="ml-auto w-2 h-2 bg-orange-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">SG</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Admin User</p>
              <p className="text-xs text-gray-500">© {new Date().getFullYear()} Shanthi Gears</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}