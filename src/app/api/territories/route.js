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

// GET all territories (with optional country filter)
export async function GET(req) {
  try {
    console.log('Fetching territories from database...');
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get('countryId');
    
    // Build where clause
    const whereClause = countryId ? { countryId: parseInt(countryId) } : {};
    
    const territories = await prisma.territories.findMany({
      where: whereClause,
      include: {
        country: true
      },
      orderBy: {
        territoryName: 'asc'
      }
    });
    
    console.log(`Found ${territories.length} territories${countryId ? ` for country ${countryId}` : ''}`);
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
    
    // Validate required fields
    if (!body.territoryName) {
      return NextResponse.json(
        { error: "Territory name is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.countryId) {
      return NextResponse.json(
        { error: "Country ID is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const newTerritory = await prisma.territories.create({
      data: { 
        territoryName: body.territoryName,
        countryId: parseInt(body.countryId),
        status: body.status || 'ACTIVE'
      },
      include: {
        country: true
      }
    });
    
    console.log(`Created new territory: ${newTerritory.territoryName} in ${newTerritory.country.countryName}`);
    return NextResponse.json(newTerritory, { headers: corsHeaders });
  } catch (err) {
    console.error('Error creating territory:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT update territory
export async function PUT(req) {
  try {
    const body = await req.json();
    
    if (!body.territoryId) {
      return NextResponse.json(
        { error: "Territory ID is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.territoryName) {
      return NextResponse.json(
        { error: "Territory name is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const updateData = {
      territoryName: body.territoryName
    };

    // Include countryId if provided
    if (body.countryId) {
      updateData.countryId = parseInt(body.countryId);
    }

    const updated = await prisma.territories.update({
      where: { territoryId: body.territoryId },
      data: updateData,
      include: {
        country: true
      }
    });
    
    console.log(`Updated territory: ${updated.territoryName}`);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    console.error('Error updating territory:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// ADDED FOR DEACTIVATE FUNCTIONALITY - START
// PATCH territory status (toggle active/inactive)
export async function PATCH(req) {
  try {
    const body = await req.json();
    if (!body.territoryId)
      return NextResponse.json({ error: "Territory ID required" }, { status: 400, headers: corsHeaders });

    // Get current territory status
    const territory = await prisma.territories.findUnique({
      where: { territoryId: body.territoryId }
    });

    if (!territory) {
      return NextResponse.json({ error: "Territory not found" }, { status: 404, headers: corsHeaders });
    }

    // Toggle status
    const newStatus = territory.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    const updated = await prisma.territories.update({
      where: { territoryId: body.territoryId },
      data: { status: newStatus },
    });
    
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
// ADDED FOR DEACTIVATE FUNCTIONALITY - END

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
