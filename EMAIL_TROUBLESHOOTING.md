# Email Troubleshooting Guide

## Issue: WordPress Form Submission - Thank You Email and Employee Notification Not Working

### Root Cause
The email functionality is not working because **SMTP credentials are not configured**. The system is missing the required environment variables.

### Current Status
✅ Email functions are working correctly  
✅ Email templates are properly formatted  
❌ SMTP credentials are missing  
❌ Environment variables are not set  

### Solution

#### Step 1: Create Environment File
Create a `.env.local` file in your project root with the following content:

```env
# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual-email@gmail.com
SMTP_PASS=your-app-password

# CC Email for complaint notifications (India)
COMPLAINT_CC_EMAIL=swethabellan@gmail.com

# Other Country Emails for non-India territories (supports multiple emails separated by commas)
OTHER_COUNTRY_TO_EMAIL=other-country-to1@company.com,other-country-to2@company.com
OTHER_COUNTRY_CC_EMAIL=other-country-cc1@company.com,other-country-cc2@company.com,other-country-cc3@company.com

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database Configuration
DATABASE_URL="file:./dev.db"
```

#### Step 2: Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASS` (NOT your regular Gmail password)

#### Step 3: Alternative SMTP Providers

**Outlook/Hotmail:**
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Custom SMTP Server:**
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

#### Step 4: Restart the Application
After creating the `.env.local` file:
```bash
npm run dev
```

### How the Email System Works

1. **WordPress Form Submission** → API endpoint `/api/complaints`
2. **Complaint Creation** → Database stores the complaint
3. **Dual Email Sending**:
   - **Thank You Email** → Sent to the user who submitted the complaint
   - **Employee Notification** → Sent to employees assigned to the territory
   - **Manager CC Email** → Sent to manager with accept/reject buttons

### Email Flow Details

#### Thank You Email
- **Recipient**: User who submitted the complaint (`mailId` field)
- **Purpose**: Acknowledge receipt and provide next steps
- **Template**: Professional green-themed HTML email

#### Employee Notification
- **Recipients**: All active employees assigned to the territory
- **Purpose**: Notify employees of new complaint requiring attention
- **Template**: Professional red-themed HTML email with complaint details

#### Manager CC Email
- **Recipient**: Manager email (from `COMPLAINT_CC_EMAIL` env var)
- **Purpose**: Supervision and approval workflow
- **Features**: Accept/Reject buttons for complaint supervision

### Testing the Fix

1. **Create the `.env.local` file** with proper SMTP credentials
2. **Restart the development server**
3. **Submit a test complaint** via WordPress form
4. **Check console logs** for email sending status
5. **Verify emails are received** by the intended recipients

### Common Issues and Solutions

#### "SMTP credentials not configured"
- **Cause**: Missing or incorrect environment variables
- **Solution**: Create `.env.local` file with proper SMTP settings

#### "Authentication failed"
- **Cause**: Wrong SMTP credentials
- **Solution**: For Gmail, use App Password instead of regular password

#### "No active employee found for territory"
- **Cause**: No employees assigned to the territory
- **Solution**: Assign employees to territories in the admin panel

#### Emails not being received
- **Cause**: SMTP server issues or email going to spam
- **Solution**: Check spam folder, verify SMTP settings, test with different email provider

### Debug Information

The system logs detailed information about email sending:
- Email sending attempts
- Success/failure status
- Recipient addresses
- Error messages

Check the console output when submitting complaints to see the email status.

### Next Steps

1. Set up the environment variables as described above
2. Test with a real Gmail account and App Password
3. Verify that both thank you emails and employee notifications are working
4. Check that the manager CC emails with accept/reject buttons are functioning

Once the SMTP credentials are properly configured, all email functionality should work as expected.
