import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const employees = await prisma.employees.findMany();
  return Response.json(employees);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const newEmployee = await prisma.employees.create({
    data: {
      fullName: body.fullName,
      email: body.email,
      status: "ACTIVE",
      designation: "Employee",
    },
  });
  return Response.json(newEmployee);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.employeeId) {
    return Response.json({ error: "Employee ID is required" }, { status: 400 });
  }

  const updated = await prisma.employees.update({
    where: { employeeId: body.employeeId },
    data: {
      fullName: body.fullName,
      email: body.email,
    },
  });

  return Response.json(updated);
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (!body.employeeId) {
    return Response.json({ error: "Employee ID is required" }, { status: 400 });
  }

  await prisma.employees.delete({
    where: { employeeId: body.employeeId },
  });

  return Response.json({ success: true });
}
