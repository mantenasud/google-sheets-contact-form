/**
 * escVelocity Contact Form - Google Apps Script
 * 
 * Receives form submissions, writes to Google Sheets,
 * sends email notifications, and rate limits by email.
 *
 * Setup:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Paste this script and configure the constants below
 * 3. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 4. Run sendTestEmail() once to authorize Gmail permissions
 * 5. Copy the Web App URL into your HTML form's fetch() call
 */

// ─── CONFIGURATION ───────────────────────────────────────────
const NOTIFY_EMAIL = 'your@email.com';           // Email to receive notifications
const RATE_LIMIT_WINDOW_MINUTES = 60;            // Time window for rate limiting
const RATE_LIMIT_MAX_SUBMISSIONS = 5;            // Max submissions per email per window
const FORM_NAME = 'Contact Form';                // Used in email subject line
// ─────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    data.phone = data.phone ? data.phone.toString().trim() : '';

    if (isRateLimited(data.email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ result: 'error', message: 'Rate limit exceeded' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    writeToSheet(data);
    sendNotification(data);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function writeToSheet(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var newRow = sheet.getLastRow() + 1;

  // Timestamp gets its own format, rest forced to plain text to avoid formula errors
  sheet.getRange(newRow, 1).setValue(new Date());
  sheet.getRange(newRow, 2).setNumberFormat('@').setValue(data.name        || '');
  sheet.getRange(newRow, 3).setNumberFormat('@').setValue(data.email       || '');
  sheet.getRange(newRow, 4).setNumberFormat('@').setValue(data.phone       || '');
  sheet.getRange(newRow, 5).setNumberFormat('@').setValue(data.website     || '');
  sheet.getRange(newRow, 6).setNumberFormat('@').setValue(data.description || '');
}

function sendNotification(data) {
  var subject = '📥 New ' + FORM_NAME + ' submission - ' + data.name;
  var body = [
    'A new form submission just came in.',
    '',
    'Name:        ' + (data.name        || '-'),
    'Email:       ' + (data.email       || '-'),
    'Phone:       ' + (data.phone       || '-'),
    'Website:     ' + (data.website     || '-'),
    '',
    'Message:',
    (data.description || '-'),
    '',
    'Submitted at ' + new Date().toLocaleString()
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function isRateLimited(email) {
  var cache = CacheService.getScriptCache();
  var key = 'rl_' + email.replace(/[^a-zA-Z0-9]/g, '_');
  var current = cache.get(key);
  var count = current ? parseInt(current) : 0;

  if (count >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return true;
  }

  cache.put(key, count + 1, RATE_LIMIT_WINDOW_MINUTES * 60);
  return false;
}

/**
 * Run this function once manually to authorize Gmail permissions.
 * Delete or keep it — it won't affect live form submissions.
 */
function sendTestEmail() {
  sendNotification({
    name:        'Test User',
    email:       'test@example.com',
    phone:       '+1 555 000 0000',
    website:     'https://example.com',
    description: 'This is a test submission to verify email notifications are working.'
  });
}