import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmployeeAssignmentEmail } from "@/lib/email";

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

// Handle complaint action (accept/reject employee assignment)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const complaintId = searchParams.get('complaintId');
    const employeeId = searchParams.get('employeeId');
    const action = searchParams.get('action');

    console.log('Complaint action request:', { complaintId, employeeId, action });

    // Validate required parameters
    if (!complaintId || !employeeId || !action) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Missing required parameters: complaintId, employeeId, action' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate action
    if (!['accept', 'reject'].includes(action)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Invalid action. Must be "accept" or "reject"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get complaint details
    const complaint = await prisma.complaints.findUnique({
      where: { complaintId },
      include: {
        territory: true
      }
    });

    if (!complaint) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Complaint not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get employee details
    const employee = await prisma.employees.findUnique({
      where: { employeeId }
    });

    if (!employee) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Employee not found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const territoryName = complaint.territory?.territoryName || 'Unknown Territory';

    if (action === 'accept') {
      // Send assignment email to employee
      try {
        const emailResult = await sendEmployeeAssignmentEmail(
          complaint, 
          employee, 
          territoryName
        );

        if (emailResult.success) {
          console.log(`✅ Employee assignment email sent to ${employee.fullName} (${employee.email})`);
          
          // Return success page
          return new NextResponse(`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Assignment Accepted</title>
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
                  text-align: center;
                }
                .success {
                  background-color: #ecfdf5;
                  border: 2px solid #059669;
                  padding: 20px;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .btn {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #059669;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 10px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>✅ Assignment Accepted Successfully!</h1>
                <div class="success">
                  <h2>Employee Assignment Confirmed</h2>
                  <p><strong>Employee:</strong> ${employee.fullName}</p>
                  <p><strong>Email:</strong> ${employee.email}</p>
                  <p><strong>Complaint ID:</strong> ${complaintId}</p>
                  <p><strong>Company:</strong> ${complaint.companyName}</p>
                  <p><strong>Territory:</strong> ${territoryName}</p>
                </div>
                <p>The employee has been notified via email and can now proceed with the complaint resolution process.</p>
                <a href="/complaints" class="btn">View All Complaints</a>
              </div>
            </body>
            </html>
          `, {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'text/html' }
          });
        } else {
          throw new Error(emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending employee assignment email:', emailError);
        return new NextResponse(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Assignment Error</title>
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
                text-align: center;
              }
              .error {
                background-color: #fef2f2;
                border: 2px solid #dc2626;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .btn {
                display: inline-block;
                padding: 10px 20px;
                background-color: #dc2626;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Assignment Failed</h1>
              <div class="error">
                <h2>Email Notification Error</h2>
                <p>There was an error sending the assignment notification to the employee.</p>
                <p><strong>Error:</strong> ${emailError.message}</p>
              </div>
              <p>Please try again or contact the system administrator.</p>
              <a href="/complaints" class="btn">Back to Complaints</a>
            </div>
          </body>
          </html>
        `, {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'text/html' }
        });
      }
    } else if (action === 'reject') {
      // Return rejection confirmation page
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Assignment Rejected</title>
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
              text-align: center;
            }
            .rejection {
              background-color: #fef2f2;
              border: 2px solid #dc2626;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: #dc2626;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Assignment Rejected</h1>
            <div class="rejection">
              <h2>Employee Assignment Rejected</h2>
              <p><strong>Employee:</strong> ${employee.fullName}</p>
              <p><strong>Email:</strong> ${employee.email}</p>
              <p><strong>Complaint ID:</strong> ${complaintId}</p>
              <p><strong>Company:</strong> ${complaint.companyName}</p>
              <p><strong>Territory:</strong> ${territoryName}</p>
            </div>
            <p>This employee will not be assigned to handle this complaint.</p>
            <a href="/complaints" class="btn">Back to Complaints</a>
          </div>
        </body>
        </html>
      `, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

  } catch (error) {
    console.error('Error processing complaint action:', error);
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>System Error</title>
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
            text-align: center;
          }
          .error {
            background-color: #fef2f2;
            border: 2px solid #dc2626;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            background-color: #dc2626;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ System Error</h1>
          <div class="error">
            <h2>An error occurred</h2>
            <p>There was an error processing your request.</p>
            <p><strong>Error:</strong> ${error.message}</p>
          </div>
          <p>Please try again or contact the system administrator.</p>
          <a href="/complaints" class="btn">Back to Complaints</a>
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }
}