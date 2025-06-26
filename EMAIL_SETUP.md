# Email Verification Setup Guide

## Overview
SimpleFactura now includes email verification during registration. Users will receive a 6-digit verification code via email and must enter it to activate their account.

## Environment Variables Required

Add these variables to your `.env.local` file:

```env
# Email Configuration (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### 2. Generate App Password
1. Go to Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "SimpleFactura" as the name
6. Copy the generated 16-character password

### 3. Configure Environment Variables
- Set `GMAIL_USER` to your Gmail address
- Set `GMAIL_APP_PASSWORD` to the generated app password
- Set `NEXT_PUBLIC_APP_URL` to your app's URL (e.g., http://localhost:3000 for development)

## Database Migration

Run the following command to add the verification fields to your database:

```bash
npx prisma migrate dev --name add_email_verification
```

## How It Works

1. **Registration**: User fills out registration form
2. **Email Sent**: System generates 6-digit code and sends email
3. **Verification**: User enters code on verification page
4. **Activation**: Account is activated and user can login

## Features

- ✅ 6-digit verification codes
- ✅ 10-minute expiration
- ✅ Resend functionality
- ✅ Professional email templates
- ✅ Mobile-responsive verification page
- ✅ Error handling and validation

## Testing

For development, you can use services like:
- **Mailtrap.io** (for testing emails)
- **Gmail** (for production)

## Troubleshooting

### Email not sending
- Check Gmail app password is correct
- Verify 2FA is enabled
- Check environment variables are set

### Database errors
- Run `npx prisma generate` to update client
- Run `npx prisma migrate dev` to apply migrations

### Verification not working
- Check database connection
- Verify email and code match
- Check code hasn't expired 