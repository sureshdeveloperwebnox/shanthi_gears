import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

      // Generate a unique token for database record (still needed for uniqueness)
      const resetToken = randomBytes(32).toString("hex");

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.userId },
      });

      // Create new reset token with OTP
      await prisma.passwordResetToken.create({
        data: {
          userId: user.userId,
          token: resetToken,
          otp: otp,
          expiresAt,
        },
      });

      // Send password reset email with OTP
      await sendPasswordResetEmail(user.email, otp, user.username);
    }

    // Always return success message (security best practice)
    return NextResponse.json({
      message:
        "If an account with that email exists, we've sent a password reset OTP to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

