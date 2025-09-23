import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email template for complaint notification
export function createComplaintEmailTemplate(complaintData, employeeData, territoryName) {
  const {
    contactPersonName,
    mailId,
    mobileNumber,
    companyName,
    gearboxSerialNumber,
    dateOfCommissioning,
    complaintDate,
    applicationDetails,
    natureOfComplaintWithPhotos,
    inputMotorDetailsKw,
    inputOutputConnectionDetails,
    oilLevelDetails,
    gradeOfOilUsed,
    conditionOfOil,
    conditionOfBreather,
    sedimentInOilBottom,
    alignmentInputOutput,
    runningHoursPerDay,
    startStopPerDay,
    dismantledBeforeFailure,
    ambientConditions,
    loadSpectrum,
    forcedLubricationPhotos,
    conditionOfOtherParts,
    lubricationCheckDetails,
    inputSpeedDetails,
    failureHistoryDetails
  } = complaintData;

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    subject: `New Complaint Received - ${companyName} (${territoryName})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Complaint Notification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #dc2626;
            color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
          }
          .section {
            margin-bottom: 25px;
            padding: 15px;
            border-left: 4px solid #dc2626;
            background-color: #f9f9f9;
          }
          .section h3 {
            margin-top: 0;
            color: #dc2626;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 5px;
          }
          .field {
            margin-bottom: 10px;
          }
          .field-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 200px;
          }
          .field-value {
            color: #333;
          }
          .footer {
            margin-top: 30px;
            padding: 20px;
            background-color: #f0f0f0;
            border-radius: 5px;
            text-align: center;
            color: #666;
          }
          .urgent {
            background-color: #fef2f2;
            border-left-color: #dc2626;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Complaint Notification</h1>
            <p>Territory: ${territoryName}</p>
            <p>Complaint ID: ${complaintData.complaintId}</p>
          </div>

          <div class="section urgent">
            <h3>📞 Contact Information</h3>
            <div class="field">
              <span class="field-label">Contact Person:</span>
              <span class="field-value">${contactPersonName}</span>
            </div>
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${mailId}</span>
            </div>
            <div class="field">
              <span class="field-label">Mobile:</span>
              <span class="field-value">${mobileNumber}</span>
            </div>
            <div class="field">
              <span class="field-label">Company:</span>
              <span class="field-value">${companyName}</span>
            </div>
            <div class="field">
              <span class="field-label">Complaint Date:</span>
              <span class="field-value">${formatDate(complaintDate)}</span>
            </div>
          </div>

          <div class="section">
            <h3>⚙️ Gearbox Details</h3>
            <div class="field">
              <span class="field-label">Serial Number:</span>
              <span class="field-value">${gearboxSerialNumber || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Date of Commissioning:</span>
              <span class="field-value">${formatDate(dateOfCommissioning)}</span>
            </div>
            <div class="field">
              <span class="field-label">Application Details:</span>
              <span class="field-value">${applicationDetails || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Motor Details (kW):</span>
              <span class="field-value">${inputMotorDetailsKw || 'Not provided'}</span>
            </div>
          </div>

          <div class="section urgent">
            <h3>🔧 Nature of Complaint</h3>
            <div class="field">
              <span class="field-value">${natureOfComplaintWithPhotos || 'Not provided'}</span>
            </div>
          </div>

          <div class="section">
            <h3>🔌 Connection Details</h3>
            <div class="field">
              <span class="field-label">Input/Output Connection:</span>
              <span class="field-value">${inputOutputConnectionDetails || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Alignment Input/Output:</span>
              <span class="field-value">${alignmentInputOutput || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Input Speed Details:</span>
              <span class="field-value">${inputSpeedDetails || 'Not provided'}</span>
            </div>
          </div>

          <div class="section">
            <h3>🛢️ Oil & Lubrication Details</h3>
            <div class="field">
              <span class="field-label">Oil Level Details:</span>
              <span class="field-value">${oilLevelDetails || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Grade of Oil Used:</span>
              <span class="field-value">${gradeOfOilUsed || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Condition of Oil:</span>
              <span class="field-value">${conditionOfOil || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Condition of Breather:</span>
              <span class="field-value">${conditionOfBreather || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Sediment in Oil Bottom:</span>
              <span class="field-value">${sedimentInOilBottom || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Lubrication Check Details:</span>
              <span class="field-value">${lubricationCheckDetails || 'Not provided'}</span>
            </div>
          </div>

          <div class="section">
            <h3>⏰ Operational Details</h3>
            <div class="field">
              <span class="field-label">Running Hours/Day:</span>
              <span class="field-value">${runningHoursPerDay || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Start/Stop per Day:</span>
              <span class="field-value">${startStopPerDay || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Ambient Conditions:</span>
              <span class="field-value">${ambientConditions || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Load Spectrum:</span>
              <span class="field-value">${loadSpectrum || 'Not provided'}</span>
            </div>
          </div>

          <div class="section">
            <h3>🔍 Maintenance & Failure Details</h3>
            <div class="field">
              <span class="field-label">Dismantled Before Failure:</span>
              <span class="field-value">${dismantledBeforeFailure || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Condition of Other Parts:</span>
              <span class="field-value">${conditionOfOtherParts || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Failure History Details:</span>
              <span class="field-value">${failureHistoryDetails || 'Not provided'}</span>
            </div>
          </div>

          <div class="section">
            <h3>📸 Additional Information</h3>
            <div class="field">
              <span class="field-label">Forced Lubrication Photos:</span>
              <span class="field-value">${forcedLubricationPhotos || 'Not provided'}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Action Required:</strong> Please review this complaint and take appropriate action.</p>
            <p>This is an automated notification from the Shanthi Gears Complaint Management System.</p>
            <p>Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
New Complaint Notification - Territory: ${territoryName}

Contact Information:
- Contact Person: ${contactPersonName}
- Email: ${mailId}
- Mobile: ${mobileNumber}
- Company: ${companyName}
- Complaint Date: ${formatDate(complaintDate)}

Gearbox Details:
- Serial Number: ${gearboxSerialNumber || 'Not provided'}
- Date of Commissioning: ${formatDate(dateOfCommissioning)}
- Application Details: ${applicationDetails || 'Not provided'}
- Motor Details (kW): ${inputMotorDetailsKw || 'Not provided'}

Nature of Complaint:
${natureOfComplaintWithPhotos || 'Not provided'}

Connection Details:
- Input/Output Connection: ${inputOutputConnectionDetails || 'Not provided'}
- Alignment Input/Output: ${alignmentInputOutput || 'Not provided'}
- Input Speed Details: ${inputSpeedDetails || 'Not provided'}

Oil & Lubrication Details:
- Oil Level Details: ${oilLevelDetails || 'Not provided'}
- Grade of Oil Used: ${gradeOfOilUsed || 'Not provided'}
- Condition of Oil: ${conditionOfOil || 'Not provided'}
- Condition of Breather: ${conditionOfBreather || 'Not provided'}
- Sediment in Oil Bottom: ${sedimentInOilBottom || 'Not provided'}
- Lubrication Check Details: ${lubricationCheckDetails || 'Not provided'}

Operational Details:
- Running Hours/Day: ${runningHoursPerDay || 'Not provided'}
- Start/Stop per Day: ${startStopPerDay || 'Not provided'}
- Ambient Conditions: ${ambientConditions || 'Not provided'}
- Load Spectrum: ${loadSpectrum || 'Not provided'}

Maintenance & Failure Details:
- Dismantled Before Failure: ${dismantledBeforeFailure || 'Not provided'}
- Condition of Other Parts: ${conditionOfOtherParts || 'Not provided'}
- Failure History Details: ${failureHistoryDetails || 'Not provided'}

Additional Information:
- Forced Lubrication Photos: ${forcedLubricationPhotos || 'Not provided'}

Action Required: Please review this complaint and take appropriate action.

This is an automated notification from the Shanthi Gears Complaint Management System.
Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `
  };
}

// Function to send complaint notification email
export async function sendComplaintNotification(complaintData, employeeData, territoryName) {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email notification skipped.');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailTemplate = createComplaintEmailTemplate(complaintData, employeeData, territoryName);
    
    const mailOptions = {
      from: `"Shanthi Gears Complaint System" <${process.env.SMTP_USER}>`,
      to: employeeData.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Complaint notification email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      recipient: employeeData.email 
    };
  } catch (error) {
    console.error('Error sending complaint notification email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export default transporter;
