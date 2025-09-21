import { NextResponse } from "next/server";

// WordPress API Configuration
const WORDPRESS_API_BASE = process.env.WORDPRESS_API_URL || 'https://your-wordpress-site.com/wp-json/wp/v2';
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
const WORDPRESS_PASSWORD = process.env.WORDPRESS_PASSWORD;

// Helper function to authenticate with WordPress
const getWordPressAuth = () => {
  if (WORDPRESS_USERNAME && WORDPRESS_PASSWORD) {
    const credentials = btoa(`${WORDPRESS_USERNAME}:${WORDPRESS_PASSWORD}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
};

// GET all complaints from WordPress
export async function GET() {
  try {
    // Fetch complaints from WordPress custom post type
    const response = await fetch(`${WORDPRESS_API_BASE}/complaints?_embed&per_page=100&orderby=date&order=desc`, {
      method: 'GET',
      headers: getWordPressAuth(),
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const wordpressComplaints = await response.json();

    // Transform WordPress data to match your application structure
    const complaints = wordpressComplaints.map(complaint => ({
      complaintId: complaint.id.toString(),
      contactPersonName: complaint.acf?.contact_person_name || complaint.title?.rendered || '',
      mailId: complaint.acf?.email || '',
      mobileNumber: complaint.acf?.mobile_number || '',
      companyName: complaint.acf?.company_name || '',
      territoryId: complaint.acf?.territory_id || 1,
      gearboxSerialNumber: complaint.acf?.gearbox_serial_number || '',
      dateOfCommissioning: complaint.acf?.date_of_commissioning || complaint.date,
      complaintDate: complaint.date,
      applicationDetails: complaint.content?.rendered || complaint.acf?.application_details || '',
      natureOfComplaintWithPhotos: complaint.acf?.nature_of_complaint || '',
      inputMotorDetailsKw: parseFloat(complaint.acf?.input_motor_details_kw || '0'),
      inputOutputConnectionDetails: complaint.acf?.input_output_connection_details || '',
      oilLevelDetails: complaint.acf?.oil_level_details || '',
      gradeOfOilUsed: complaint.acf?.grade_of_oil_used || '',
      conditionOfOil: complaint.acf?.condition_of_oil || '',
      conditionOfBreather: complaint.acf?.condition_of_breather || '',
      sedimentInOilBottom: complaint.acf?.sediment_in_oil_bottom || '',
      alignmentInputOutput: complaint.acf?.alignment_input_output || '',
      runningHoursPerDay: parseInt(complaint.acf?.running_hours_per_day || '0'),
      startStopPerDay: parseInt(complaint.acf?.start_stop_per_day || '0'),
      dismantledBeforeFailure: complaint.acf?.dismantled_before_failure || '',
      ambientConditions: complaint.acf?.ambient_conditions || '',
      loadSpectrum: complaint.acf?.load_spectrum || '',
      forcedLubricationPhotos: complaint.acf?.forced_lubrication_photos || '',
      conditionOfOtherParts: complaint.acf?.condition_of_other_parts || '',
      lubricationCheckDetails: complaint.acf?.lubrication_check_details || '',
      inputSpeedDetails: complaint.acf?.input_speed_details || '',
      failureHistoryDetails: complaint.acf?.failure_history_details || '',
      createdAt: complaint.date,
      updatedAt: complaint.modified,
      // Territory information (you may need to fetch this separately)
      territory: {
        territoryId: complaint.acf?.territory_id || 1,
        territoryName: complaint.acf?.territory_name || 'Unknown Territory'
      }
    }));

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints from WordPress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints from WordPress' },
      { status: 500 }
    );
  }
}

// POST new complaint to WordPress
export async function POST(req) {
  try {
    const body = await req.json();

    // Prepare data for WordPress
    const wordpressData = {
      title: `Complaint - ${body.contactPersonName} - ${body.companyName}`,
      content: body.applicationDetails || '',
      status: 'publish',
      // Custom fields using ACF (Advanced Custom Fields)
      fields: {
        contact_person_name: body.contactPersonName,
        email: body.mailId,
        mobile_number: body.mobileNumber,
        company_name: body.companyName,
        territory_id: body.territoryId,
        gearbox_serial_number: body.gearboxSerialNumber,
        date_of_commissioning: body.dateOfCommissioning,
        complaint_date: body.complaintDate || new Date().toISOString(),
        application_details: body.applicationDetails,
        nature_of_complaint: body.natureOfComplaintWithPhotos,
        input_motor_details_kw: body.inputMotorDetailsKw,
        input_output_connection_details: body.inputOutputConnectionDetails,
        oil_level_details: body.oilLevelDetails,
        grade_of_oil_used: body.gradeOfOilUsed,
        condition_of_oil: body.conditionOfOil,
        condition_of_breather: body.conditionOfBreather,
        sediment_in_oil_bottom: body.sedimentInOilBottom,
        alignment_input_output: body.alignmentInputOutput,
        running_hours_per_day: body.runningHoursPerDay,
        start_stop_per_day: body.startStopPerDay,
        dismantled_before_failure: body.dismantledBeforeFailure,
        ambient_conditions: body.ambientConditions,
        load_spectrum: body.loadSpectrum,
        forced_lubrication_photos: body.forcedLubricationPhotos,
        condition_of_other_parts: body.conditionOfOtherParts,
        lubrication_check_details: body.lubricationCheckDetails,
        input_speed_details: body.inputSpeedDetails,
        failure_history_details: body.failureHistoryDetails,
      }
    };

    // Send to WordPress
    const response = await fetch(`${WORDPRESS_API_BASE}/complaints`, {
      method: 'POST',
      headers: getWordPressAuth(),
      body: JSON.stringify(wordpressData),
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const newComplaint = await response.json();

    return NextResponse.json({
      complaintId: newComplaint.id.toString(),
      message: 'Complaint created successfully in WordPress',
      wordpressId: newComplaint.id,
      wordpressLink: newComplaint.link
    });

  } catch (error) {
    console.error('Error creating complaint in WordPress:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint in WordPress' },
      { status: 500 }
    );
  }
}
