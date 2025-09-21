import prisma from "@/lib/prisma";

export async function GET() {
  // Get all employees
  const employees = await prisma.employees.findMany();
  return Response.json(employees);
}

export async function POST(req) {
  // Create new employee
  const body = await req.json();
  const newEmployee = await prisma.employees.create({
    data: {
      fullName: body.fullName,
      email: body.email,
      status: "ACTIVE",
    //   userId: "dummy", // placeholder, adjust if using Users table
      designation: "Employee",
    },
  });
  return Response.json(newEmployee);
}

export async function PUT(req) {
  // Update employee
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
  // Delete employee
  const body = await req.json();

  if (!body.employeeId) {
    return Response.json({ error: "Employee ID is required" }, { status: 400 });
  }

  await prisma.employees.delete({
    where: { employeeId: body.employeeId },
  });

  return Response.json({ success: true });
}
