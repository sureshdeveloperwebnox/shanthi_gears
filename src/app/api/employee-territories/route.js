import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all assignments
export async function GET() {
  try {
    const assignments = await prisma.employeeTerritories.findMany({
      include: {
        employee: true,
        territory: true,
      },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

// CREATE assignment
export async function POST(req) {
  try {
    const { employeeId, territoryId } = await req.json();

    // Check if employee exists and is active
    const employee = await prisma.employees.findUnique({
      where: { employeeId }
    });
    
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    
    if (employee.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: `Cannot assign territory to ${employee.status.toLowerCase()} employee: ${employee.fullName}` 
      }, { status: 400 });
    }

    // prevent duplicate assignment for same employee
    const existingAssignment = await prisma.employeeTerritories.findFirst({
      where: { employeeId, territoryId: Number(territoryId) },
    });
    if (existingAssignment) {
      return NextResponse.json({ error: "Assignment already exists" }, { status: 400 });
    }

    // Note: Multiple employees can now be assigned to the same territory
    // This restriction has been removed to support many-to-many relationships

    const newAssignment = await prisma.employeeTerritories.create({
      data: {
        employeeId,
        territoryId: Number(territoryId),
        assignedAt: new Date(), // Add the required assignedAt field
      },
      include: {
        employee: true,
        territory: true,
      },
    });

    return NextResponse.json(newAssignment);
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE assignment
export async function PUT(req) {
  try {
    const { id, employeeId, territoryId } = await req.json();

    // Check if employee exists and is active
    const employee = await prisma.employees.findUnique({
      where: { employeeId }
    });
    
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    
    if (employee.status !== 'ACTIVE') {
      return NextResponse.json({ 
        error: `Cannot assign territory to ${employee.status.toLowerCase()} employee: ${employee.fullName}` 
      }, { status: 400 });
    }

    const updatedAssignment = await prisma.employeeTerritories.update({
      where: { id },
      data: {
        employeeId,
        territoryId: Number(territoryId),
      },
      include: {
        employee: true,
        territory: true,
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
  }
}

// DELETE assignment
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    await prisma.employeeTerritories.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Assignment deleted" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
