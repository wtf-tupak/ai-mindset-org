const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const readline = require('readline');

// Path to credentials
const CREDENTIALS_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.claude/mcp-credentials/credentials.json');
const TOKEN_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.claude/mcp-credentials/mcp-google-calendar-token.json');

// Load client secrets
async function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH);
  return JSON.parse(content);
}

// Create OAuth2 client
function createOAuthClient(credentials) {
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
}

// Load saved token or get new one
async function authorize(credentials) {
  const oauth2Client = createOAuthClient(credentials);

  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oauth2Client.setCredentials(JSON.parse(token));
    return oauth2Client;
  } catch (err) {
    console.log('Token not found. Starting authentication flow...');
    console.log('Please visit this URL and authorize access:');

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar'],
    });

    console.log(authUrl);

    // Start local server to receive callback
    return new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        const query = url.parse(req.url, true).query;

        if (query.code) {
          res.end('Authentication successful! You can close this window.');
          server.close();

          try {
            const { tokens } = await oauth2Client.getToken(query.code);
            oauth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('Token saved.');
            resolve(oauth2Client);
          } catch (e) {
            reject(e);
          }
        }
      });

      server.listen(3000, () => {
        console.log('Waiting for authentication on http://localhost:3000...');
      });

      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timeout'));
      }, 120000);
    });
  }
}

// List all calendars
async function listCalendars(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.calendarList.list();
  return response.data.items;
}

// Get all events from a calendar
async function getAllEvents(auth, calendarId) {
  const calendar = google.calendar({ version: 'v3', auth });
  const events = [];
  let pageToken = null;

  do {
    const response = await calendar.events.list({
      calendarId: calendarId,
      maxResults: 2500,
      pageToken: pageToken,
      showDeleted: false,
      singleEvents: true,
    });

    if (response.data.items) {
      events.push(...response.data.items);
    }

    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return events;
}

// Delete an event
async function deleteEvent(auth, calendarId, eventId) {
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({
    calendarId: calendarId,
    eventId: eventId,
  });
}

// Clear all events from all calendars
async function clearAllCalendars(auth) {
  const calendars = await listCalendars(auth);
  console.log(`\nFound ${calendars.length} calendar(s):`);

  for (const cal of calendars) {
    console.log(`  - ${cal.summary} (${cal.id})`);
  }

  console.log('\nFetching events...');
  let totalEvents = 0;
  let deletedEvents = 0;

  for (const cal of calendars) {
    try {
      const events = await getAllEvents(auth, cal.id);
      console.log(`  ${cal.summary}: ${events.length} events`);
      totalEvents += events.length;

      for (const event of events) {
        try {
          await deleteEvent(auth, cal.id, event.id);
          deletedEvents++;
          process.stdout.write(`\r  Deleted: ${deletedEvents}/${totalEvents}`);
        } catch (e) {
          console.error(`\n  Error deleting event ${event.id}: ${e.message}`);
        }
      }
    } catch (e) {
      console.error(`\n  Error with calendar ${cal.summary}: ${e.message}`);
    }
  }

  console.log(`\n\nDone! Deleted ${deletedEvents} events.`);
}

// Main
async function main() {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('Credentials file not found at:', CREDENTIALS_PATH);
      process.exit(1);
    }

    const credentials = await loadCredentials();
    const auth = await authorize(credentials);

    console.log('\n⚠️  WARNING: This will delete ALL events from ALL calendars.');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    await clearAllCalendars(auth);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
