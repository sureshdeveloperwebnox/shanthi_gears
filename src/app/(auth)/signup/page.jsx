"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Strong password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("One special character");
    }
    
    return errors;
  };

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
    
    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setPasswordError(passwordErrors.join(", "));
      return;
    }
    
    setPasswordError("");
    
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
        <div className="relative">
          <Input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(""); // Clear error when user types
            }}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {passwordError && (
          <p className="text-sm text-red-600">{passwordError}</p>
        )}
        <div className="text-xs text-gray-500">
          Password must contain: 8+ characters, uppercase, lowercase, number, and special character
        </div>
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
