"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmitEmail = async (e) => {
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
        setStep("otp");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      // Navigate to reset password page with email and OTP
      router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
    } catch (error) {
      console.error("OTP submission error:", error);
      setError("An error occurred. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  if (step === "otp") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <h1 className="text-3xl font-bold mb-2">Enter OTP</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          We've sent a 6-digit OTP to <strong>{email}</strong>. Please enter it below.
        </p>

        <form onSubmit={onSubmitOtp} className="flex flex-col gap-4 w-80">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              OTP sent successfully! Please check your email.
            </div>
          )}

          <Input
            placeholder="Enter 6-digit OTP"
            type="text"
            value={otp}
            onChange={handleOtpChange}
            required
            autoFocus
            maxLength={6}
            className="text-center text-2xl tracking-widest font-mono"
          />

          <Button type="submit" disabled={submitting || otp.length !== 6}>
            {submitting ? "Verifying..." : "Verify OTP"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep("email");
              setOtp("");
              setSuccess(false);
            }}
            className="text-sm text-gray-600 hover:text-gray-800 mt-2"
          >
            ← Change Email
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Enter your email address and we'll send you an OTP to reset your password.
      </p>

      <form onSubmit={onSubmitEmail} className="flex flex-col gap-4 w-80">
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
          {submitting ? "Sending..." : "Send OTP"}
        </Button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-sm text-gray-600 hover:text-gray-800 mt-2"
        >
          ← Back to Login
        </button>
      </form>
    </div>
  );
}

