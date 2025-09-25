"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut({ 
        callbackUrl: "/login",
        redirect: true 
      });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      size="sm"
      variant="outline"
      className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700 transition-colors duration-200 disabled:opacity-50 p-2"
      title="Logout"
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </Button>
  );
}
