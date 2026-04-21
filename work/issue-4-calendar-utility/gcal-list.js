const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.claude/mcp-credentials/credentials.json');
const TOKEN_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.claude/mcp-credentials/mcp-google-calendar-token.json');

async function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  return JSON.parse(content);
}

function createOAuthClient(credentials) {
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

async function authorize(credentials) {
  const oauth2Client = createOAuthClient(credentials);
  const token = fs.readFileSync(TOKEN_PATH);
  oauth2Client.setCredentials(JSON.parse(token));
  return oauth2Client;
}

async function listTodaysEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: today.toISOString(),
    timeMax: tomorrow.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items;
}

async function main() {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('Credentials not found');
      process.exit(1);
    }

    const credentials = await loadCredentials();
    const auth = await authorize(credentials);
    const events = await listTodaysEvents(auth);

    if (events.length === 0) {
      console.log('No events today');
    } else {
      events.forEach(event => {
        const start = event.start.dateTime || event.start.date;
        const date = new Date(start);
        const time = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        const isAllDay = !event.start.dateTime;
        console.log(`${isAllDay ? '     ' : time}  ${event.summary}`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();