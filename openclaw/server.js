require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const TaskHandler = require('./handlers/task-handler');
const ThreadManager = require('./handlers/thread-manager');
const GitHubWebhookHandler = require('./handlers/github-webhook-handler');

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedUserId = parseInt(process.env.CLAUDE_CODE_USER_ID);
const forumGroupId = process.env.TELEGRAM_FORUM_GROUP_ID ? parseInt(process.env.TELEGRAM_FORUM_GROUP_ID) : null;
const forumTopicId = process.env.TELEGRAM_FORUM_TOPIC_ID ? parseInt(process.env.TELEGRAM_FORUM_TOPIC_ID) : null;

if (!token || !allowedUserId) {
  console.error('Error: TELEGRAM_BOT_TOKEN and CLAUDE_CODE_USER_ID must be set in .env');
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(token, { polling: true });

// Initialize managers
const threadManager = new ThreadManager(bot);
const taskHandler = new TaskHandler(bot, threadManager);
const githubWebhookHandler = new GitHubWebhookHandler(bot, forumGroupId, forumTopicId);

// Initialize Express for GitHub webhooks
const app = express();
app.use(express.json());

const webhookPort = process.env.WEBHOOK_PORT || 3000;
const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

console.log('OpenClaw bot started...');
console.log(`Allowed user ID: ${allowedUserId}`);
if (forumGroupId) {
  console.log(`Forum group ID: ${forumGroupId}`);
  console.log(`Forum topic ID: ${forumTopicId || 'not set'}`);
}

// GitHub webhook endpoint
app.post('/webhook/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const signature = req.headers['x-hub-signature-256'];

  // Verify signature if secret is set
  if (webhookSecret) {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
      console.error('Invalid webhook signature');
      return res.status(401).send('Unauthorized');
    }
  }

  console.log(`Received GitHub webhook: ${event}`);

  if (event === 'issues') {
    await githubWebhookHandler.handleIssueEvent(req.body);
  }

  res.status(200).send('OK');
});

// Start webhook server
app.listen(webhookPort, () => {
  console.log(`Webhook server listening on port ${webhookPort}`);
});

// Command: /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== allowedUserId) {
    bot.sendMessage(chatId, '⛔ Unauthorized. This bot is for Personal Corp use only.');
    return;
  }

  bot.sendMessage(chatId, `🤖 OpenClaw Bot Active

**Personal Corp Infrastructure Layer**

I receive tasks from Claude Code and execute them in parallel threads.

**Commands:**
/status - Show active threads
/help - Show help

**Task Format (JSON):**
\`\`\`json
{
  "task_id": "uuid",
  "type": "agent | bash | github",
  "agent": "prompt-architect",
  "prompt": "Write a post...",
  "context": {}
}
\`\`\`

Send JSON to create a task.`, { parse_mode: 'Markdown' });
});

// Command: /status
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== allowedUserId) {
    return;
  }

  const status = threadManager.getStatus();
  bot.sendMessage(chatId, status, { parse_mode: 'Markdown' });
});

// Command: /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== allowedUserId) {
    return;
  }

  bot.sendMessage(chatId, `📖 **OpenClaw Help**

**Task Types:**
- \`agent\` - Run Claude Code agent
- \`bash\` - Execute shell command
- \`github\` - GitHub API operation

**Example Task:**
\`\`\`json
{
  "task_id": "123",
  "type": "agent",
  "agent": "business-analyst",
  "prompt": "Analyze process",
  "context": {"domain": "retail"}
}
\`\`\`

**Thread Management:**
- Each task runs in separate thread
- Parallel execution supported
- Results sent back as JSON

**Integration:**
Claude Code → Telegram MCP → OpenClaw → Execute → Report back`, { parse_mode: 'Markdown' });
});

// Handle incoming messages (task JSON)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;
  const messageThreadId = msg.message_thread_id;

  // Skip if unauthorized
  if (userId !== allowedUserId) {
    return;
  }

  // Skip commands
  if (text.startsWith('/')) {
    return;
  }

  // Try to parse as JSON task
  try {
    const task = JSON.parse(text);

    // Validate task structure
    if (!task.task_id || !task.type) {
      bot.sendMessage(chatId, '❌ Invalid task format. Missing task_id or type.', {
        message_thread_id: messageThreadId
      });
      return;
    }

    // Handle task
    await taskHandler.handleTask(chatId, task, messageThreadId);

  } catch (error) {
    // Not JSON, ignore
    if (error instanceof SyntaxError) {
      return;
    }

    console.error('Error handling message:', error);
    bot.sendMessage(chatId, `❌ Error: ${error.message}`, {
      message_thread_id: messageThreadId
    });
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('Shutting down OpenClaw bot...');
  bot.stopPolling();
  process.exit(0);
});
