"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
      } else {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {success ? (
        <div className="w-80">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
            If an account with that email exists, we've sent a password reset link to your email.
            Please check your inbox and follow the instructions.
          </div>
          <Button
            onClick={() => router.push("/login")}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 w-80">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <Button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Link"}
          </Button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-gray-600 hover:text-gray-800 mt-2"
          >
            ← Back to Login
          </button>
        </form>
      )}
    </div>
  );
}

