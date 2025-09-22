"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res.error) {
      alert(res.error);
    } else {
      router.push("/"); // redirect to dashboard
    }
  };

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
        <Button type="submit">Login</Button>
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
