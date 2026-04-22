const https = require('https');

const TASKS_LIST_ID = process.env.TASKS_LIST_ID || 'MTAxNDk3MDk5MzU5ODkxNTc4Nzg6MDow';
const TASKS_API = 'tasks.googleapis.com';
const REPOS = ['ai-mindset-org', 'pos-sprint', 'pos-offer', 'pos-cash', 'BG', 'ai-mindset', 'pos-delivery', 'pos-growth'];

function refreshToken() {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const tokens = JSON.parse(data);
          resolve(tokens.access_token);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function apiRequest(method, path, body, accessToken) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: TASKS_API,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function getOpenIssues(repo) {
  return new Promise((resolve, reject) => {
    const query = JSON.stringify({
      query: `query($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          issues(states: OPEN, first: 100) {
            nodes {
              number title body url createdAt updatedAt
              labels(first: 5) { nodes { name } }
              assignees(first: 3) { nodes { login } }
            }
          }
        }
      }`,
      variables: { owner: 'wtf-tupak', repo }
    });

    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.GITHUB_TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(query),
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
    req.write(query);
    req.end();
  });
}

async function getExistingTasks(accessToken) {
  const result = await apiRequest('GET', `/tasks/v1/lists/${TASKS_LIST_ID}/tasks?showCompleted=false`, null, accessToken);
  return result.items || [];
}

async function createTask(accessToken, title, notes) {
  return apiRequest('POST', `/tasks/v1/lists/${TASKS_LIST_ID}/tasks`, { title, notes }, accessToken);
}

async function updateTask(accessToken, taskId, notes) {
  return apiRequest('PATCH', `/tasks/v1/lists/${TASKS_LIST_ID}/tasks/${taskId}`, { notes }, accessToken);
}

async function main() {
  console.log('Starting sync...');

  const accessToken = await refreshToken();
  console.log('Token refreshed');

  const existingTasks = await getExistingTasks(accessToken);
  console.log(`Found ${existingTasks.length} existing tasks`);

  let total = 0;
  for (const repo of REPOS) {
    try {
      const issues = await getOpenIssues(repo);
      console.log(`Found ${issues.length} issues in ${repo}`);

      for (const issue of issues) {
        const taskTitle = `[${repo}#${issue.number}] ${issue.title}`;
        const taskNotes = `${issue.body || '(no description)'}\n\n${issue.url}\n\nLabels: ${issue.labels.nodes.map(l => l.name).join(', ')}\nAssignees: ${issue.assignees.nodes.map(a => a.login).join(', ')}`;

        const existing = existingTasks.find(t => t.title.startsWith(`[${repo}#${issue.number}]`));

        try {
          if (existing) {
            await updateTask(accessToken, existing.id, taskNotes);
            console.log(`Updated: ${taskTitle}`);
          } else {
            await createTask(accessToken, taskTitle, taskNotes);
            console.log(`Created: ${taskTitle}`);
          }
        } catch (e) {
          console.error(`Error syncing ${repo}#${issue.number}: ${e.message || e}`);
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