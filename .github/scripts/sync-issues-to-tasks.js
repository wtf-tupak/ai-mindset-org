const { google } = require('googleapis');

const TASKS_LIST_ID = process.env.TASKS_LIST_ID || '@default';
const REPOS = ['pos-print', 'ai-mindset-org', 'pos-sprint', 'pos-offer', 'pos-cash', 'BG', 'ai-mindset', 'pos-delivery', 'pos-growth'];

async function authorize() {
  const token = JSON.parse(process.env.GOOGLE_TASKS_TOKEN);
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials(token);
  return oauth2Client;
}

async function getOpenIssues(repo) {
  const query = `query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      issues(states: OPEN, first: 100) {
        nodes {
          number
          title
          body
          url
          createdAt
          updatedAt
          labels(first: 5) { nodes { name } }
          assignees(first: 3) { nodes { login } }
        }
      }
    }
  }`;

  const body = JSON.stringify({ query, variables: { owner: 'wtf-tupak', repo } });

  return new Promise((resolve, reject) => {
    const https = require('https');
    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'pos-print-sync'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data?.repository?.issues?.nodes || []);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function createOrUpdateTask(tasks, issue, repo) {
  const taskTitle = `[${repo}#${issue.number}] ${issue.title}`;
  const taskNotes = `${issue.body || '(no description)'}\n\n${issue.url}\n\nLabels: ${issue.labels.nodes.map(l => l.name).join(', ')}\nAssignees: ${issue.assignees.nodes.map(a => a.login).join(', ')}`;

  // Check if task already exists
  const existing = await tasks.tasks.list({ tasklist: TASKS_LIST_ID, showCompleted: false });
  const match = existing.data.items?.find(t => t.title.startsWith(`[${repo}#${issue.number}]`));

  if (match) {
    // Update
    await tasks.tasks.patch({
      tasklist: TASKS_LIST_ID,
      task: match.id,
      requestBody: { notes: taskNotes }
    });
    console.log(`Updated: ${taskTitle}`);
  } else {
    // Create
    await tasks.tasks.insert({
      tasklist: TASKS_LIST_ID,
      requestBody: {
        title: taskTitle,
        notes: taskNotes
      }
    });
    console.log(`Created: ${taskTitle}`);
  }
}

async function main() {
  console.log('Starting sync...');
  const auth = await authorize();
  const tasks = google.tasks({ version: 'v1', auth });

  let total = 0;
  for (const repo of REPOS) {
    try {
      const issues = await getOpenIssues(repo);
      console.log(`Found ${issues.length} issues in ${repo}`);

      for (const issue of issues) {
        try {
          await createOrUpdateTask(tasks, issue, repo);
        } catch (e) {
          console.error(`Error syncing ${repo}#${issue.number}: ${e.message}`);
        }
      }
      total += issues.length;
    } catch (e) {
      console.error(`Error fetching ${repo}: ${e.message}`);
    }
  }

  console.log(`\nSync complete. Total issues processed: ${total}`);
}

main().catch(console.error);