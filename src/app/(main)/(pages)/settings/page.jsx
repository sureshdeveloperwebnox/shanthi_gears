"use client";

import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-black">You must be logged in</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Card className="w-full max-w-md shadow-lg border border-orange-500">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-black">
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-black">
          <p><span className="font-semibold">Name:</span> {session.user.name}</p>
          <p><span className="font-semibold">Email:</span> {session.user.email}</p>
        </CardContent>
      </Card>
    </div>
  );
}
