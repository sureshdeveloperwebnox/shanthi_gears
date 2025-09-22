import prisma from "@/lib/prisma";

export async function GET(req) {
  // Get employees - can filter by status using query params
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get('activeOnly') === 'true';
  
  const whereClause = activeOnly ? { status: 'ACTIVE' } : {};
  
  const employees = await prisma.employees.findMany({
    where: whereClause,
    orderBy: { fullName: 'asc' }
  });
  
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

  // Prepare update data - only include fields that are provided
  const updateData = {};
  if (body.fullName !== undefined) updateData.fullName = body.fullName;
  if (body.email !== undefined) updateData.email = body.email;
  if (body.status !== undefined) {
    // Validate status value
    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(body.status)) {
      return Response.json({ error: "Invalid status. Must be ACTIVE, INACTIVE, or SUSPENDED" }, { status: 400 });
    }
    updateData.status = body.status;
  }
  if (body.designation !== undefined) updateData.designation = body.designation;

  const updated = await prisma.employees.update({
    where: { employeeId: body.employeeId },
    data: updateData,
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
