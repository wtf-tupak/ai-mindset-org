# OpenClaw — Telegram Bot Infrastructure

**Personal Corp Infrastructure Layer**

OpenClaw is a Telegram bot that receives tasks from Claude Code, executes them in parallel threads, and reports results back.

---

## Architecture

```
Claude Code (Supervisor)
    ↓ (via Telegram MCP)
OpenClaw Bot
    ├── Task Handler (receives tasks)
    ├── Thread Manager (parallel execution)
    └── Executors
        ├── Agent Executor (Claude Code agents)
        ├── Bash Executor (shell commands)
        └── GitHub Executor (gh CLI)
```

---

## Setup

### 1. Install Dependencies

```bash
cd openclaw
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
CLAUDE_CODE_USER_ID=your_telegram_user_id
```

**Get Bot Token:**
1. Message @BotFather on Telegram
2. Send `/newbot`
3. Follow instructions
4. Copy token to `.env`

**Get User ID:**
1. Message @userinfobot on Telegram
2. Copy your user ID to `.env`

### 3. Start Bot

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

---

## Usage

### From Telegram

Send JSON task to bot:

```json
{
  "task_id": "123",
  "type": "agent",
  "agent": "prompt-architect",
  "prompt": "Write a post about email marketing",
  "context": {}
}
```

### From Claude Code (via Telegram MCP)

```javascript
// Send task via Telegram MCP
mcp__telegram__send_self(JSON.stringify({
  task_id: "uuid",
  type: "agent",
  agent: "business-analyst",
  prompt: "Analyze retail process",
  context: { domain: "retail" }
}))

// Receive result via Telegram MCP callback
```

---

## Task Types

### Agent Task

Execute Claude Code agent via invoke.py:

```json
{
  "task_id": "uuid",
  "type": "agent",
  "agent": "prompt-architect",
  "prompt": "Write a post about X",
  "context": { "style": "casual" }
}
```

### Bash Task

Execute shell command:

```json
{
  "task_id": "uuid",
  "type": "bash",
  "command": "git status",
  "options": { "cwd": "/path/to/repo" }
}
```

### GitHub Task

Execute GitHub operation via gh CLI:

```json
{
  "task_id": "uuid",
  "type": "github",
  "operation": "create_issue",
  "repo": "owner/repo",
  "data": {
    "title": "Issue title",
    "body": "Issue body",
    "labels": ["bug"]
  }
}
```

---

## Commands

- `/start` — Show welcome message
- `/status` — Show active threads
- `/help` — Show help

---

## Thread Management

Each task runs in a separate thread:
- Parallel execution supported
- Thread status tracked
- Auto-cleanup after 1 hour

---

## Integration with Claude Code

### Via Telegram MCP Server

**Prerequisites:**
- Telegram MCP server configured in `~/.claude/mcp.json`
- Bot token and user ID set

**Flow:**
1. Claude Code sends task JSON via `mcp__telegram__send_self`
2. OpenClaw receives, creates thread, executes
3. OpenClaw sends result JSON back via `mcp__telegram__send_self`
4. Claude Code receives result, continues workflow

---

## Development

### Project Structure

```
openclaw/
├── server.js              # Main bot entry point
├── handlers/
│   ├── task-handler.js    # Task routing and execution
│   └── thread-manager.js  # Thread lifecycle management
├── executors/
│   ├── agent-executor.js  # Claude Code agent invocation
│   ├── bash-executor.js   # Shell command execution
│   └── github-executor.js # GitHub API operations
├── package.json
├── .env.example
└── README.md
```

### Adding New Executor

1. Create `executors/my-executor.js`
2. Implement `execute(task)` method
3. Add to `task-handler.js` switch statement
4. Update task type documentation

---

## Deployment

### Local (systemd)

Create `/etc/systemd/system/openclaw.service`:

```ini
[Unit]
Description=OpenClaw Telegram Bot
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/openclaw
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable openclaw
sudo systemctl start openclaw
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t openclaw .
docker run -d --env-file .env openclaw
```

---

## Troubleshooting

**Bot not responding:**
- Check bot token in `.env`
- Verify bot is running: `ps aux | grep node`
- Check logs for errors

**Unauthorized errors:**
- Verify your Telegram user ID in `.env`
- Message @userinfobot to get correct ID

**Agent execution fails:**
- Check `agents/orchestrator/scripts/invoke.py` exists
- Verify Python is installed
- Check agent.json files exist for agents

---

## Future Enhancements

- [ ] Full Claude Code API integration (currently stub)
- [ ] Result caching and persistence
- [ ] Task queue with priority
- [ ] Webhook mode (instead of polling)
- [ ] Multi-user support with permissions
- [ ] Task scheduling and cron
- [ ] Metrics and monitoring

---

**Version:** 1.0.0  
**License:** MIT  
**Part of:** Personal Corp Infrastructure
