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

async function createEvent(auth, event) {
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });
  return res.data;
}

async function main() {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('Credentials not found');
      process.exit(1);
    }

    const credentials = await loadCredentials();
    const auth = await authorize(credentials);

    // Tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    // Events to create
    const events = [
      {
        summary: '📋 Standup + Review issues #2, #3',
        description: 'Morning standup. Review infrastructure epic #2 and template repo #3',
        start: { dateTime: `${dateStr}T09:00:00`, timeZone: 'Europe/Moscow' },
        end: { dateTime: `${dateStr}T09:30:00`, timeZone: 'Europe/Moscow' },
      },
      {
        summary: '💻 Work: CMO-Agent development',
        description: 'Create CMO-Agent for content marketing. GitHub: pos-sprint#1',
        start: { dateTime: `${dateStr}T10:00:00`, timeZone: 'Europe/Moscow' },
        end: { dateTime: `${dateStr}T12:00:00`, timeZone: 'Europe/Moscow' },
      },
      {
        summary: '🍽️ Break',
        start: { dateTime: `${dateStr}T12:00:00`, timeZone: 'Europe/Moscow' },
        end: { dateTime: `${dateStr}T13:00:00`, timeZone: 'Europe/Moscow' },
      },
      {
        summary: '📊 Work: Client template repository',
        description: 'Create template repo for agency clients. GitHub: ai-mindset-org#3',
        start: { dateTime: `${dateStr}T13:00:00`, timeZone: 'Europe/Moscow' },
        end: { dateTime: `${dateStr}T15:00:00`, timeZone: 'Europe/Moscow' },
      },
      {
        summary: '🎯 Work: /plan decomposition for epic #2',
        description: 'Decompose infrastructure epic into sub-issues',
        start: { dateTime: `${dateStr}T15:30:00`, timeZone: 'Europe/Moscow' },
        end: { dateTime: `${dateStr}T17:00:00`, timeZone: 'Europe/Moscow' },
      },
    ];

    console.log(`Creating ${events.length} events for tomorrow (${dateStr}):\n`);

    for (const event of events) {
      const created = await createEvent(auth, event);
      console.log(`✅ ${created.summary}`);
      console.log(`   ${created.start.dateTime || created.start.date} → ${created.htmlLink}\n`);
    }

    console.log('All events created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
