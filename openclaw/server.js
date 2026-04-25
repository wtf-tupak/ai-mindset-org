require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const TaskHandler = require('./handlers/task-handler');
const ThreadManager = require('./handlers/thread-manager');
const GitHubWebhookHandler = require('./handlers/github-webhook-handler');
const ContextManager = require('./handlers/context-manager');
const PersonaManager = require('./handlers/persona-manager');
const TokenTracker = require('./handlers/token-tracker');
const ProactiveEngine = require('./proactive/proactive-engine');
const GitHubMonitor = require('./proactive/monitors/github-monitor');
const IssueTrigger = require('./proactive/triggers/issue-trigger');

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
const contextManager = new ContextManager();
const personaManager = new PersonaManager(contextManager);
const tokenTracker = new TokenTracker();

// Initialize Session Manager (Proactive Agent)
const SessionManager = require('./handlers/session-manager');
const sessionManager = new SessionManager();

// Load session on startup
(async () => {
  await sessionManager.loadSession();
  console.log('Session loaded - Proactive Agent active');
})();

// Initialize GitHub Context Provider
const GitHubContextProvider = require('./managers/github-context-provider');
const githubContextProvider = new GitHubContextProvider('wtf-tupak/ai-mindset-org');

// Initialize adaptive system
const FeedbackCollector = require('./adaptive/feedback-collector');
const PreferenceStore = require('./adaptive/preference-store');
const PromptAdapter = require('./adaptive/prompt-adapter');

const feedbackCollector = new FeedbackCollector(bot, contextManager);
const preferenceStore = new PreferenceStore();
const promptAdapter = new PromptAdapter(preferenceStore, feedbackCollector);

personaManager.setPromptAdapter(promptAdapter);
personaManager.setGitHubContextProvider(githubContextProvider);
personaManager.setSessionManager(sessionManager);

console.log('Adaptive learning system initialized');
console.log('GitHub Context Provider initialized');

// Initialize multi-agent system
const AgentRegistry = require('./agents/registry');
const AgentCoordinator = require('./agents/coordinator');
const DelegationSystem = require('./agents/delegation');
const AgentExecutor = require('./executors/agent-executor');

const agentRegistry = new AgentRegistry();
const agentExecutor = new AgentExecutor();
const agentCoordinator = new AgentCoordinator(agentRegistry, contextManager, agentExecutor);
const delegationSystem = new DelegationSystem(agentCoordinator, contextManager);

console.log('Multi-agent system initialized');

// Initialize task handler with coordinator
const taskHandler = new TaskHandler(bot, threadManager);
taskHandler.setCoordinator(agentCoordinator);

// Connect TaskHandler to PersonaManager (Proactive Agent capability)
personaManager.setTaskHandler(taskHandler);

const githubWebhookHandler = new GitHubWebhookHandler(bot, forumGroupId, forumTopicId);

// Initialize proactive engine
const proactiveEngine = new ProactiveEngine(bot, contextManager);
const githubMonitor = new GitHubMonitor(contextManager);
const issueTrigger = new IssueTrigger(forumGroupId || allowedUserId, forumTopicId);

proactiveEngine.registerMonitor(githubMonitor);
proactiveEngine.registerTrigger(issueTrigger);
proactiveEngine.setTaskHandler(taskHandler);

// Initialize Manager Check-in trigger
const ManagerCheckin = require('./proactive/triggers/manager-checkin');
const managerCheckin = new ManagerCheckin(bot, forumGroupId || allowedUserId, 970, githubContextProvider);
proactiveEngine.registerTrigger(managerCheckin);

// Connect proactive engine to webhook handler
githubWebhookHandler.setProactiveEngine(proactiveEngine);

console.log('Proactive engine initialized with GitHub monitor, issue trigger, and manager check-in');

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

// Set Naval persona chat
personaManager.setPersonaChat('naval', forumGroupId || allowedUserId, 970);
console.log('Naval Ravikant persona configured (topic: 970)');

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

// Cleanup old contexts every hour
setInterval(() => {
  contextManager.cleanup();
  threadManager.cleanup();
  tokenTracker.cleanup();
  preferenceStore.decay();
  console.log('Cleaned up old contexts, threads, and decayed preferences');
}, 3600000);

// Commit session every 10 minutes (Proactive Agent)
setInterval(() => {
  sessionManager.commitSession().catch(err => {
    console.error('Error committing session:', err);
  });
}, 600000); // 10 minutes

// Send daily token summary at 23:00 every day
const scheduleDailySummary = () => {
  const now = new Date();
  const target = new Date();
  target.setHours(23, 0, 0, 0);

  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target - now;

  setTimeout(() => {
    sendDailySummary();
    // Schedule next day
    setInterval(sendDailySummary, 86400000); // 24 hours
  }, delay);
};

const sendDailySummary = () => {
  const summary = tokenTracker.getDailySummary();
  if (summary && forumGroupId) {
    const message = tokenTracker.formatSummary(summary);
    bot.sendMessage(forumGroupId, message, {
      message_thread_id: 972, // system topic
      parse_mode: 'Markdown'
    }).catch(err => console.error('Error sending daily summary:', err));
  }
};

scheduleDailySummary();

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

  const threadStatus = threadManager.getStatus();
  const contextStats = contextManager.getStats();

  const status = `${threadStatus}

**Context Stats:**
📊 Active contexts: ${contextStats.totalContexts}
${contextStats.contexts.slice(0, 5).map(ctx =>
  `• ${ctx.threadId}: ${ctx.messageCount} messages`
).join('\n')}`;

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

// Command: /manager on
bot.onText(/\/manager on/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== allowedUserId) {
    return;
  }

  personaManager.enableManager();
  managerCheckin.enable();
  bot.sendMessage(chatId, '✅ Manager enabled. Check-ins every 4 hours on topic 970.');
});

// Command: /manager off
bot.onText(/\/manager off/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== allowedUserId) {
    return;
  }

  personaManager.disableManager();
  managerCheckin.disable();
  bot.sendMessage(chatId, '⏸️ Manager disabled. No more check-ins.');
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
  if (text && text.startsWith('/')) {
    return;
  }

  // Check if this is Naval persona topic
  if (messageThreadId === 970) {
    const naval = personaManager.getPersona('naval');
    await personaManager.handlePersonaMessage(bot, naval, chatId, messageThreadId, text, userId);
    return;
  }

  // Determine thread context ID
  const contextId = messageThreadId ? `${chatId}-${messageThreadId}` : `${chatId}`;

  // Save user message to context
  contextManager.addMessage(contextId, 'user', text);

  // Try to parse as JSON task
  try {
    const task = JSON.parse(text);

    // Validate task structure
    if (!task.task_id || !task.type) {
      const errorMsg = '❌ Invalid task format. Missing task_id or type.';
      bot.sendMessage(chatId, errorMsg, {
        message_thread_id: messageThreadId
      });
      contextManager.addMessage(contextId, 'assistant', errorMsg);
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
    const errorMsg = `❌ Error: ${error.message}`;
    bot.sendMessage(chatId, errorMsg, {
      message_thread_id: messageThreadId
    });
    contextManager.addMessage(contextId, 'assistant', errorMsg);
  }
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', () => {
  console.log('Shutting down OpenClaw bot...');

  // Commit session before shutdown (Proactive Agent)
  sessionManager.commitSession().then(() => {
    console.log('Session committed');
    bot.stopPolling();
    process.exit(0);
  }).catch(err => {
    console.error('Error committing session:', err);
    bot.stopPolling();
    process.exit(1);
  });
});
