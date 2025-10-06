import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET all countries
export async function GET() {
  try {
    console.log('Fetching countries from database...');
    
    const countries = await prisma.country.findMany({
      orderBy: {
        countryName: 'asc'
      }
    });
    
    console.log(`Found ${countries.length} countries`);
    return NextResponse.json(countries, { headers: corsHeaders });
  } catch (err) {
    console.error('Error fetching countries:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// POST new country
export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.countryName) {
      return NextResponse.json(
        { error: "Country name is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const newCountry = await prisma.country.create({
      data: {
        countryName: body.countryName
      }
    });
    
    console.log(`Created new country: ${newCountry.countryName}`);
    return NextResponse.json(newCountry, { headers: corsHeaders });
  } catch (err) {
    console.error('Error creating country:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// PUT update country
export async function PUT(req) {
  try {
    const body = await req.json();
    
    if (!body.countryId) {
      return NextResponse.json(
        { error: "Country ID is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    if (!body.countryName) {
      return NextResponse.json(
        { error: "Country name is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await prisma.country.update({
      where: { countryId: body.countryId },
      data: { countryName: body.countryName },
    });
    
    console.log(`Updated country: ${updated.countryName}`);
    return NextResponse.json(updated, { headers: corsHeaders });
  } catch (err) {
    console.error('Error updating country:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

// DELETE country
export async function DELETE(req) {
  try {
    const body = await req.json();
    
    if (!body.countryId) {
      return NextResponse.json(
        { error: "Country ID is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if country has territories
    const territoriesCount = await prisma.territories.count({
      where: { countryId: body.countryId }
    });

    if (territoriesCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete country. It has ${territoriesCount} territories assigned. Please reassign or delete territories first.` }, 
        { status: 400, headers: corsHeaders }
      );
    }

    await prisma.country.delete({ 
      where: { countryId: body.countryId } 
    });
    
    console.log(`Deleted country with ID: ${body.countryId}`);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('Error deleting country:', err);
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
