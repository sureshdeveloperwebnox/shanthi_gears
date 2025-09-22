import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// CORS headers function
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://wordpress-1401173-5868949.cloudwaysapps.com',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle preflight request
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

// GET all complaints
export async function GET(req) {
  try {
    console.log('GET /api/complaints - Fetching complaints from database...');
    
    // Fetch complaints from local database with territory information
    const complaints = await prisma.complaints.findMany({
      include: {
        territory: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${complaints.length} complaints in database`);

    // Transform database data to match frontend expectations
    const transformedComplaints = complaints.map(complaint => ({
      complaintId: complaint.complaintId,
      contactPersonName: complaint.contactPersonName,
      mailId: complaint.mailId,
      mobileNumber: complaint.mobileNumber,
      companyName: complaint.companyName,
      territoryId: complaint.territoryId,
      territory: {
        territoryName: complaint.territory.territoryName
      },
      gearboxSerialNumber: complaint.gearboxSerialNumber,
      dateOfCommissioning: complaint.dateOfCommissioning,
      complaintDate: complaint.complaintDate,
      applicationDetails: complaint.applicationDetails,
      natureOfComplaintWithPhotos: complaint.natureOfComplaintWithPhotos,
      inputMotorDetailsKw: complaint.inputMotorDetailsKw,
      inputOutputConnectionDetails: complaint.inputOutputConnectionDetails,
      oilLevelDetails: complaint.oilLevelDetails,
      gradeOfOilUsed: complaint.gradeOfOilUsed,
      conditionOfOil: complaint.conditionOfOil,
      conditionOfBreather: complaint.conditionOfBreather,
      sedimentInOilBottom: complaint.sedimentInOilBottom,
      alignmentInputOutput: complaint.alignmentInputOutput,
      runningHoursPerDay: complaint.runningHoursPerDay,
      startStopPerDay: complaint.startStopPerDay,
      dismantledBeforeFailure: complaint.dismantledBeforeFailure,
      ambientConditions: complaint.ambientConditions,
      loadSpectrum: complaint.loadSpectrum,
      forcedLubricationPhotos: complaint.forcedLubricationPhotos,
      conditionOfOtherParts: complaint.conditionOfOtherParts,
      lubricationCheckDetails: complaint.lubricationCheckDetails,
      inputSpeedDetails: complaint.inputSpeedDetails,
      failureHistoryDetails: complaint.failureHistoryDetails,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    }));

    console.log(`Returning ${transformedComplaints.length} transformed complaints`);
    return NextResponse.json(transformedComplaints, { headers: corsHeaders });
  } catch (err) {
    console.error('Error fetching complaints from database:', err);
    return NextResponse.json(
      { error: 'Failed to fetch complaints', details: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST new complaint - receives data from WordPress form
export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received complaint data from WordPress:', body);

    // Map WordPress form field names to database field names
    const mappedData = {
      // Basic contact information
      contactPersonName: body.contact_person_name || body.contactPersonName || '',
      mailId: body.email || body.mailId || body.mail_id || '',
      mobileNumber: body.mobile_number || body.mobileNumber || '',
      companyName: body.company_name || body.companyName || '',
      
      // Territory (assuming it comes as territory name, we'll need to find the ID)
      territoryName: body.territory_name || body.territoryName || '',
      territoryId: body.territory_id || body.territoryId || null,
      
      // Gearbox details
      gearboxSerialNumber: body.gearbox_serial_number || body.gearboxSerialNumber || '',
      dateOfCommissioning: body.date_of_commissioning || body.dateOfCommissioning || null,
      complaintDate: body.complaint_date || body.complaintDate || new Date(),
      
      // Application and complaint details
      applicationDetails: body.application_details || body.applicationDetails || '',
      natureOfComplaintWithPhotos: body.nature_of_complaint || body.natureOfComplaintWithPhotos || '',
      
      // Motor and connection details
      inputMotorDetailsKw: body.input_motor_details_kw || body.inputMotorDetailsKw || 0,
      inputOutputConnectionDetails: body.input_output_connection_details || body.inputOutputConnectionDetails || '',
      
      // Oil and lubrication details
      oilLevelDetails: body.oil_level_details || body.oilLevelDetails || '',
      gradeOfOilUsed: body.grade_of_oil_used || body.gradeOfOilUsed || '',
      conditionOfOil: body.condition_of_oil || body.conditionOfOil || '',
      conditionOfBreather: body.condition_of_breather || body.conditionOfBreather || '',
      sedimentInOilBottom: body.sediment_in_oil_bottom || body.sedimentInOilBottom || '',
      
      // Alignment and operational details
      alignmentInputOutput: body.alignment_input_output || body.alignmentInputOutput || '',
      runningHoursPerDay: body.running_hours_per_day || body.runningHoursPerDay || 0,
      startStopPerDay: body.start_stop_per_day || body.startStopPerDay || 0,
      
      // Failure and maintenance details
      dismantledBeforeFailure: body.dismantled_before_failure || body.dismantledBeforeFailure || '',
      ambientConditions: body.ambient_conditions || body.ambientConditions || '',
      loadSpectrum: body.load_spectrum || body.loadSpectrum || '',
      forcedLubricationPhotos: body.forced_lubrication_photos || body.forcedLubricationPhotos || '',
      conditionOfOtherParts: body.condition_of_other_parts || body.conditionOfOtherParts || '',
      lubricationCheckDetails: body.lubrication_check_details || body.lubricationCheckDetails || '',
      inputSpeedDetails: body.input_speed_details || body.inputSpeedDetails || '',
      failureHistoryDetails: body.failure_history_details || body.failureHistoryDetails || ''
    };

    // Validate required fields
    if (!mappedData.contactPersonName || !mappedData.mailId || !mappedData.companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: contact_person_name, email, company_name' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find territory ID if territory name is provided
    let finalTerritoryId = mappedData.territoryId;
    if (!finalTerritoryId && mappedData.territoryName) {
      const territory = await prisma.territories.findFirst({
        where: {
          territoryName: {
            contains: mappedData.territoryName,
            mode: 'insensitive'
          }
        }
      });
      finalTerritoryId = territory?.territoryId;
    }

    // Use the first territory if none found
    if (!finalTerritoryId) {
      const firstTerritory = await prisma.territories.findFirst();
      finalTerritoryId = firstTerritory?.territoryId;
    }

    if (!finalTerritoryId) {
      return NextResponse.json(
        { error: 'No territory found. Please ensure territories exist in the database.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create new complaint in database
    const newComplaint = await prisma.complaints.create({
      data: {
        contactPersonName: mappedData.contactPersonName,
        mailId: mappedData.mailId,
        mobileNumber: mappedData.mobileNumber,
        companyName: mappedData.companyName,
        territoryId: parseInt(finalTerritoryId),
        gearboxSerialNumber: mappedData.gearboxSerialNumber,
        dateOfCommissioning: mappedData.dateOfCommissioning ? new Date(mappedData.dateOfCommissioning) : new Date(),
        complaintDate: mappedData.complaintDate ? new Date(mappedData.complaintDate) : new Date(),
        applicationDetails: mappedData.applicationDetails,
        natureOfComplaintWithPhotos: mappedData.natureOfComplaintWithPhotos,
        inputMotorDetailsKw: parseFloat(mappedData.inputMotorDetailsKw) || 0,
        inputOutputConnectionDetails: mappedData.inputOutputConnectionDetails,
        oilLevelDetails: mappedData.oilLevelDetails,
        gradeOfOilUsed: mappedData.gradeOfOilUsed,
        conditionOfOil: mappedData.conditionOfOil,
        conditionOfBreather: mappedData.conditionOfBreather,
        sedimentInOilBottom: mappedData.sedimentInOilBottom,
        alignmentInputOutput: mappedData.alignmentInputOutput,
        runningHoursPerDay: parseInt(mappedData.runningHoursPerDay) || 0,
        startStopPerDay: parseInt(mappedData.startStopPerDay) || 0,
        dismantledBeforeFailure: mappedData.dismantledBeforeFailure,
        ambientConditions: mappedData.ambientConditions,
        loadSpectrum: mappedData.loadSpectrum,
        forcedLubricationPhotos: mappedData.forcedLubricationPhotos,
        conditionOfOtherParts: mappedData.conditionOfOtherParts,
        lubricationCheckDetails: mappedData.lubricationCheckDetails,
        inputSpeedDetails: mappedData.inputSpeedDetails,
        failureHistoryDetails: mappedData.failureHistoryDetails
      }
    });

    console.log('Created new complaint:', newComplaint.complaintId);

    return NextResponse.json({
      success: true,
      complaintId: newComplaint.complaintId,
      message: 'Complaint created successfully',
      data: newComplaint
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error creating complaint in database:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create complaint', 
        details: error.message 
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
}