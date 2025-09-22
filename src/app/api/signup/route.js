import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await prisma.users.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure a default role exists (e.g., "User") and get its id
    const defaultRole = await prisma.roles.upsert({
      where: { roleName: "User" },
      update: {},
      create: { roleName: "User" },
      select: { roleId: true },
    });

    const newUser = await prisma.users.create({
      data: {
        username: name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        roleId: defaultRole.roleId,
      },
      select: { userId: true, email: true },
    });

    return NextResponse.json({ id: newUser.userId, email: newUser.email });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
