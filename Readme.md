## Google Sheets Contact Form Handler

Handles HTML form submissions → Google Sheets + email notification.

### Features
- Writes submissions to Google Sheets
- Email notification on every submission  
- Rate limiting (5 submissions / email / 60 min)
- Prevents phone number formula errors in Sheets
- No dependencies, pure Apps Script

### Setup
1. Create a Google Sheet with columns:
   Timestamp | Name | Email | Phone | Website | Description
2. Extensions → Apps Script → paste the script
3. Set NOTIFY_EMAIL at the top
4. Deploy → New deployment → Web App
   - Execute as: Me
   - Who has access: Anyone
5. Run `sendTestEmail()` once to grant Gmail permission
6. Copy the Web App URL into your form's fetch() call

### Configuration
| Constant | Default | Description |
|---|---|---|
| NOTIFY_EMAIL | your@email.com | Where notifications are sent |
| RATE_LIMIT_WINDOW_MINUTES | 60 | Rolling time window |
| RATE_LIMIT_MAX_SUBMISSIONS | 5 | Max per email per window |
| FORM_NAME | Contact Form | Used in email subject |