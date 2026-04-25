# Tools — Configurations, Gotchas, Credentials

**Last Updated:** 2026-04-25

---

## GitHub CLI (gh)

**Common Commands:**
```bash
gh issue list --repo wtf-tupak/ai-mindset-org --state open
gh issue view 16 --repo wtf-tupak/ai-mindset-org
gh issue comment 16 --body "Client #1 signed!" --repo wtf-tupak/ai-mindset-org
```

**Gotcha:** Always specify `--repo` to avoid wrong repo context.

---

## Telegram Bot API

**Bot Token:** 5680963530:AAHeAdg7nxTZ6rjyflUUAPVQNySl6Ctb5bE

**User ID:** 690174481 (Dmitry)

**Forum Group:** -1001979197532

**Topics:**
- 963: pos-print (tasks)
- 970: Naval/Manager (AI personas)
- 972: system (token summaries)

**Gotcha:** Forum topics require `message_thread_id` parameter.

---

## OmniRoute (Local LLM)

**Endpoint:** http://localhost:20128/v1

**Model:** kr/claude-sonnet-4.5

**API Key:** sk-bf075ef7c270fb7b-69da5d-0b093933

**Format:** OpenAI-compatible (NOT Anthropic API)

**Gotcha:** Check if running with `curl http://localhost:20128/v1/models`

---

## Node.js / npm

**Location:** ~/Desktop/pos-print/openclaw/

**Start:** `npm start`

**Gotcha:** Port 3000 often in use, kill process first.

---

## Process Management

**PID file:** /tmp/openclaw.pid

**Log file:** /tmp/openclaw.log

**Check status:** `ps -p $(cat /tmp/openclaw.pid)`

**View logs:** `tail -20 /tmp/openclaw.log`

---

*Updated as new tools are added.*
