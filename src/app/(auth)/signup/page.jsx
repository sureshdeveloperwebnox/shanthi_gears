"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    try {
      await axios.post("/api/signup", { name, email, password });
      alert("Account created successfully!");
      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
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

  // Don't render signup form if already authenticated (will redirect)
  if (session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="text-lg">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 w-80">
        <Input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <Button type="submit">Sign Up</Button>
      </form>

      {/* Redirect to login */}
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <span
          className="text-orange-500 cursor-pointer hover:underline"
          onClick={() => router.push("/login")}
        >
          Login
        </span>
      </p>
    </div>
  );
}
