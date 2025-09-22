"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="bg-black text-white hover:bg-gray-800"
    >
      Logout
    </Button>
  );
}
