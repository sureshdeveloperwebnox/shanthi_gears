"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (session) {
      console.log("User already authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="text-lg">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 w-80">
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={submitting}>{submitting ? "Logging in..." : "Login"}</Button>
      </form>

      {/* Add redirect to signup */}
      <p className="mt-4 text-sm text-gray-600">
        Don’t have an account?{" "}
        <span
          className="text-orange-500 cursor-pointer hover:underline"
          onClick={() => router.push("/signup")}
        >
          Create Account
        </span>
      </p>
    </div>
  );
}
