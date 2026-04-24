# OpenClaw Setup — Complete

## ✅ Что сделано

### 1. Forum Topic
- **Group ID**: `-1001979197532`
- **Topic ID**: `963`
- **Topic name**: `pos-print`
- **Status**: ✅ Created and configured

### 2. Bot Configuration
- Forum support enabled
- Webhook server running on port 3000
- Bot responds in forum topics
- Task execution works

### 3. GitHub Webhook (Pending)
- Webhook endpoint ready: `/webhook/github`
- Secret generated: `bf8a5106271d617825dfe0a50f2784cba15cb8713103d147d5718b676f920942`
- Local test passed ✅
- **Needs**: Public URL for GitHub to reach webhook

## 🔧 Next Steps

### Option A: ngrok (Quick Test)

```bash
# Install ngrok
choco install ngrok

# Start tunnel
ngrok http 3000

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Add webhook in GitHub:
# https://github.com/wtf-tupak/ai-mindset-org/settings/hooks/new
```

### Option B: Deploy to Cloud

Deploy OpenClaw to:
- Railway: https://railway.app
- Render: https://render.com
- Fly.io: https://fly.io

Then configure webhook with deployment URL.

### Option C: Manual Webhook Setup

1. Go to: https://github.com/wtf-tupak/ai-mindset-org/settings/hooks/new
2. Configure:
   - **Payload URL**: `https://your-public-url.com/webhook/github`
   - **Content type**: `application/json`
   - **Secret**: `bf8a5106271d617825dfe0a50f2784cba15cb8713103d147d5718b676f920942`
   - **Events**: Select "Issues" only
   - **Active**: ✓
3. Save webhook

## 🧪 Testing

### Test Forum Task
```json
{
  "task_id": "test-1",
  "type": "bash",
  "command": "echo 'Hello from forum'"
}
```
Send to topic 963 in group -1001979197532

### Test GitHub Webhook (Local)
```bash
curl -X POST http://localhost:3000/webhook/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -d '{"action":"opened","issue":{"number":21,"title":"Test","html_url":"https://github.com/wtf-tupak/ai-mindset-org/issues/21"},"repository":{"full_name":"wtf-tupak/ai-mindset-org"}}'
```

## 📊 Status

| Component | Status | Notes |
|-----------|--------|-------|
| Forum group | ✅ | -1001979197532 |
| Forum topic | ✅ | 963 (pos-print) |
| Bot running | ✅ | Port 3000 |
| Task execution | ✅ | Tested with bash |
| Webhook endpoint | ✅ | /webhook/github |
| GitHub webhook | ⏳ | Needs public URL |

## 🎯 Summary

**Core functionality complete:**
- ✅ Telegram bot with forum support
- ✅ Task execution in topics
- ✅ GitHub webhook handler ready
- ⏳ Waiting for public URL to complete GitHub integration

**To finish:**
Choose Option A, B, or C above to expose webhook publicly.
