import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendComplaintNotification, sendUserThankYouEmail, sendManagerApprovalEmail, sendEmployeeAssignmentEmail } from "@/lib/email";
import { generateComplaintId } from "@/lib/complaintIdGenerator";

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
    
    // Fetch complaints from local database with territory and country information
    const complaints = await prisma.complaints.findMany({
      include: {
        territory: true,
        country: true
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
      countryId: complaint.countryId,
      country: {
        countryId: complaint.country.countryId,
        countryName: complaint.country.countryName
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
      
      // Territory and Country (assuming they come as names, we'll need to find the IDs)
      territoryName: body.territory_name || body.territoryName || '',
      territoryId: body.territory_id || body.territoryId || null,
      countryName: body.country_name || body.countryName || '',
      countryId: body.country_id || body.countryId || null,
      
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

    // Find country ID if country name is provided
    let finalCountryId = mappedData.countryId;
    if (!finalCountryId && mappedData.countryName) {
      const country = await prisma.country.findFirst({
        where: {
          countryName: {
            contains: mappedData.countryName
          }
        }
      });
      finalCountryId = country?.countryId;
    }

    // Find territory ID if territory name is provided
    let finalTerritoryId = mappedData.territoryId;
    if (!finalTerritoryId && mappedData.territoryName) {
      const territoryWhere = {
        territoryName: {
          contains: mappedData.territoryName
        }
      };
      
      // If we have a country ID, filter by country as well
      if (finalCountryId) {
        territoryWhere.countryId = finalCountryId;
      }
      
      const territory = await prisma.territories.findFirst({
        where: territoryWhere
      });
      finalTerritoryId = territory?.territoryId;
    }

    // Use the first territory if none found
    if (!finalTerritoryId) {
      const firstTerritory = await prisma.territories.findFirst();
      finalTerritoryId = firstTerritory?.territoryId;
      finalCountryId = firstTerritory?.countryId;
    }

    if (!finalTerritoryId) {
      return NextResponse.json(
        { error: 'No territory found. Please ensure territories exist in the database.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!finalCountryId) {
      return NextResponse.json(
        { error: 'No country found. Please ensure countries exist in the database.' },
        { status: 400, headers: corsHeaders }
      );
    }





    // Generate custom complaint ID
    const customComplaintId = await generateComplaintId();

    // Create new complaint in database
    const newComplaint = await prisma.complaints.create({
      data: {
        complaintId: customComplaintId,
        contactPersonName: mappedData.contactPersonName,
        mailId: mappedData.mailId,
        mobileNumber: mappedData.mobileNumber,
        companyName: mappedData.companyName,
        territoryId: parseInt(finalTerritoryId),
        countryId: parseInt(finalCountryId),
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

    console.log('🔥🔥🔥🔥🔥Created new complaint:', newComplaint.complaintId);

    // Send emails: thank you to user, notification to all employees, and manager approval email
    let userEmailResult = null;
    let employeeEmailResults = [];
    let managerEmailResult = null;
    
    try {
      // Get territory name for emails
      const territory = await prisma.territories.findUnique({
        where: { territoryId: parseInt(finalTerritoryId) }
      });
      const territoryName = territory?.territoryName || 'Unknown Territory';

      // Send thank you email to the user who submitted the complaint
      console.log(`Sending thank you email to user: ${mappedData.contactPersonName} (${mappedData.mailId})`);
      userEmailResult = await sendUserThankYouEmail(newComplaint, territoryName);
      
      if (userEmailResult.success) {
        console.log('User thank you email sent successfully:', userEmailResult.messageId);
      } else {
        console.warn('Failed to send user thank you email:', userEmailResult.error);
      }

      // Find all employees assigned to this territory
      const employeeAssignments = await prisma.employeeTerritories.findMany({
        where: { 
          territoryId: parseInt(finalTerritoryId),
          employee: {
            status: 'ACTIVE'
          }
        },
        include: {
          employee: true
        }
      });
      console.log('Employee assignments:', employeeAssignments);
      

      if (employeeAssignments && employeeAssignments.length > 0) {
        const employees = employeeAssignments.map(assignment => assignment.employee);
        const employeeNames = employees.map(emp => `${emp.fullName} (${emp.email})`).join(', ');
        console.log(`Sending notification emails to all employees: ${employeeNames}`);
        
        // Send notification email to all employees immediately
        const employeeNotificationResult = await sendComplaintNotification(
          newComplaint, 
          employees, 
          territoryName
        );
        
        if (employeeNotificationResult.success) {
          console.log(`✅ SUCCESS: Notification emails sent to ALL ${employees.length} employees`);
          console.log('Employee Message IDs:', employeeNotificationResult.employeeMessageIds);
          employeeEmailResults = employeeNotificationResult.employeeMessageIds || [];
        } else {
          console.warn('Failed to send employee notification emails:', employeeNotificationResult.error);
        }
        
        // Send manager approval email
        const managerEmail = process.env.COMPLAINT_CC_EMAIL || 'swethabellan@gmail.com';
        console.log(`Sending manager approval email to: ${managerEmail}`);
        
        managerEmailResult = await sendManagerApprovalEmail(
          newComplaint, 
          employees, 
          territoryName,
          managerEmail
        );
        if (managerEmailResult.success) {
          console.log(`✅ SUCCESS: Manager approval email sent to ${managerEmail}`);
          console.log('Manager Message ID:', managerEmailResult.messageId);
        } else {
          console.warn('Failed to send manager approval email:', managerEmailResult.error);
        }
      } else {
        console.warn(`No active employees found for territory ID: ${finalTerritoryId}`);
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the complaint creation if email fails
    }

    return NextResponse.json({
      success: true,
      complaintId: newComplaint.complaintId,
      message: 'Complaint created successfully',
      data: newComplaint,
      emails: {
        userThankYou: userEmailResult ? {
          sent: userEmailResult.success,
          recipient: userEmailResult.recipient || null,
          error: userEmailResult.error || null
        } : null,
        employeeNotifications: employeeEmailResults.length > 0 ? {
          sent: true,
          count: employeeEmailResults.length,
          messageIds: employeeEmailResults
        } : null,
        managerApproval: managerEmailResult ? {
          sent: managerEmailResult.success,
          recipient: managerEmailResult.recipient || null,
          error: managerEmailResult.error || null
        } : null
      }
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