import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET all users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const users = await prisma.users.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get roles separately since the relation is not properly set up
    const roles = await prisma.roles.findMany();
    
    // Map users with their roles
    const usersWithRoles = users.map(user => ({
      ...user,
      role: roles.find(role => role.roleId === user.roleId) || null
    }));

    console.log("Fetched users:", usersWithRoles.length);
    return NextResponse.json(usersWithRoles);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// UPDATE user
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId, username, email, roleId } = await req.json();

    const updatedUser = await prisma.users.update({
      where: { userId },
      data: {
        username,
        email,
        roleId,
      },
      include: {
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { userId } = await req.json();

    await prisma.users.delete({
      where: { userId },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
