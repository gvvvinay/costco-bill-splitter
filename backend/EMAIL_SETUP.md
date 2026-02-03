# Email Configuration Setup

## Daily Expense Summary Emails

The app now sends automated daily expense summaries via email at 8:00 PM every night.

### Setup Instructions:

1. **Create a Gmail App Password:**
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to Security > 2-Step Verification
   - Scroll down to "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

2. **Update the `.env` file:**
   ```env
   EMAIL_USER="callmegvv@gmail.com"
   EMAIL_APP_PASSWORD="your-16-character-app-password"
   ```

3. **The system will automatically:**
   - Send daily summaries at 8:00 PM to all registered users
   - Include total expenses, recent sessions, and top spenders
   - Format emails with beautiful HTML templates

### Test the Email Feature:

To manually test the email functionality, you can use the test endpoint:

```bash
POST /api/email/send-summary
Authorization: Bearer <your-jwt-token>
```

Or use curl:
```bash
curl -X POST http://localhost:9001/api/email/send-summary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Scheduled Jobs:

- **Daily Summary**: 8:00 PM every day (`0 20 * * *`)
- Sends to: All registered users (can be customized with user preferences)

### Email Contents:

✅ Total number of sessions
✅ Total expenses amount
✅ Total items tracked
✅ Active participants count
✅ Recent 5 sessions with details
✅ Top 5 spenders with amounts
✅ Beautiful responsive HTML design

### Troubleshooting:

If emails aren't sending:
1. Verify EMAIL_USER and EMAIL_APP_PASSWORD in `.env`
2. Check console logs for error messages
3. Ensure 2-Step Verification is enabled on Gmail
4. Use App Password, NOT your regular Gmail password
5. Check spam/junk folder for test emails
