import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // replace '*' with your WordPress domain if needed
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET all territories
export async function GET() {
  try {
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL not set, returning mock territories...');
      const mockTerritories = [
        { territoryId: 1, territoryName: "North Zone", createdAt: "2024-01-01T00:00:00.000Z" },
        { territoryId: 2, territoryName: "South Zone", createdAt: "2024-01-01T00:00:00.000Z" },
        { territoryId: 3, territoryName: "East Zone", createdAt: "2024-01-01T00:00:00.000Z" },
        { territoryId: 4, territoryName: "West Zone", createdAt: "2024-01-01T00:00:00.000Z" },
        { territoryId: 5, territoryName: "Central Zone", createdAt: "2024-01-01T00:00:00.000Z" }
      ];
      return NextResponse.json(mockTerritories, { headers: corsHeaders });
    }
    
    const territories = await prisma.territories.findMany();
    return NextResponse.json(territories, { headers: corsHeaders });
  } catch (err) {
    console.error('Error fetching territories:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// POST new territory
export async function POST(req) {
  try {
    const body = await req.json();
    const newTerritory = await prisma.territories.create({
      data: { territoryName: body.territoryName },
    });
    return NextResponse.json(newTerritory, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT update territory
export async function PUT(req) {
  try {
    const body = await req.json();
    if (!body.territoryId)
      return NextResponse.json({ error: "Territory ID required" }, { status: 400, headers: corsHeaders });

    const updated = await prisma.territories.update({
      where: { territoryId: body.territoryId },
      data: { territoryName: body.territoryName },
    });
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE territory
export async function DELETE(req) {
  try {
    const body = await req.json();
    if (!body.territoryId)
      return NextResponse.json({ error: "Territory ID required" }, { status: 400, headers: corsHeaders });

    await prisma.territories.delete({ where: { territoryId: body.territoryId } });
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
