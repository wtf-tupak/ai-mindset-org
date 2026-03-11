---
name: pos-morning
description: Morning brief pipeline — auto-detects your MCP servers, gathers calendar + tasks + sessions + vault state, synthesizes ONE focus sentence. Three output modes.
version: 2.0
user_invocable: true
arguments:
  - name: style
    description: "Output style: brief (default), full, telegram"
    required: false
---

# POS Morning — Daily Brief Pipeline

Generate a morning brief by auto-detecting your integrations, gathering context from every available source, and synthesizing it into a focused daily brief. Works with zero setup — adapts to whatever you have.

## Step 0: Detect Available Integrations

Read MCP configuration to know what's available BEFORE gathering data.

```bash
cat ~/.claude/mcp.json 2>/dev/null
```

Build an integrations map from configured servers:

| Server | Capability | Loader |
|--------|-----------|--------|
| krisp | Calendar, meetings | `ToolSearch: "+krisp meetings"` |
| linear | Tasks, projects | `ToolSearch: "+linear list_issues"` |
| telegram | Messaging (send brief) | `ToolSearch: "+telegram send"` |
| notion | Notes, databases | `ToolSearch: "+notion search"` |
| filesystem | Extended file access | `ToolSearch: "+filesystem read"` |

**Only ToolSearch servers you found in mcp.json.** Don't guess — if it's not configured, don't try to load it.

## Step 1: Gather Context

Try each source in the degradation chain. **Skip silently** if unavailable — never error, never ask the user to install something.

### 1.1 Calendar

**Degradation chain** (try in order, stop at first success):

1. **Krisp MCP** (if detected in Step 0):
   ```
   ToolSearch: "+krisp meetings"
   mcp__krisp__list_upcoming_meetings
   ```

2. **Google Calendar script** (if exists):
   ```bash
   GCAL_SCRIPTS=(
     "$HOME/.claude/scripts/gcal-smart.sh"
     "$HOME/.claude/scripts/gcal.sh"
   )
   for script in "${GCAL_SCRIPTS[@]}"; do
     [ -x "$script" ] && "$script" today && break
   done
   ```

3. **Skip** — note "no calendar connected" in output.

### 1.2 Tasks

**Degradation chain:**

1. **Linear MCP** (if detected):
   ```
   ToolSearch: "+linear list_issues"
   mcp__linear__list_issues(assignee: "me", status: "started")
   mcp__linear__list_issues(assignee: "me", status: "unstarted")
   ```

2. **Linear cache** (memory file):
   ```bash
   # Find most recent linear-tracking.md
   find ~/.claude/projects -name "linear-tracking.md" -type f 2>/dev/null | head -1
   ```
   Read and extract cached task list.

3. **Local TODO files**:
   ```bash
   find . -maxdepth 2 -name "TODO.md" -o -name "tasks.md" -o -name "TODO" 2>/dev/null | head -3
   ```

4. **Skip** — note "no task source connected".

### 1.3 Messages (optional)

**Only if Telegram MCP detected:**
```
ToolSearch: "+telegram get_messages"
mcp__telegram__telegram_get_messages(dialog: "me", limit: 5)
```

Extract recent saved messages as context clues for what the user was thinking about.

### 1.4 Recent Sessions

```bash
# Create marker for "today"
touch -t $(date +%Y%m%d)0000 /tmp/pos-today-marker 2>/dev/null

# Find today's sessions
find ~/.claude/projects -name "*.jsonl" -newer /tmp/pos-today-marker -maxdepth 3 2>/dev/null | head -5

# If nothing today, try yesterday
YESTERDAY=$(date -v-1d +%Y%m%d 2>/dev/null || date -d "yesterday" +%Y%m%d 2>/dev/null)
touch -t ${YESTERDAY}0000 /tmp/pos-yesterday-marker 2>/dev/null
find ~/.claude/projects -name "*.jsonl" -newer /tmp/pos-yesterday-marker -maxdepth 3 2>/dev/null | head -5
```

For each session found, read the first 20 and last 20 lines to extract:
- Project name (from path)
- Topic (from first user message)
- Tools used (count of tool calls)

### 1.5 Vault State (optional)

If working directory contains markdown files:

```bash
# Recently modified files (last 12 hours)
find . -name "*.md" -mmin -720 \
  -not -path "./.obsidian/*" \
  -not -path "./.trash/*" \
  -not -path "./.smart-env/*" \
  -not -path "./node_modules/*" \
  2>/dev/null | head -10
```

## Step 2: Synthesize

### FOCUS derivation

This is the most important output. Derive ONE sentence from ALL gathered context:

1. Look at today's calendar — what's the biggest commitment?
2. Look at in-progress tasks — what's most urgent or overdue?
3. Look at yesterday's sessions — what was the user working on?
4. Combine into: **"[Action verb] [specific thing] [by when/why]"**

Example: "Finalize workshop slides before 14:00 WS04 session"
Example: "Close 3 overdue Linear tasks — sprint ends Friday"
Example: "No calendar today — deep work on dashboard generator"

### Output structure

```
┌─────────────────────────────────────────────────┐
│  MORNING BRIEF · {weekday} {date}               │
│  sources: {list of what connected}              │
└─────────────────────────────────────────────────┘

  FOCUS
  > {main priority — 1 sentence derived from all context}

  CALENDAR ({count} events)
  ├─ {time}  {event title}
  ├─ {time}  {event title}
  └─ {time}  {event title}

  TASKS ({count} in progress · {count} todo)
  ├─ {id}  {title}                           {status}
  ├─ {id}  {title}                           {status}
  └─ +{N} more in backlog

  YESTERDAY
  > {1-2 sentences: what you worked on based on recent sessions}

  OBSERVATIONS
  · {insight about today's schedule — conflicts, gaps, free blocks}
  · {suggestion based on overdue tasks or upcoming deadlines}
  · {pattern: "you've worked on X for 3 sessions — close it today?"}
```

## Step 3: Output Format

### brief (default)
The format above, printed to terminal.

### full
Same as brief + additional sections:

```
  RECENT FILES ({count})
  ├─ {filename}  {modified time ago}
  └─ {filename}  {modified time ago}

  SAVED MESSAGES
  ├─ {preview of recent telegram saved message}
  └─ {preview}

  INTEGRATIONS STATUS
  ├─ calendar     {krisp|gcal|none}
  ├─ tasks        {linear|cache|local|none}
  ├─ messaging    {telegram|none}
  └─ sessions     {N found}
```

### telegram
Compact version sent to Saved Messages (only if Telegram MCP detected):

```
#morning {weekday}

focus: {main priority}

{time} {event}
{time} {event}

tasks: {count} IP · {count} todo
· {most important task}
· {second task}

> {one observation}
```

Send via:
```
ToolSearch: "+telegram send_self"
mcp__telegram__telegram_send_self(message: "{formatted brief}")
```

If Telegram MCP not available, fall back to `brief` mode and note: "telegram not connected — showing in terminal".

## Principles

- **Graceful degradation**: works with 0 integrations (minimal brief) up to full stack (rich brief)
- **Never error on missing source**: skip silently, note what connected in header
- **Opinionated focus**: ALWAYS synthesize ONE main focus — this is the core value
- **Fast**: no background agents needed — direct tool calls only, under 30 seconds
- **No setup required**: auto-detects everything from `~/.claude/mcp.json` and filesystem

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| ToolSearch for MCP not in config | Only ToolSearch servers found in `~/.claude/mcp.json` |
| Generic focus like "have a productive day" | Focus MUST be specific — action + object + deadline/reason |
| Showing raw JSONL content | Extract topic from first user message, not dump raw JSON |
| Failing when no calendar exists | Skip silently — a brief with just tasks is still useful |
| Using hardcoded MCP tool names | Always ToolSearch first — tool names vary across setups |
| Trying to send telegram without checking | Check Step 0 map — only send if telegram server detected |
| Reading entire JSONL session files | First 20 + last 20 lines is enough for topic extraction |
