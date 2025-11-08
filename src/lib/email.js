import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

// Load environment variables
dotenv.config();


// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email template for complaint notification - Full details for employees and manager
export function createComplaintEmailTemplate(complaintData, employeeData, territoryName, countryName) {
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
    subject: `New Complaint - ${companyName} (${territoryName}, ${countryName})`,
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
            max-width: 600px;
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
          .complaint-details {
            background-color: #fef2f2;
            border: 2px solid #dc2626;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .field {
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          .field-label {
            font-weight: bold;
            color: #dc2626;
            display: block;
            margin-bottom: 5px;
          }
          .field-value {
            color: #333;
            font-size: 16px;
          }
          .complaint-description {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            padding: 20px;
            background-color: #f0f0f0;
            border-radius: 5px;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Complaint Received</h1>
            <p>Territory: ${territoryName}, ${countryName}</p>
            <p>Complaint ID: ${complaintData.complaintId}</p>
          </div>

          <div class="complaint-details">
            <h2>📋 Customer Information</h2>
            
            <div class="field">
              <span class="field-label">Contact Person:</span>
              <div class="field-value">${contactPersonName}</div>
            </div>

            <div class="field">
              <span class="field-label">Company:</span>
              <div class="field-value">${companyName}</div>
            </div>

            <div class="field">
              <span class="field-label">Email:</span>
              <div class="field-value">${mailId}</div>
            </div>

            <div class="field">
              <span class="field-label">Mobile:</span>
              <div class="field-value">${mobileNumber || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Territory:</span>
              <div class="field-value">${territoryName}, ${countryName}</div>
            </div>
          </div>

          <div class="complaint-details">
            <h2>⚙️ Gearbox Information</h2>
            
            <div class="field">
              <span class="field-label">Serial Number:</span>
              <div class="field-value">${gearboxSerialNumber || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Date of Commissioning:</span>
              <div class="field-value">${formatDate(dateOfCommissioning)}</div>
            </div>

            <div class="field">
              <span class="field-label">Complaint Date:</span>
              <div class="field-value">${formatDate(complaintDate)}</div>
            </div>

            <div class="field">
              <span class="field-label">Application Details:</span>
              <div class="field-value">${applicationDetails || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Motor Details (kW):</span>
              <div class="field-value">${inputMotorDetailsKw || 'Not provided'}</div>
            </div>
          </div>

          <div class="complaint-details">
            <h2>🔧 Complaint Details</h2>
            
            <div class="field">
              <span class="field-label">Nature of Complaint:</span>
              <div class="complaint-description">
                ${natureOfComplaintWithPhotos || 'No details provided'}
              </div>
            </div>

            <div class="field">
              <span class="field-label">Input/Output Connection:</span>
              <div class="field-value">${inputOutputConnectionDetails || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Alignment Input/Output:</span>
              <div class="field-value">${alignmentInputOutput || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Input Speed Details:</span>
              <div class="field-value">${inputSpeedDetails || 'Not provided'}</div>
            </div>
          </div>

          <div class="complaint-details">
            <h2>🛢️ Oil & Lubrication Details</h2>
            
            <div class="field">
              <span class="field-label">Oil Level Details:</span>
              <div class="field-value">${oilLevelDetails || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Grade of Oil Used:</span>
              <div class="field-value">${gradeOfOilUsed || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Condition of Oil:</span>
              <div class="field-value">${conditionOfOil || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Condition of Breather:</span>
              <div class="field-value">${conditionOfBreather || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Sediment in Oil Bottom:</span>
              <div class="field-value">${sedimentInOilBottom || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Lubrication Check Details:</span>
              <div class="field-value">${lubricationCheckDetails || 'Not provided'}</div>
            </div>
          </div>

          <div class="complaint-details">
            <h2>⏰ Operational Details</h2>
            
            <div class="field">
              <span class="field-label">Running Hours/Day:</span>
              <div class="field-value">${runningHoursPerDay || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Start/Stop per Day:</span>
              <div class="field-value">${startStopPerDay || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Ambient Conditions:</span>
              <div class="field-value">${ambientConditions || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Load Spectrum:</span>
              <div class="field-value">${loadSpectrum || 'Not provided'}</div>
            </div>
          </div>

          <div class="complaint-details">
            <h2>🔍 Maintenance & Failure Details</h2>
            
            <div class="field">
              <span class="field-label">Dismantled Before Failure:</span>
              <div class="field-value">${dismantledBeforeFailure || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Condition of Other Parts:</span>
              <div class="field-value">${conditionOfOtherParts || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Failure History Details:</span>
              <div class="field-value">${failureHistoryDetails || 'Not provided'}</div>
            </div>

            <div class="field">
              <span class="field-label">Forced Lubrication Photos:</span>
              <div class="field-value">${forcedLubricationPhotos || 'Not provided'}</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Action Required:</strong> Please contact the customer and take appropriate action.</p>
            <p>This is an automated notification from the Shanthi Gears Complaint Management System.</p>
            <p>Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
NEW COMPLAINT RECEIVED - Territory: ${territoryName}, ${countryName}

Complaint ID: ${complaintData.complaintId}

CUSTOMER INFORMATION:
- Contact Person: ${contactPersonName}
- Company: ${companyName}
- Email: ${mailId}
- Mobile: ${mobileNumber || 'Not provided'}
- Territory: ${territoryName}, ${countryName}

GEARBOX INFORMATION:
- Serial Number: ${gearboxSerialNumber || 'Not provided'}
- Date of Commissioning: ${formatDate(dateOfCommissioning)}
- Complaint Date: ${formatDate(complaintDate)}
- Application Details: ${applicationDetails || 'Not provided'}
- Motor Details (kW): ${inputMotorDetailsKw || 'Not provided'}

COMPLAINT DETAILS:
- Nature of Complaint: ${natureOfComplaintWithPhotos || 'No details provided'}
- Input/Output Connection: ${inputOutputConnectionDetails || 'Not provided'}
- Alignment Input/Output: ${alignmentInputOutput || 'Not provided'}
- Input Speed Details: ${inputSpeedDetails || 'Not provided'}

OIL & LUBRICATION DETAILS:
- Oil Level Details: ${oilLevelDetails || 'Not provided'}
- Grade of Oil Used: ${gradeOfOilUsed || 'Not provided'}
- Condition of Oil: ${conditionOfOil || 'Not provided'}
- Condition of Breather: ${conditionOfBreather || 'Not provided'}
- Sediment in Oil Bottom: ${sedimentInOilBottom || 'Not provided'}
- Lubrication Check Details: ${lubricationCheckDetails || 'Not provided'}

OPERATIONAL DETAILS:
- Running Hours/Day: ${runningHoursPerDay || 'Not provided'}
- Start/Stop per Day: ${startStopPerDay || 'Not provided'}
- Ambient Conditions: ${ambientConditions || 'Not provided'}
- Load Spectrum: ${loadSpectrum || 'Not provided'}

MAINTENANCE & FAILURE DETAILS:
- Dismantled Before Failure: ${dismantledBeforeFailure || 'Not provided'}
- Condition of Other Parts: ${conditionOfOtherParts || 'Not provided'}
- Failure History Details: ${failureHistoryDetails || 'Not provided'}
- Forced Lubrication Photos: ${forcedLubricationPhotos || 'Not provided'}

ACTION REQUIRED: Please contact the customer and take appropriate action.

This is an automated notification from the Shanthi Gears Complaint Management System.
Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `
  };
}

// Small, minimal HTML body for acknowledgement emails (not PDF)
function buildSimpleAcknowledgementEmailBody({ title, subtitle, complaintId, territoryName, countryName }) {
  const safe = (v) => (v || '').toString();
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${safe(title)}</title>
    </head>
    <body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:560px;margin:24px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <div style="background:#111827;color:#ffffff;padding:16px 20px;font-weight:700;font-size:16px;">Shanthi Gears</div>
        <div style="padding:20px;">
          <div style="font-size:18px;font-weight:700;color:#111827;">${safe(title)}</div>
          <div style="margin-top:6px;color:#6b7280;font-size:14px;">${safe(subtitle)}</div>
          <div style="margin-top:16px;padding:12px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa;">
            <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px dashed #e5e7eb;">
              <div style="font-weight:600;color:#374151;">Complaint ID</div>
              <div style="color:#111827;">${safe(complaintId)}</div>
            </div>
            <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;">
              <div style="font-weight:600;color:#374151;">Territory</div>
              <div style="color:#111827;">${safe(territoryName)}${countryName ? `, ${safe(countryName)}` : ''}</div>
            </div>
          </div>
          <div style="margin-top:16px;color:#374151;font-size:14px;">We have received the service request. The detailed acknowledgement is attached as a PDF.</div>
        </div>
        <div style="padding:14px 20px;background:#f9fafb;color:#6b7280;font-size:12px;">This is an automated email from the Complaint Management System.</div>
      </div>
    </body>
  </html>`;
}

// Build complaint PDF (manager/notification) acknowledgement with key details only
async function buildComplaintNotificationPdf(complaintData, territoryName, countryName) {
  const formatDate = (date) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const extractForcedAndFractured = (jsonString) => {
    if (!jsonString || typeof jsonString !== 'string') return { f: [], x: [] };
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) return { f: parsed, x: [] };
      const f = Array.isArray(parsed?.forcedLubricationPhotoUrls) ? parsed.forcedLubricationPhotoUrls : (Array.isArray(parsed?.f) ? parsed.f : []);
      const x = Array.isArray(parsed?.fracturedSurfacePhotoUrls) ? parsed.fracturedSurfacePhotoUrls : (Array.isArray(parsed?.x) ? parsed.x : []);
      return { f, x };
    } catch {
      return { f: [], x: [] };
    }
  };

  const extractComplaintBody = (value) => {
    if (!value || typeof value !== 'string') return { text: 'Not provided', urls: [] };
    const urls = Array.from(new Set((value.match(/https?:\/\/[^\s"']+/g) || [])));
    const text = value.replace(/https?:\/\/[^\s"']+/g, '').replace(/Photos?:?\s*\[[^\]]*\]/gi, '').trim() || 'Not provided';
    return { text, urls };
  };

  const html = `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Complaint Acknowledgement</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
        .title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .subtitle { color: #6b7280; font-size: 12px; margin-bottom: 16px; }
        .note { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .section { margin: 16px 0; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .section h3 { margin: 0 0 8px 0; font-size: 14px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5e7eb; align-items: flex-start; gap: 12px; }
        .row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #374151; }
        .value { color: #111827; text-align: left; max-width: 70%; white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; }
        .multiline { background: #fafafa; border: 1px solid #eee; padding: 8px; border-radius: 4px; }
        .links a { color: #1d4ed8; text-decoration: none; }
        .links a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="title">Complaint Acknowledgement</div>
      <div class="subtitle">Shanthi Gears • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>

      <div class="note">We have received the complaint. Our team will contact the customer shortly.</div>

      <div class="section">
        <div class="row"><div class="label">Complaint ID</div><div class="value">${complaintData.complaintId}</div></div>
        <div class="row"><div class="label">Date</div><div class="value">${formatDate(complaintData.complaintDate)}</div></div>
        <div class="row"><div class="label">Territory</div><div class="value">${territoryName || ''}, ${countryName || ''}</div></div>
      </div>

      <div class="section">
        <h3>Customer Information</h3>
        <div class="row"><div class="label">Customer</div><div class="value">${complaintData.contactPersonName || ''}</div></div>
        <div class="row"><div class="label">Company</div><div class="value">${complaintData.companyName || ''}</div></div>
        <div class="row"><div class="label">Email</div><div class="value">${complaintData.mailId || ''}</div></div>
        <div class="row"><div class="label">Mobile</div><div class="value">${complaintData.mobileNumber || 'Not provided'}</div></div>
      </div>

      <div class="section">
        <h3>Gearbox Information</h3>
        <div class="row"><div class="label">Gearbox Serial</div><div class="value">${complaintData.gearboxSerialNumber || 'Not provided'}</div></div>
        <div class="row"><div class="label">Commissioning Date</div><div class="value">${formatDate(complaintData.dateOfCommissioning)}</div></div>
      </div>

      <div class="section">
        <h3>Complaint Details</h3>
        <div class="row"><div class="label">Application Details</div><div class="value multiline">${complaintData.applicationDetails || 'Not provided'}</div></div>
        ${(() => { const { text, urls } = extractComplaintBody(complaintData.natureOfComplaintWithPhotos); const links = (urls||[]).map((u,i)=>`<a href=\"${u}\" target=\"_blank\">Photo ${i+1}</a>`).join(' · '); return `<div class=\"row\"><div class=\"label\">Nature of Complaint</div><div class=\"value\"><div class=\"multiline\">${text}</div>${urls.length?`<div class=\"links\" style=\"margin-top:6px;\">${links}</div>`:''}</div></div>`; })()}
        <div class="row"><div class="label">Input/Output Connection</div><div class="value multiline">${complaintData.inputOutputConnectionDetails || 'Not provided'}</div></div>
        <div class="row"><div class="label">Alignment Input/Output</div><div class="value multiline">${complaintData.alignmentInputOutput || 'Not provided'}</div></div>
        <div class="row"><div class="label">Input Speed Details</div><div class="value multiline">${complaintData.inputSpeedDetails || 'Not provided'}</div></div>
        <div class="row"><div class="label">Input Motor (kW)</div><div class="value">${complaintData.inputMotorDetailsKw || 'Not provided'}</div></div>
      </div>

      <div class="section">
        <h3>Oil & Lubrication</h3>
        <div class="row"><div class="label">Oil Level</div><div class="value">${complaintData.oilLevelDetails || 'Not provided'}</div></div>
        <div class="row"><div class="label">Grade of Oil</div><div class="value">${complaintData.gradeOfOilUsed || 'Not provided'}</div></div>
        <div class="row"><div class="label">Condition of Oil</div><div class="value">${complaintData.conditionOfOil || 'Not provided'}</div></div>
        <div class="row"><div class="label">Condition of Breather</div><div class="value">${complaintData.conditionOfBreather || 'Not provided'}</div></div>
        <div class="row"><div class="label">Sediment in Oil Bottom</div><div class="value">${complaintData.sedimentInOilBottom || 'Not provided'}</div></div>
        <div class="row"><div class="label">Lubrication Check</div><div class="value">${complaintData.lubricationCheckDetails || 'Not provided'}</div></div>
      </div>

      <div class="section">
        <h3>Operational Details</h3>
        <div class="row"><div class="label">Running Hours/Day</div><div class="value">${complaintData.runningHoursPerDay || 'Not provided'}</div></div>
        <div class="row"><div class="label">Start/Stop per Day</div><div class="value">${complaintData.startStopPerDay || 'Not provided'}</div></div>
        <div class="row"><div class="label">Ambient Conditions</div><div class="value">${complaintData.ambientConditions || 'Not provided'}</div></div>
        <div class="row"><div class="label">Load Spectrum</div><div class="value">${complaintData.loadSpectrum || 'Not provided'}</div></div>
      </div>

      <div class="section">
        <h3>Maintenance & Failure</h3>
        <div class="row"><div class="label">Dismantled Before Failure</div><div class="value">${complaintData.dismantledBeforeFailure || 'Not provided'}</div></div>
        <div class="row"><div class="label">Condition of Other Parts</div><div class="value">${complaintData.conditionOfOtherParts || 'Not provided'}</div></div>
        <div class="row"><div class="label">Failure History</div><div class="value">${complaintData.failureHistoryDetails || 'Not provided'}</div></div>
      </div>

      <div class="section">
        <h3>Photos/Attachments</h3>
        ${(() => { const { f, x } = extractForcedAndFractured(complaintData.forcedLubricationPhotos); const mk = (arr) => (arr && arr.length) ? arr.map((u,i)=>`<div style=\"padding:4px 0;\"><a href=\"${u}\" target=\"_blank\">Photo ${i+1}</a></div>`).join('') : 'Not provided'; return `<div class=\"row\"><div class=\"label\">Forced Lubrication</div><div class=\"value\">${mk(f)}</div></div><div class=\"row\"><div class=\"label\">Fractured Surface</div><div class=\"value\">${mk(x)}</div></div>`; })()}
      </div>

      <div style="color:#6b7280; font-size: 12px;">This PDF acknowledges receipt of the complaint.</div>
    </body>
  </html>`;

  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new', 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] 
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' } });
    await page.close();
    return pdf;
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error.message);
    if (error.message.includes('Could not find Chrome')) {
      throw new Error('Chrome browser not found. Please run: npx puppeteer browsers install chrome');
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close().catch(err => console.error('Error closing browser:', err));
    }
  }
}

// Email template for user thank you message
export function createUserThankYouEmailTemplate(complaintData, territoryName, countryName) {
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
    subject: `Thank You for Your Complaint Submission - ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You - Complaint Submission</title>
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
            background-color: #059669;
            color: white;
            padding: 30px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
          }
          .thank-you {
            background-color: #ecfdf5;
            border: 2px solid #059669;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
          }
          .section {
            margin-bottom: 25px;
            padding: 15px;
            border-left: 4px solid #059669;
            background-color: #f9f9f9;
          }
          .section h3 {
            margin-top: 0;
            color: #059669;
            border-bottom: 2px solid #059669;
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
          .contact-info {
            background-color: #f0f9ff;
            border-left-color: #0ea5e9;
            padding: 20px;
            margin: 20px 0;
          }
          .next-steps {
            background-color: #fef3c7;
            border-left-color: #f59e0b;
            padding: 20px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🙏 Thank You for Your Complaint Submission</h1>
            <p>Shanthi Gears - Customer Service</p>
            <p>Complaint ID: ${complaintData.complaintId}</p>
          </div>

          <div class="thank-you">
            <h2>Dear ${contactPersonName},</h2>
            <p style="font-size: 18px; margin: 20px 0;">
              <strong>Thank you for reaching out to Shanthi Gears!</strong>
            </p>
            <p style="font-size: 16px;">
              We have successfully received your complaint regarding the gearbox issue. 
              Our technical team has been notified and will review your case promptly.
            </p>
          </div>

          <div class="next-steps">
            <h3>📋 What Happens Next?</h3>
            <ul>
              <li>Our technical team will review your complaint details</li>
              <li>An assigned service engineer will contact you within 24-48 hours</li>
              <li>We will provide you with a detailed action plan</li>
              <li>Regular updates will be sent to your registered email</li>
            </ul>
          </div>

          <div class="contact-info">
            <h3>📞 Our Contact Information</h3>
            <p><strong>Customer Service:</strong> +91-XXX-XXXX-XXXX</p>
            <p><strong>Email:</strong> service@shanthigears.com</p>
            <p><strong>Website:</strong> www.shanthigears.com</p>
            <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM</p>
          </div>

          <div class="section">
            <h3>📋 Your Complaint Details</h3>
            <div class="field">
              <span class="field-label">Complaint ID:</span>
              <span class="field-value">${complaintData.complaintId}</span>
            </div>
            <div class="field">
              <span class="field-label">Company:</span>
              <span class="field-value">${companyName}</span>
            </div>
            <div class="field">
              <span class="field-label">Territory:</span>
              <span class="field-value">${territoryName}, ${countryName}</span>
            </div>
            <div class="field">
              <span class="field-label">Submission Date:</span>
              <span class="field-value">${formatDate(complaintDate)}</span>
            </div>
          </div>

          <div class="section">
            <h3>⚙️ Gearbox Information</h3>
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

          <div class="section">
            <h3>🔧 Nature of Complaint</h3>
            <div class="field">
              <span class="field-value">${natureOfComplaintWithPhotos || 'Not provided'}</span>
            </div>
          </div>

          <div class="section">
            <h3>🔌 Technical Details</h3>
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
            <p><strong>Thank you for choosing Shanthi Gears!</strong></p>
            <p>We appreciate your trust in our products and services. Our team is committed to resolving your issue promptly and ensuring your complete satisfaction.</p>
            <p>If you have any questions or need immediate assistance, please don't hesitate to contact us.</p>
            <p>Best regards,<br><strong>Shanthi Gears Customer Service Team</strong></p>
            <p>Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Dear ${contactPersonName},

Thank you for reaching out to Shanthi Gears!

We have successfully received your complaint regarding the gearbox issue. Our technical team has been notified and will review your case promptly.

WHAT HAPPENS NEXT?
- Our technical team will review your complaint details
- An assigned service engineer will contact you within 24-48 hours
- We will provide you with a detailed action plan
- Regular updates will be sent to your registered email

OUR CONTACT INFORMATION
Customer Service: +91-XXX-XXXX-XXXX
Email: service@shanthigears.com
Website: www.shanthigears.com
Business Hours: Monday - Friday, 9:00 AM - 6:00 PM

YOUR COMPLAINT DETAILS
Complaint ID: ${complaintData.complaintId}
Company: ${companyName}
Territory: ${territoryName}, ${countryName}
Submission Date: ${formatDate(complaintDate)}

GEARBOX INFORMATION
Serial Number: ${gearboxSerialNumber || 'Not provided'}
Date of Commissioning: ${formatDate(dateOfCommissioning)}
Application Details: ${applicationDetails || 'Not provided'}
Motor Details (kW): ${inputMotorDetailsKw || 'Not provided'}

NATURE OF COMPLAINT
${natureOfComplaintWithPhotos || 'Not provided'}

TECHNICAL DETAILS
Input/Output Connection: ${inputOutputConnectionDetails || 'Not provided'}
Alignment Input/Output: ${alignmentInputOutput || 'Not provided'}
Input Speed Details: ${inputSpeedDetails || 'Not provided'}

OIL & LUBRICATION DETAILS
Oil Level Details: ${oilLevelDetails || 'Not provided'}
Grade of Oil Used: ${gradeOfOilUsed || 'Not provided'}
Condition of Oil: ${conditionOfOil || 'Not provided'}
Condition of Breather: ${conditionOfBreather || 'Not provided'}
Sediment in Oil Bottom: ${sedimentInOilBottom || 'Not provided'}
Lubrication Check Details: ${lubricationCheckDetails || 'Not provided'}

OPERATIONAL DETAILS
Running Hours/Day: ${runningHoursPerDay || 'Not provided'}
Start/Stop per Day: ${startStopPerDay || 'Not provided'}
Ambient Conditions: ${ambientConditions || 'Not provided'}
Load Spectrum: ${loadSpectrum || 'Not provided'}

MAINTENANCE & FAILURE DETAILS
Dismantled Before Failure: ${dismantledBeforeFailure || 'Not provided'}
Condition of Other Parts: ${conditionOfOtherParts || 'Not provided'}
Failure History Details: ${failureHistoryDetails || 'Not provided'}

ADDITIONAL INFORMATION
Forced Lubrication Photos: ${forcedLubricationPhotos || 'Not provided'}

Thank you for choosing Shanthi Gears!
We appreciate your trust in our products and services. Our team is committed to resolving your issue promptly and ensuring your complete satisfaction.

If you have any questions or need immediate assistance, please don't hesitate to contact us.

Best regards,
Shanthi Gears Customer Service Team

Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `
  };
}

// Function to send thank you email to user
export async function sendUserThankYouEmail(complaintData, territoryName, countryName) {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. User thank you email skipped.');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailTemplate = createUserThankYouEmailTemplate(complaintData, territoryName, countryName);
    
    const mailOptions = {
      from: `"Shanthi Gears Customer Service" <${process.env.SMTP_USER}>`,
      to: complaintData.mailId,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('User thank you email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      recipient: complaintData.mailId 
    };
  } catch (error) {
    console.error('Error sending user thank you email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Function to send complaint notification email to manager with employees in CC
export async function sendComplaintNotification(complaintData, employeesData, territoryName, countryName) {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email notification skipped.');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    // Ensure employeesData is an array
    const employees = Array.isArray(employeesData) ? employeesData : [employeesData];
    
    // For other countries, we don't require employees - we use environment variables
    const isIndiaTerritory = countryName && countryName.toLowerCase() === 'india';
    
    if (employees.length === 0 && isIndiaTerritory) {
      console.warn('No employees provided for India territory email notification');
      return { success: false, error: 'No employees provided for India territory' };
    }

    const employeeEmails = employees.map(emp => emp.email).filter(email => email);
    
    // Debug: Log country and environment variables
    console.log(`🔍 Email Debug Info:`);
    console.log(`- Country: ${countryName}`);
    console.log(`- Country (lowercase): ${countryName ? countryName.toLowerCase() : 'null'}`);
    console.log(`- Is India Territory: ${isIndiaTerritory}`);
    console.log(`- INDIA_TO_EMAIL: ${process.env.INDIA_TO_EMAIL ? 'configured' : 'not configured'}`);
    console.log(`- INDIA_CC_EMAIL: ${process.env.INDIA_CC_EMAIL ? 'configured' : 'not configured'}`);
    console.log(`- COMPLAINT_CC_EMAIL: ${process.env.COMPLAINT_CC_EMAIL ? 'configured' : 'not configured'}`);
    console.log(`- OTHER_COUNTRY_TO_EMAIL: ${process.env.OTHER_COUNTRY_TO_EMAIL ? 'configured' : 'not configured'}`);
    console.log(`- OTHER_COUNTRY_CC_EMAIL: ${process.env.OTHER_COUNTRY_CC_EMAIL ? 'configured' : 'not configured'}`);
    console.log(`- Employees provided: ${employees.length}`);
    
    // Country-specific email logic
    let managerEmail, ccEmails;
    
    if (countryName && countryName.toLowerCase() === 'india') {
      // For India: Use INDIA_TO_EMAIL for TO, INDIA_CC_EMAIL + employees for CC
      const indiaToEmail = process.env.INDIA_TO_EMAIL;
      const indiaCCEmail = process.env.INDIA_CC_EMAIL;
      
      // Parse TO emails if they contain comma-separated values
      if (indiaToEmail) {
        const toEmails = indiaToEmail.split(',').map(email => email.trim()).filter(email => email);
        managerEmail = toEmails.join(', '); // Join multiple TO emails with comma
        console.log(`Parsed India TO emails: ${toEmails.join(', ')}`);
      } else {
        console.warn('INDIA_TO_EMAIL not configured. Using fallback COMPLAINT_CC_EMAIL.');
        managerEmail = process.env.COMPLAINT_CC_EMAIL;
      }
      
      // Parse CC emails if they contain comma-separated values
      let indiaCCEmails = [];
      if (indiaCCEmail) {
        indiaCCEmails = indiaCCEmail.split(',').map(email => email.trim()).filter(email => email);
        console.log(`Parsed India CC emails: ${indiaCCEmails.join(', ')}`);
      }
      
      // Combine India CC emails with employee emails
      ccEmails = [...indiaCCEmails, ...employeeEmails];
      console.log(`India territory: Sending TO India emails (${managerEmail}), CC India emails + employees (${ccEmails.length} total)`);
    } else {
      // For other countries: Use dedicated TO and CC emails for other countries
      const otherCountryToEmail = process.env.OTHER_COUNTRY_TO_EMAIL;
      const otherCountryCCEmail = process.env.OTHER_COUNTRY_CC_EMAIL;
      
      // Parse TO emails if they contain comma-separated values
      if (otherCountryToEmail) {
        const toEmails = otherCountryToEmail.split(',').map(email => email.trim()).filter(email => email);
        managerEmail = toEmails.join(', '); // Join multiple TO emails with comma
        console.log(`Parsed TO emails: ${toEmails.join(', ')}`);
      } else {
        console.warn('OTHER_COUNTRY_TO_EMAIL not configured. Email will not be sent for other countries.');
        return { success: false, error: 'OTHER_COUNTRY_TO_EMAIL not configured' };
      }
      
      // Parse CC emails if they contain comma-separated values
      if (otherCountryCCEmail) {
        ccEmails = otherCountryCCEmail.split(',').map(email => email.trim()).filter(email => email);
        console.log(`Parsed CC emails: ${ccEmails.join(', ')}`);
      } else {
        ccEmails = [];
        console.log('No CC emails configured for other countries');
      }
      
      console.log(`Non-India territory: Sending TO other country emails (${managerEmail}), CC other country emails (${ccEmails.length} emails)`);
    }
    
    // Validate that we have a valid email to send to
    if (!managerEmail) {
      console.error('No valid email address found for sending notification');
      return { success: false, error: 'No valid email address found' };
    }
    
    console.log(`Sending notification email to: ${managerEmail}`);
    console.log(`CC'ing: ${ccEmails.join(', ')}`);
    
    // Create email template with country information
    // For other countries, use a dummy employee object if no employees provided
    const employeeForTemplate = employees.length > 0 ? employees[0] : { fullName: 'System', email: 'system@shanthigears.com' };
    // Build acknowledgement PDF and minimal body
    const pdfBuffer = await buildComplaintNotificationPdf(complaintData, territoryName, countryName);
    const subject = `New Service Request - ${complaintData.companyName} (${territoryName}, ${countryName}) [${complaintData.complaintId}]`;
    const textBody = `Service request received. See attached acknowledgement PDF.\n\nComplaint ID: ${complaintData.complaintId}\nTerritory: ${territoryName}, ${countryName}`;
    const htmlBody = buildSimpleAcknowledgementEmailBody({
      title: 'Service Request Received',
      subtitle: 'Acknowledgement attached as PDF',
      complaintId: complaintData.complaintId,
      territoryName,
      countryName
    });

    const mailOptions = {
      from: `"Shanthi Gears Complaint System" <${process.env.SMTP_USER}>`,
      to: managerEmail,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject,
      text: textBody,
      html: htmlBody,
      attachments: [
        {
          filename: `Complaint_${complaintData.complaintId || 'acknowledgement'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Notification email sent successfully: ${result.messageId}`);
    console.log(`✅ CC'd to ${ccEmails.length} recipients`);
    
    return { 
      success: true, 
      messageId: result.messageId,
      recipient: managerEmail,
      ccRecipients: ccEmails,
      ccCount: ccEmails.length
    };
  } catch (error) {
    console.error('Error sending complaint notification email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}


// Email template for manager approval with accept/reject buttons
export function createManagerApprovalEmailTemplate(complaintData, employees, territoryName) {
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

  const baseUrl = process.env.NEXTAUTH_URL || 'https://phpstack-1401173-5874180.cloudwaysapps.com';
  const complaintId = complaintData.complaintId;

  return {
    subject: `Manager Approval Required - New Complaint from ${companyName} (${territoryName})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Manager Approval Required</title>
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
            padding: 30px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
          }
          .approval-section {
            background-color: #fef2f2;
            border: 2px solid #dc2626;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
          }
          .employee-list {
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .employee-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .employee-info {
            flex: 1;
            margin-right: 15px;
            line-height: 1.4;
          }
          .employee-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
          }
          .btn {
            padding: 8px 16px;
            border: 1px solid;
            border-radius: 4px;
            text-decoration: none;
            font-weight: 500;
            cursor: pointer;
            display: inline-block;
            transition: all 0.2s ease;
            font-size: 12px;
            min-width: 100px;
            text-align: center;
            white-space: nowrap;
          }
          .btn-accept {
            background-color: #ffffff;
            color: #059669;
            border-color: #059669;
          }
          .btn-accept:hover {
            background-color: #059669;
            color: white;
          }
          .btn-reject {
            background-color: #ffffff;
            color: #dc2626;
            border-color: #dc2626;
          }
          .btn-reject:hover {
            background-color: #dc2626;
            color: white;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Manager Approval Required</h1>
            <p>New Complaint Submission - Action Required</p>
            <p>Complaint ID: ${complaintId}</p>
          </div>

          <div class="approval-section">
            <h2>⚠️ Employee Assignment Required</h2>
            <p><strong>A new complaint has been submitted and requires your approval for employee assignment.</strong></p>
            <p>Please review the complaint details below and assign employees by clicking Accept or Reject for each employee.</p>
          </div>

          <div class="employee-list">
            <h3>👥 Available Employees for Assignment</h3>
            ${employees.map(employee => `
              <div class="employee-item">
                <div class="employee-info">
                  <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${employee.fullName}</div>
                  <div style="color: #6b7280; font-size: 13px; margin-bottom: 2px;">${employee.designation}</div>
                  <div style="color: #9ca3af; font-size: 12px;">${employee.email}</div>
                </div>
                <div class="employee-actions">
                  <a href="${baseUrl}/api/complaint-action?complaintId=${complaintId}&employeeId=${employee.employeeId}&action=accept" 
                     class="btn btn-accept">Accept</a>
                  <a href="${baseUrl}/api/complaint-action?complaintId=${complaintId}&employeeId=${employee.employeeId}&action=reject" 
                     class="btn btn-reject">Reject</a>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h3>📋 Customer Information</h3>
            <div class="field">
              <span class="field-label">Contact Person:</span>
              <span class="field-value">${contactPersonName}</span>
            </div>
            <div class="field">
              <span class="field-label">Company:</span>
              <span class="field-value">${companyName}</span>
            </div>
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${mailId}</span>
            </div>
            <div class="field">
              <span class="field-label">Mobile:</span>
              <span class="field-value">${mobileNumber || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Territory:</span>
              <span class="field-value">${territoryName}</span>
            </div>
          </div>

          <div class="section">
            <h3>⚙️ Gearbox Information</h3>
            <div class="field">
              <span class="field-label">Serial Number:</span>
              <span class="field-value">${gearboxSerialNumber || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Date of Commissioning:</span>
              <span class="field-value">${formatDate(dateOfCommissioning)}</span>
            </div>
            <div class="field">
              <span class="field-label">Complaint Date:</span>
              <span class="field-value">${formatDate(complaintDate)}</span>
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

          <div class="section">
            <h3>🔧 Complaint Details</h3>
            <div class="field">
              <span class="field-label">Nature of Complaint:</span>
              <span class="field-value">${natureOfComplaintWithPhotos || 'Not provided'}</span>
            </div>
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
            <div class="field">
              <span class="field-label">Forced Lubrication Photos:</span>
              <span class="field-value">${forcedLubricationPhotos || 'Not provided'}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Action Required:</strong> Please review the complaint details and assign employees by clicking Accept or Reject for each employee.</p>
            <p>This is an automated notification from the Shanthi Gears Complaint Management System.</p>
            <p>Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
MANAGER APPROVAL REQUIRED - New Complaint Submission

Complaint ID: ${complaintId}

A new complaint has been submitted and requires your approval for employee assignment.

AVAILABLE EMPLOYEES FOR ASSIGNMENT:
${employees.map(employee => `
- ${employee.fullName} (${employee.designation})
  Email: ${employee.email}
  Accept: ${baseUrl}/api/complaint-action?complaintId=${complaintId}&employeeId=${employee.employeeId}&action=accept
  Reject: ${baseUrl}/api/complaint-action?complaintId=${complaintId}&employeeId=${employee.employeeId}&action=reject
`).join('')}

CUSTOMER INFORMATION:
- Contact Person: ${contactPersonName}
- Company: ${companyName}
- Email: ${mailId}
- Mobile: ${mobileNumber || 'Not provided'}
- Territory: ${territoryName}

GEARBOX INFORMATION:
- Serial Number: ${gearboxSerialNumber || 'Not provided'}
- Date of Commissioning: ${formatDate(dateOfCommissioning)}
- Complaint Date: ${formatDate(complaintDate)}
- Application Details: ${applicationDetails || 'Not provided'}
- Motor Details (kW): ${inputMotorDetailsKw || 'Not provided'}

COMPLAINT DETAILS:
- Nature of Complaint: ${natureOfComplaintWithPhotos || 'Not provided'}
- Input/Output Connection: ${inputOutputConnectionDetails || 'Not provided'}
- Alignment Input/Output: ${alignmentInputOutput || 'Not provided'}
- Input Speed Details: ${inputSpeedDetails || 'Not provided'}

OIL & LUBRICATION DETAILS:
- Oil Level Details: ${oilLevelDetails || 'Not provided'}
- Grade of Oil Used: ${gradeOfOilUsed || 'Not provided'}
- Condition of Oil: ${conditionOfOil || 'Not provided'}
- Condition of Breather: ${conditionOfBreather || 'Not provided'}
- Sediment in Oil Bottom: ${sedimentInOilBottom || 'Not provided'}
- Lubrication Check Details: ${lubricationCheckDetails || 'Not provided'}

OPERATIONAL DETAILS:
- Running Hours/Day: ${runningHoursPerDay || 'Not provided'}
- Start/Stop per Day: ${startStopPerDay || 'Not provided'}
- Ambient Conditions: ${ambientConditions || 'Not provided'}
- Load Spectrum: ${loadSpectrum || 'Not provided'}

MAINTENANCE & FAILURE DETAILS:
- Dismantled Before Failure: ${dismantledBeforeFailure || 'Not provided'}
- Condition of Other Parts: ${conditionOfOtherParts || 'Not provided'}
- Failure History Details: ${failureHistoryDetails || 'Not provided'}
- Forced Lubrication Photos: ${forcedLubricationPhotos || 'Not provided'}

ACTION REQUIRED: Please review the complaint details and assign employees by clicking Accept or Reject for each employee.

This is an automated notification from the Shanthi Gears Complaint Management System.
Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `
  };
}

// Email template for employee assignment acceptance
export function createEmployeeAssignmentEmailTemplate(complaintData, employeeData, territoryName) {
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
    subject: `✅ Complaint Assignment Accepted - ${companyName} (${territoryName})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complaint Assignment Accepted</title>
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
            background-color: #059669;
            color: white;
            padding: 30px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
          }
          .success-section {
            background-color: #ecfdf5;
            border: 2px solid #059669;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
          }
          .section {
            margin-bottom: 25px;
            padding: 15px;
            border-left: 4px solid #059669;
            background-color: #f9f9f9;
          }
          .section h3 {
            margin-top: 0;
            color: #059669;
            border-bottom: 2px solid #059669;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Complaint Assignment Accepted</h1>
            <p>You have been assigned to handle this complaint</p>
            <p>Complaint ID: ${complaintData.complaintId}</p>
          </div>

          <div class="success-section">
            <h2>🎉 Assignment Confirmed!</h2>
            <p><strong>Dear ${employeeData.fullName},</strong></p>
            <p>You have been successfully assigned to handle the complaint from <strong>${companyName}</strong> in the <strong>${territoryName}</strong> territory.</p>
            <p>Please proceed with the complaint resolution process and contact the customer as soon as possible.</p>
          </div>

          <div class="section">
            <h3>📋 Customer Information</h3>
            <div class="field">
              <span class="field-label">Contact Person:</span>
              <span class="field-value">${contactPersonName}</span>
            </div>
            <div class="field">
              <span class="field-label">Company:</span>
              <span class="field-value">${companyName}</span>
            </div>
            <div class="field">
              <span class="field-label">Email:</span>
              <span class="field-value">${mailId}</span>
            </div>
            <div class="field">
              <span class="field-label">Mobile:</span>
              <span class="field-value">${mobileNumber || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Territory:</span>
              <span class="field-value">${territoryName}</span>
            </div>
          </div>

          <div class="section">
            <h3>⚙️ Gearbox Information</h3>
            <div class="field">
              <span class="field-label">Serial Number:</span>
              <span class="field-value">${gearboxSerialNumber || 'Not provided'}</span>
            </div>
            <div class="field">
              <span class="field-label">Date of Commissioning:</span>
              <span class="field-value">${formatDate(dateOfCommissioning)}</span>
            </div>
            <div class="field">
              <span class="field-label">Complaint Date:</span>
              <span class="field-value">${formatDate(complaintDate)}</span>
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

          <div class="section">
            <h3>🔧 Complaint Details</h3>
            <div class="field">
              <span class="field-label">Nature of Complaint:</span>
              <span class="field-value">${natureOfComplaintWithPhotos || 'Not provided'}</span>
            </div>
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
            <div class="field">
              <span class="field-label">Forced Lubrication Photos:</span>
              <span class="field-value">${forcedLubricationPhotos || 'Not provided'}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Next Steps:</strong> Please contact the customer within 24-48 hours and begin the complaint resolution process.</p>
            <p>This is an automated notification from the Shanthi Gears Complaint Management System.</p>
            <p>Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
COMPLAINT ASSIGNMENT ACCEPTED

Complaint ID: ${complaintData.complaintId}

Dear ${employeeData.fullName},

You have been successfully assigned to handle the complaint from ${companyName} in the ${territoryName} territory.

Please proceed with the complaint resolution process and contact the customer as soon as possible.

CUSTOMER INFORMATION:
- Contact Person: ${contactPersonName}
- Company: ${companyName}
- Email: ${mailId}
- Mobile: ${mobileNumber || 'Not provided'}
- Territory: ${territoryName}

GEARBOX INFORMATION:
- Serial Number: ${gearboxSerialNumber || 'Not provided'}
- Date of Commissioning: ${formatDate(dateOfCommissioning)}
- Complaint Date: ${formatDate(complaintDate)}
- Application Details: ${applicationDetails || 'Not provided'}
- Motor Details (kW): ${inputMotorDetailsKw || 'Not provided'}

COMPLAINT DETAILS:
- Nature of Complaint: ${natureOfComplaintWithPhotos || 'Not provided'}
- Input/Output Connection: ${inputOutputConnectionDetails || 'Not provided'}
- Alignment Input/Output: ${alignmentInputOutput || 'Not provided'}
- Input Speed Details: ${inputSpeedDetails || 'Not provided'}

OIL & LUBRICATION DETAILS:
- Oil Level Details: ${oilLevelDetails || 'Not provided'}
- Grade of Oil Used: ${gradeOfOilUsed || 'Not provided'}
- Condition of Oil: ${conditionOfOil || 'Not provided'}
- Condition of Breather: ${conditionOfBreather || 'Not provided'}
- Sediment in Oil Bottom: ${sedimentInOilBottom || 'Not provided'}
- Lubrication Check Details: ${lubricationCheckDetails || 'Not provided'}

OPERATIONAL DETAILS:
- Running Hours/Day: ${runningHoursPerDay || 'Not provided'}
- Start/Stop per Day: ${startStopPerDay || 'Not provided'}
- Ambient Conditions: ${ambientConditions || 'Not provided'}
- Load Spectrum: ${loadSpectrum || 'Not provided'}

MAINTENANCE & FAILURE DETAILS:
- Dismantled Before Failure: ${dismantledBeforeFailure || 'Not provided'}
- Condition of Other Parts: ${conditionOfOtherParts || 'Not provided'}
- Failure History Details: ${failureHistoryDetails || 'Not provided'}
- Forced Lubrication Photos: ${forcedLubricationPhotos || 'Not provided'}

NEXT STEPS: Please contact the customer within 24-48 hours and begin the complaint resolution process.

This is an automated notification from the Shanthi Gears Complaint Management System.
Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `
  };
}

// Email template for acceptance confirmation
export function createAcceptanceConfirmationTemplate(complaintData, territoryName, supervisorEmail) {
  const {
    contactPersonName,
    companyName,
    complaintDate
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
    subject: `✅ Complaint Supervision Accepted - ${companyName} (${territoryName})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complaint Supervision Accepted</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
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
            background-color: #059669;
            color: white;
            padding: 25px;
            border-radius: 5px;
            margin-bottom: 30px;
            text-align: center;
          }
          .success-section {
            background-color: #ecfdf5;
            border: 2px solid #059669;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
          }
          .section {
            margin-bottom: 25px;
            padding: 15px;
            border-left: 4px solid #059669;
            background-color: #f9f9f9;
          }
          .section h3 {
            margin-top: 0;
            color: #059669;
            border-bottom: 2px solid #059669;
            padding-bottom: 5px;
          }
          .field {
            margin-bottom: 10px;
          }
          .field-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 150px;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Supervision Accepted</h1>
            <p>Complaint ID: ${complaintData.complaintId}</p>
          </div>

          <div class="success-section">
            <h2>🎉 Great News!</h2>
            <p><strong>Your complaint supervision has been accepted by:</strong></p>
            <p style="font-size: 18px; color: #059669;"><strong>${supervisorEmail}</strong></p>
            <p>The supervisor will now oversee the resolution of this complaint and ensure it receives proper attention.</p>
          </div>

          <div class="section">
            <h3>📋 Complaint Summary</h3>
            <div class="field">
              <span class="field-label">Complaint ID:</span>
              <span class="field-value">${complaintData.complaintId}</span>
            </div>
            <div class="field">
              <span class="field-label">Customer:</span>
              <span class="field-value">${contactPersonName}</span>
            </div>
            <div class="field">
              <span class="field-label">Company:</span>
              <span class="field-value">${companyName}</span>
            </div>
            <div class="field">
              <span class="field-label">Territory:</span>
              <span class="field-value">${territoryName}</span>
            </div>
            <div class="field">
              <span class="field-label">Date:</span>
              <span class="field-value">${formatDate(complaintDate)}</span>
            </div>
          </div>

          <div class="section">
            <h3>📞 Next Steps</h3>
            <ul>
              <li>The supervisor will coordinate with you on the resolution approach</li>
              <li>You may receive additional instructions or requests for information</li>
              <li>Please ensure timely response to any queries from the supervisor</li>
              <li>Keep the supervisor updated on your progress</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>Thank you for your dedication to customer service!</strong></p>
            <p>This is an automated notification from the Shanthi Gears Complaint Management System.</p>
            <p>Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
COMPLAINT SUPERVISION ACCEPTED

Complaint ID: ${complaintData.complaintId}

Great News!
Your complaint supervision has been accepted by: ${supervisorEmail}

The supervisor will now oversee the resolution of this complaint and ensure it receives proper attention.

Complaint Summary:
- Complaint ID: ${complaintData.complaintId}
- Customer: ${contactPersonName}
- Company: ${companyName}
- Territory: ${territoryName}
- Date: ${formatDate(complaintDate)}

Next Steps:
- The supervisor will coordinate with you on the resolution approach
- You may receive additional instructions or requests for information
- Please ensure timely response to any queries from the supervisor
- Keep the supervisor updated on your progress

Thank you for your dedication to customer service!

This is an automated notification from the Shanthi Gears Complaint Management System.
Generated on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `
  };
}

// Function to send manager approval email
export async function sendManagerApprovalEmail(complaintData, employees, territoryName, managerEmail) {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Manager approval email skipped.');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailTemplate = createManagerApprovalEmailTemplate(complaintData, employees, territoryName);
    
    const mailOptions = {
      from: `"Shanthi Gears Complaint System" <${process.env.SMTP_USER}>`,
      to: managerEmail,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Manager approval email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      recipient: managerEmail
    };
  } catch (error) {
    console.error('Error sending manager approval email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Function to send employee assignment email
export async function sendEmployeeAssignmentEmail(complaintData, employeeData, territoryName) {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Employee assignment email skipped.');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailTemplate = createEmployeeAssignmentEmailTemplate(complaintData, employeeData, territoryName);
    
    const mailOptions = {
      from: `"Shanthi Gears Complaint System" <${process.env.SMTP_USER}>`,
      to: employeeData.email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
      html: emailTemplate.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Employee assignment email sent successfully:', result.messageId);
    
    return { 
      success: true, 
      messageId: result.messageId,
      recipient: employeeData.email 
    };
  } catch (error) {
    console.error('Error sending employee assignment email:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export default transporter;
