import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendComplaintNotification, sendUserThankYouEmail } from "@/lib/email";


import { generateComplaintId } from "@/lib/complaintIdGenerator";

// CORS headers function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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
      // Parse complaint text and photos from the combined field
      natureOfComplaintWithPhotos: parseComplaintTextAndPhotos(complaint.natureOfComplaintWithPhotos).text,
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
      // Preserve original text field (may be a plain text or JSON string)
      forcedLubricationPhotos: complaint.forcedLubricationPhotos,
      conditionOfOtherParts: complaint.conditionOfOtherParts,
      lubricationCheckDetails: complaint.lubricationCheckDetails,
      inputSpeedDetails: complaint.inputSpeedDetails,
      failureHistoryDetails: complaint.failureHistoryDetails,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      // New normalized arrays for UI: parse complaint photos from the combined field
      complaintPhotos: parseComplaintTextAndPhotos(complaint.natureOfComplaintWithPhotos).photos,
      forcedLubricationPhotoUrls: safeParseArray(complaint.forcedLubricationPhotos)
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
      // Store complaint text and photos together
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
      // Accept array for forced lubrication photos
      forcedLubricationPhotos: Array.isArray(body.forced_lubrication_photos)
        ? JSON.stringify(body.forced_lubrication_photos)
        : (body.forced_lubrication_photos || body.forcedLubricationPhotos || ''),
      conditionOfOtherParts: body.condition_of_other_parts || body.conditionOfOtherParts || '',
      lubricationCheckDetails: body.lubrication_check_details || body.lubricationCheckDetails || '',
      inputSpeedDetails: body.input_speed_details || body.inputSpeedDetails || '',
      failureHistoryDetails: body.failure_history_details || body.failureHistoryDetails || ''
    };

    console.log('Mapped data:', mappedData);

    // Validate required fields
    if (!mappedData.contactPersonName || !mappedData.mailId || !mappedData.companyName) {
      console.log('Validation failed: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: contact_person_name, email, company_name' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Debug: Check what territories exist in the database
    console.log('🔍 Checking existing territories...');
    const allTerritories = await prisma.territories.findMany({
      include: {
        country: true
      }
    });
    console.log('All territories in database:', allTerritories.map(t => ({ 
      territoryId: t.territoryId, 
      territoryName: t.territoryName, 
      countryId: t.countryId, 
      countryName: t.country?.countryName 
    })));

    // Debug: Check what countries exist in the database
    console.log('🔍 Checking existing countries...');
    const allCountries = await prisma.country.findMany();
    console.log('All countries in database:', allCountries.map(c => ({ id: c.countryId, name: c.countryName })));

    // Find country ID if country name is provided
    let finalCountryId = mappedData.countryId;
    if (!finalCountryId && mappedData.countryName) {
      console.log(`Looking for country by name: ${mappedData.countryName}`);
      const country = await prisma.country.findFirst({
        where: {
          countryName: {
            contains: mappedData.countryName
          }
        }
      });
      finalCountryId = country?.countryId;
      console.log('Found country:', country);
    }

    // If we have a territory ID from the request, verify it exists
    let finalTerritoryId = mappedData.territoryId;
    if (mappedData.territoryId) {
      console.log(`Verifying territory ID ${mappedData.territoryId} exists...`);
      const territory = await prisma.territories.findUnique({
        where: { territoryId: parseInt(mappedData.territoryId) }
      });
      if (territory) {
        finalTerritoryId = territory.territoryId;
        // Only use territory's country if no country was provided in the form
        if (!finalCountryId) {
          finalCountryId = territory.countryId;
        }
        console.log('Verified territory exists:', territory);
      } else {
        console.log(`Territory with ID ${mappedData.territoryId} not found`);
        finalTerritoryId = null;
      }
    }

    // Find territory ID if territory name is provided (only if no territory ID was provided)
    if (!finalTerritoryId && mappedData.territoryName) {
      console.log(`Looking for territory by name: ${mappedData.territoryName}`);
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
      console.log('Found territory:', territory);
    }

    // If we have a country ID but no territory, find a territory for that country
    if (finalCountryId && !finalTerritoryId) {
      console.log(`🔍 Looking for territory in country ID ${finalCountryId}...`);
      
      // First, verify the country exists
      const countryExists = await prisma.country.findUnique({
        where: { countryId: finalCountryId }
      });
      console.log(`Country ID ${finalCountryId} exists:`, countryExists);
      
      if (countryExists) {
        const territory = await prisma.territories.findFirst({
          where: { countryId: finalCountryId }
        });
        console.log(`Territories found for country ${finalCountryId}:`, territory);
        
        if (territory) {
          finalTerritoryId = territory.territoryId;
          console.log('✅ Found territory for country:', territory);
        } else {
          console.log(`ℹ️ No territories found for country ID ${finalCountryId} - this is expected for non-India countries`);
          // For non-India countries, we need to create a default territory or use an existing one
          // Let's create a default territory for this country if it doesn't exist
          try {
            const defaultTerritory = await prisma.territories.create({
              data: {
                territoryName: `Default Territory - ${countryExists.countryName}`,
                countryId: finalCountryId,
                status: 'ACTIVE'
              }
            });
            finalTerritoryId = defaultTerritory.territoryId;
            console.log(`✅ Created default territory for country ${finalCountryId}:`, defaultTerritory);
          } catch (error) {
            console.log(`❌ Failed to create default territory for country ${finalCountryId}:`, error.message);
            // Fallback to first available territory
            const firstTerritory = await prisma.territories.findFirst();
            if (firstTerritory) {
              finalTerritoryId = firstTerritory.territoryId;
              console.log(`Using fallback territory:`, firstTerritory);
            }
          }
        }
      } else {
        console.log(`❌ Country ID ${finalCountryId} does not exist in database`);
      }
    }

    // Use the first territory if none found (fallback)
    if (!finalTerritoryId) {
      console.log('No territory found, using first available territory...');
      const firstTerritory = await prisma.territories.findFirst();
      if (firstTerritory) {
        finalTerritoryId = firstTerritory.territoryId;
        // Only use territory's country if no country was provided in the form
        if (!finalCountryId) {
          finalCountryId = firstTerritory.countryId;
        }
        console.log('Using first territory:', firstTerritory);
      }
    }

    console.log('🔍 Territory/Country Resolution:');
    console.log('- Input country_id:', mappedData.countryId);
    console.log('- Input territory_id:', mappedData.territoryId);
    console.log('- Final territory ID:', finalTerritoryId);
    console.log('- Final country ID:', finalCountryId);

    if (!finalTerritoryId) {
      console.log('ERROR: No territory found');
      return NextResponse.json(
        { error: 'No territory found. Please ensure territories exist in the database.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!finalCountryId) {
      console.log('ERROR: No country found');
      return NextResponse.json(
        { error: 'No country found. Please ensure countries exist in the database.' },
        { status: 400, headers: corsHeaders }
      );
    }





    // Generate custom complaint ID
    const customComplaintId = await generateComplaintId();
    console.log('Generated complaint ID:', customComplaintId);

    // Prepare data for database insertion
    const complaintData = {
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
      // Store complaint text and photos together - if photos exist, combine them with text
      natureOfComplaintWithPhotos: Array.isArray(body.complaint_photos) && body.complaint_photos.length > 0
        ? `${mappedData.natureOfComplaintWithPhotos}\n\nPhotos: ${JSON.stringify(body.complaint_photos)}`
        : mappedData.natureOfComplaintWithPhotos,
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
    };

    console.log('Prepared complaint data for database:', complaintData);

    // Create new complaint in database
    const newComplaint = await prisma.complaints.create({
      data: complaintData
    });

    console.log('🔥🔥🔥🔥🔥Created new complaint:', newComplaint.complaintId);

    // Send emails: thank you to user and notification to manager with employees in CC
    let userEmailResult = null;
    let employeeNotificationResult = null;
    
    try {
      // Get territory and country names for emails
      const territory = await prisma.territories.findUnique({
        where: { territoryId: parseInt(finalTerritoryId) },
        include: {
          country: true
        }
      });
      const territoryName = territory?.territoryName || 'Unknown Territory';
      const countryName = territory?.country?.countryName || 'Unknown Country';
      
      console.log('Territory lookup result:', {
        territoryId: finalTerritoryId,
        territoryName,
        countryName,
        territory: territory
      });

      // Send thank you email to the user who submitted the complaint
      console.log(`Sending thank you email to user: ${mappedData.contactPersonName} (${mappedData.mailId})`);
      userEmailResult = await sendUserThankYouEmail(newComplaint, territoryName, countryName);
      
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
      

      // Check if this is an India territory or other country
      const isIndiaTerritory = countryName && countryName.toLowerCase() === 'india';
      
      if (employeeAssignments && employeeAssignments.length > 0) {
        const employees = employeeAssignments.map(assignment => assignment.employee);
        const employeeNames = employees.map(emp => `${emp.fullName} (${emp.email})`).join(', ');
        console.log(`Sending notification email to manager with employees in CC: ${employeeNames}`);
        console.log('Manager email from env:', process.env.COMPLAINT_CC_EMAIL);
        
        // Send notification email to manager with employees in CC
        employeeNotificationResult = await sendComplaintNotification(
          newComplaint, 
          employees, 
          territoryName,
          countryName
        );
        
        if (employeeNotificationResult.success) {
          console.log(`✅ SUCCESS: Notification email sent to manager with ${employees.length} employees in CC`);
          console.log('Manager Message ID:', employeeNotificationResult.messageId);
          console.log('CC Recipients:', employeeNotificationResult.ccRecipients);
        } else {
          console.warn('Failed to send employee notification email:', employeeNotificationResult.error);
        }
      } else if (!isIndiaTerritory) {
        // For non-India countries, send notification even if no employees are assigned
        console.log(`No employees found for territory ${territoryName}, but sending notification for other country: ${countryName}`);
        
        // Send notification email using other country email configuration
        employeeNotificationResult = await sendComplaintNotification(
          newComplaint, 
          [], // Empty employees array for other countries
          territoryName,
          countryName
        );
        
        if (employeeNotificationResult.success) {
          console.log(`✅ SUCCESS: Notification email sent for other country: ${countryName}`);
          console.log('Manager Message ID:', employeeNotificationResult.messageId);
          console.log('CC Recipients:', employeeNotificationResult.ccRecipients);
        } else {
          console.warn('Failed to send other country notification email:', employeeNotificationResult.error);
        }
      } else {
        console.warn(`No active employees found for India territory ID: ${finalTerritoryId}`);
        console.log('Available territories with employees:');
        const allAssignments = await prisma.employeeTerritories.findMany({
          where: {
            employee: {
              status: 'ACTIVE'
            }
          },
          include: {
            employee: true,
            territory: true
          }
        });
        console.log('All active assignments:', allAssignments.map(a => ({
          territory: a.territory.territoryName,
          employee: a.employee.fullName,
          territoryId: a.territoryId
        })));
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
        managerNotification: employeeNotificationResult ? {
          sent: employeeNotificationResult.success,
          recipient: employeeNotificationResult.recipient || null,
          ccCount: employeeNotificationResult.ccCount || 0,
          ccRecipients: employeeNotificationResult.ccRecipients || [],
          error: employeeNotificationResult.error || null
        } : null
      }
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error creating complaint in database:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create complaint', 
        details: error.message,
        code: error.code,
        meta: error.meta
      }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

// Helper to safely parse JSON array stored in text fields
function safeParseArray(value) {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Helper to parse complaint text and photos from combined field
function parseComplaintTextAndPhotos(value) {
  if (!value || typeof value !== 'string') {
    return { text: '', photos: [] };
  }
  
  // Check if the field contains photos (look for "Photos: [" pattern)
  const photosMatch = value.match(/Photos:\s*(\[.*\])$/s);
  if (photosMatch) {
    const text = value.replace(/\n\nPhotos:\s*\[.*\]$/s, '').trim();
    const photosJson = photosMatch[1];
    try {
      const photos = JSON.parse(photosJson);
      return {
        text: text || '',
        photos: Array.isArray(photos) ? photos : []
      };
    } catch {
      return { text: value, photos: [] };
    }
  }
  
  // No photos found, return as text only
  return { text: value, photos: [] };
}