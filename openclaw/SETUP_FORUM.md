# OpenClaw Forum Setup Guide

## Step 1: Create Telegram Forum Group

1. Open Telegram
2. Create new group: "OpenClaw Tasks" (or your preferred name)
3. Go to group settings → Enable "Topics"
4. Get group ID:
   - Add bot @userinfobot to the group
   - Forward any message from the group to @userinfobot
   - Copy the group ID (negative number, e.g., `-1001234567890`)

## Step 2: Add Bot to Group

1. Add your OpenClaw bot to the forum group
2. Make bot an admin:
   - Group settings → Administrators → Add Administrator
   - Select your bot
   - Enable: "Post Messages", "Delete Messages", "Manage Topics"

## Step 3: Create Topic for Your Project

1. In the forum group, create new topic: "pos-print" (or your project name)
2. Get topic ID:
   - Send any message in the topic
   - Forward that message to @userinfobot
   - Copy the `message_thread_id` value

## Step 4: Update .env

Edit `openclaw/.env`:

```env
TELEGRAM_BOT_TOKEN=5680963530:AAHeAdg7nxTZ6rjyflUUAPVQNySl6Ctb5bE
CLAUDE_CODE_USER_ID=690174481

# Forum configuration
TELEGRAM_FORUM_GROUP_ID=-1001234567890
TELEGRAM_FORUM_TOPIC_ID=123

# GitHub webhook
WEBHOOK_PORT=3000
GITHUB_WEBHOOK_SECRET=your_random_secret_here
```

Generate webhook secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 5: Restart Bot

```bash
cd openclaw
npm start
```

Verify in logs:
```
OpenClaw bot started...
Allowed user ID: 690174481
Forum group ID: -1001234567890
Forum topic ID: 123
Webhook server listening on port 3000
```

## Step 6: Test Forum Integration

Send test task to the topic:

```json
{
  "task_id": "test-forum-1",
  "type": "bash",
  "command": "echo 'Hello from forum topic'"
}
```

Bot should respond in the same topic.

## Step 7: Setup GitHub Webhook

### Option A: Using ngrok (for local testing)

1. Install ngrok: https://ngrok.com/download
2. Start ngrok:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Option B: Deploy to server

Deploy OpenClaw to a server with public IP and use that URL.

### Configure GitHub Webhook

1. Go to your repo: https://github.com/wtf-tupak/pos-print/settings/hooks
2. Click "Add webhook"
3. Configure:
   - **Payload URL**: `https://your-domain.com/webhook/github` (or ngrok URL)
   - **Content type**: `application/json`
   - **Secret**: paste the value from `GITHUB_WEBHOOK_SECRET` in .env
   - **Events**: Select "Let me select individual events"
     - ✅ Issues
     - ❌ Uncheck all others
   - ✅ Active

4. Click "Add webhook"

## Step 8: Test GitHub Integration

1. Create test issue:
   ```bash
   gh issue create --repo wtf-tupak/pos-print --title "Test webhook" --body "Testing GitHub → Telegram"
   ```

2. Check forum topic — should see notification:
   ```
   🆕 Issue Opened

   Test webhook (#21)
   wtf-tupak/pos-print

   Testing GitHub → Telegram

   🔗 View Issue
   ```

3. Close issue:
   ```bash
   gh issue close 21
   ```

4. Check forum topic — should see:
   ```
   ✅ Issue Closed

   Test webhook (#21)
   ...
   ```

## Troubleshooting

**Bot not responding in topic:**
- Verify bot is admin in group
- Check `TELEGRAM_FORUM_TOPIC_ID` is correct
- Restart bot

**GitHub webhook not working:**
- Check webhook delivery in GitHub settings
- Verify `GITHUB_WEBHOOK_SECRET` matches
- Check bot logs for errors
- Test webhook URL: `curl -X POST https://your-domain.com/webhook/github`

**Wrong topic ID:**
- Forward message from topic to @userinfobot
- Use `message_thread_id` value, not `message_id`

## Next Steps

- Add more topics for different projects
- Configure multiple repos to same topic
- Add custom notification formatting
- Set up monitoring and alerts
