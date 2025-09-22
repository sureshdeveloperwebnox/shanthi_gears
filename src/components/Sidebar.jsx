"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-orange-500 text-white flex flex-col h-screen p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">Shanthi Gears</h2>
        {session && (
          <p className="text-sm">
            {session.user.name} <br /> {session.user.email}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-2">
        <Link href="/" className="block px-3 py-2 rounded hover:bg-orange-600">
          Dashboard
        </Link>
        <Link href="/employees" className="block px-3 py-2 rounded hover:bg-orange-600">
          Employees
        </Link>
        <Link href="/territories" className="block px-3 py-2 rounded hover:bg-orange-600">
          Territories
        </Link>
        <Link href="/employee-territories" className="block px-3 py-2 rounded hover:bg-orange-600">
          Employee Territories
        </Link>
        <Link href="/complaints" className="block px-3 py-2 rounded hover:bg-orange-600">
          Complaints
        </Link>
        <Link href="/settings" className="block px-3 py-2 rounded hover:bg-orange-600">
          Settings
        </Link>
      </nav>

      <div className="mt-auto">
        <Button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full bg-black text-white hover:bg-gray-800"
        >
          Logout
        </Button>
      </div>
    </aside>
  );
}
