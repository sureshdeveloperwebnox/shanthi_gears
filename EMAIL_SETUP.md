# Email Notification Setup

This document explains how to configure email notifications for the complaint management system.

## Overview

When a new complaint is created, the system automatically sends an email notification to the employee assigned to that territory. The email contains all the complaint details in a professional HTML format.

## Required Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password as `SMTP_PASS` (not your regular Gmail password)

## Alternative SMTP Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## How It Works

1. **Complaint Creation**: When a new complaint is submitted via the API
2. **Territory Lookup**: System finds the territory associated with the complaint
3. **Employee Lookup**: System finds the active employee assigned to that territory
4. **Email Generation**: Creates a professional HTML email with all complaint details
5. **Email Sending**: Sends the notification to the assigned employee

## Email Template Features

- **Professional HTML Design**: Clean, responsive email template
- **Complete Complaint Details**: All form fields included
- **Territory Information**: Shows which territory the complaint is from
- **Contact Information**: Highlighted contact details for quick action
- **Structured Sections**: Organized by categories (Contact, Gearbox, Oil, etc.)
- **Fallback Text Version**: Plain text version for email clients that don't support HTML

## Error Handling

- If SMTP credentials are not configured, the system logs a warning but continues processing
- If no employee is assigned to the territory, a warning is logged
- If email sending fails, the complaint is still created successfully
- All email errors are logged for debugging

## Testing

To test the email functionality:

1. Ensure you have an employee assigned to a territory
2. Create a test complaint via the API
3. Check the console logs for email sending status
4. Verify the email is received by the assigned employee

## Troubleshooting

### Common Issues

1. **"SMTP credentials not configured"**
   - Add the required environment variables to `.env.local`
   - Restart the development server

2. **"Authentication failed"**
   - Check your SMTP credentials
   - For Gmail, ensure you're using an App Password, not your regular password

3. **"No active employee found for territory"**
   - Ensure an employee is assigned to the territory
   - Check that the employee status is 'ACTIVE'

4. **Email not received**
   - Check spam/junk folder
   - Verify the employee's email address is correct
   - Check SMTP server logs for delivery issues
