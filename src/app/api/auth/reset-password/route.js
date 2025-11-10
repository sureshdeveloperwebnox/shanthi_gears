import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(req) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { error: "Email, OTP, and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or OTP" },
        { status: 400 }
      );
    }

    // Find the reset token with matching OTP for this user
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.userId,
        otp: otp,
      },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if OTP is already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: "This OTP has already been used" },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: "This OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hash(password, 12);

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.users.update({
        where: { userId: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

