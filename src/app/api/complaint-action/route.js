import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createAcceptanceConfirmationTemplate } from "@/lib/email";
import transporter from "@/lib/email";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const complaintId = searchParams.get('complaintId');
    const supervisorEmail = searchParams.get('supervisorEmail');

    if (!action || !complaintId) {
      return new NextResponse(`
        <html>
          <head><title>Invalid Request</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Invalid Request</h1>
            <p>Missing required parameters. Please use the links provided in the email.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Get the complaint details
    const complaint = await prisma.complaints.findUnique({
      where: { complaintId },
      include: {
        territory: {
          include: {
            employeeTerritories: {
              where: {
                employee: {
                  status: 'ACTIVE'
                }
              },
              include: {
                employee: true
              }
            }
          }
        }
      }
    });

    if (!complaint) {
      return new NextResponse(`
        <html>
          <head><title>Complaint Not Found</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Complaint Not Found</h1>
            <p>The complaint with ID ${complaintId} was not found.</p>
          </body>
        </html>
      `, {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (action === 'accept') {
      try {
        // Get supervisor email from the request or use the CC email as fallback
        const ccEmail = process.env.COMPLAINT_CC_EMAIL || 'swethabellan@gmail.com';
        const actualSupervisorEmail = supervisorEmail || ccEmail;

        // Send acceptance confirmation emails to all assigned employees
        const employees = complaint.territory.employeeTerritories.map(et => et.employee);
        
        if (employees.length > 0) {
          const emailTemplate = createAcceptanceConfirmationTemplate(
            complaint, 
            complaint.territory.territoryName, 
            actualSupervisorEmail
          );

          // Send to all employees
          const employeeEmails = employees.map(emp => emp.email).filter(email => email);
          
          if (employeeEmails.length > 0) {
            const mailOptions = {
              from: `"Shanthi Gears Complaint System" <${process.env.SMTP_USER}>`,
              to: employeeEmails.join(', '),
              subject: emailTemplate.subject,
              text: emailTemplate.text,
              html: emailTemplate.html,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Acceptance confirmation sent to employees: ${employeeEmails.join(', ')}`);
          }
        }

        return new NextResponse(`
          <html>
            <head>
              <title>Complaint Supervision Accepted</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 40px 20px;
                  background-color: #f4f4f4;
                }
                .container {
                  background-color: white;
                  padding: 40px;
                  border-radius: 10px;
                  box-shadow: 0 0 20px rgba(0,0,0,0.1);
                  text-align: center;
                }
                .success-header {
                  background-color: #059669;
                  color: white;
                  padding: 30px;
                  border-radius: 8px;
                  margin-bottom: 30px;
                }
                .success-header h1 {
                  margin: 0;
                  font-size: 28px;
                }
                .details {
                  background-color: #ecfdf5;
                  border: 2px solid #059669;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                  text-align: left;
                }
                .btn {
                  display: inline-block;
                  background-color: #059669;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
                  font-weight: bold;
                }
                .btn:hover {
                  background-color: #047857;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success-header">
                  <h1>✅ Supervision Accepted!</h1>
                  <p>Thank you for accepting the supervision of this complaint.</p>
                </div>
                
                <div class="details">
                  <h3>📋 Complaint Details:</h3>
                  <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
                  <p><strong>Company:</strong> ${complaint.companyName}</p>
                  <p><strong>Territory:</strong> ${complaint.territory.territoryName}</p>
                  <p><strong>Contact Person:</strong> ${complaint.contactPersonName}</p>
                  <p><strong>Date:</strong> ${new Date(complaint.complaintDate).toLocaleDateString('en-IN')}</p>
                </div>

                <p><strong>✉️ Confirmation emails have been sent to all assigned employees.</strong></p>
                <p>They have been notified that you are now supervising this complaint and will coordinate the resolution process.</p>
                
                <a href="/dashboard" class="btn">Go to Dashboard</a>
              </div>
            </body>
          </html>
        `, {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });

      } catch (emailError) {
        console.error('Error sending acceptance confirmation emails:', emailError);
        
        return new NextResponse(`
          <html>
            <head><title>Supervision Accepted</title></head>
            <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
              <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
                <h1 style="color: #059669;">✅ Supervision Accepted!</h1>
                <p>Your acceptance has been recorded, but there was an issue sending confirmation emails to the employees.</p>
                <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
                <p><strong>Company:</strong> ${complaint.companyName}</p>
                <p>Please contact the employees directly to inform them of your supervision.</p>
                <a href="/dashboard" style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Dashboard</a>
              </div>
            </body>
          </html>
        `, {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        });
      }

    } else if (action === 'reject') {
      return new NextResponse(`
        <html>
          <head>
            <title>Complaint Supervision Rejected</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                text-align: center;
              }
              .reject-header {
                background-color: #dc2626;
                color: white;
                padding: 30px;
                border-radius: 8px;
                margin-bottom: 30px;
              }
              .reject-header h1 {
                margin: 0;
                font-size: 28px;
              }
              .details {
                background-color: #fef2f2;
                border: 2px solid #dc2626;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: left;
              }
              .btn {
                display: inline-block;
                background-color: #dc2626;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
                font-weight: bold;
              }
              .btn:hover {
                background-color: #b91c1c;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="reject-header">
                <h1>❌ Supervision Rejected</h1>
                <p>You have rejected the supervision of this complaint.</p>
              </div>
              
              <div class="details">
                <h3>📋 Complaint Details:</h3>
                <p><strong>Complaint ID:</strong> ${complaint.complaintId}</p>
                <p><strong>Company:</strong> ${complaint.companyName}</p>
                <p><strong>Territory:</strong> ${complaint.territory.territoryName}</p>
                <p><strong>Contact Person:</strong> ${complaint.contactPersonName}</p>
                <p><strong>Date:</strong> ${new Date(complaint.complaintDate).toLocaleDateString('en-IN')}</p>
              </div>

              <p><strong>⚠️ This complaint will continue to be handled by the assigned employees without supervision.</strong></p>
              <p>If you change your mind, you can still contact the employees directly to offer your supervision.</p>
              
              <a href="/dashboard" class="btn">Go to Dashboard</a>
            </div>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });

    } else {
      return new NextResponse(`
        <html>
          <head><title>Invalid Action</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Invalid Action</h1>
            <p>The action '${action}' is not recognized. Please use 'accept' or 'reject'.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

  } catch (error) {
    console.error('Error processing complaint action:', error);
    return new NextResponse(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #dc2626;">❌ Error</h1>
          <p>An error occurred while processing your request. Please try again later.</p>
          <p><em>Error: ${error.message}</em></p>
        </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}
