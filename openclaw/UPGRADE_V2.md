# OpenClaw v2.0 — Proactive, Adaptive, Multi-Agent

**Status:** ✅ Complete  
**Date:** 2026-04-25

---

## What Was Built

### 1. Proactive Engine ✅

**Components:**
- `proactive/proactive-engine.js` - Core orchestration engine
- `proactive/monitors/github-monitor.js` - Tracks GitHub issue activity
- `proactive/triggers/issue-trigger.js` - Triggers suggestions on issue events

**Features:**
- Monitors GitHub issues via webhooks
- Suggests `/plan` when issue opened
- Suggests `/implement` when issue labeled "ready"
- Suggests decomposition for epics
- Tracks issue activity and staleness

**Integration:**
- Connected to `github-webhook-handler.js`
- Feeds events to monitors and triggers
- Sends proactive messages to Telegram

---

### 2. Adaptive Learning System ✅

**Components:**
- `adaptive/feedback-collector.js` - Collects user reactions and edits
- `adaptive/preference-store.js` - Stores learned preferences (persistent)
- `adaptive/prompt-adapter.js` - Adapts prompts based on preferences

**Features:**
- Learns from user feedback (✅/❌ reactions)
- Tracks message edits as corrections
- Stores preferences: tone, verbosity, language
- Adapts persona prompts dynamically
- Decays old preferences over time

**Integration:**
- Connected to `persona-manager.js`
- Stores feedback in `context-manager.js` metadata
- Persists to `data/preferences.json`

---

### 3. Multi-Agent Coordinator ✅

**Components:**
- `agents/registry.js` - Agent definitions and capabilities
- `agents/coordinator.js` - Orchestrates multi-step workflows
- `agents/delegation.js` - Agent-to-agent task delegation

**Agents:**
- `spec-agent` - Requirements clarification
- `plan-agent` - Task decomposition
- `code-agent` - Implementation
- `review-agent` - Code review

**Workflows:**
- `implement` - Full workflow: spec → plan → code → review
- `spec` - Requirements only
- `plan` - Spec + planning

**Integration:**
- Connected to `task-handler.js`
- New task type: `workflow`
- Shared context via `context-manager.js`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenClaw v2.0                           │
│                 Proactive · Adaptive · Multi-Agent          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
   │Proactive│          │ Adaptive  │        │Multi-Agent│
   │ Engine  │          │  System   │        │Coordinator│
   └────┬────┘          └─────┬─────┘        └─────┬─────┘
        │                     │                     │
   ┌────▼────────┐      ┌─────▼──────┐       ┌─────▼──────┐
   │GitHub       │      │Feedback    │       │4 Specialized│
   │Monitor      │      │Collector   │       │Agents       │
   │IssueTrigger │      │Preferences │       │Registry     │
   └─────────────┘      └────────────┘       └────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐          ┌─────▼─────┐        ┌─────▼─────┐
   │ Context │          │  Persona  │        │   Task    │
   │ Manager │          │  Manager  │        │  Handler  │
   └─────────┘          └───────────┘        └───────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Telegram Bot    │
                    │   GitHub Actions  │
                    └───────────────────┘
```

---

## Files Created (15)

**Proactive (3):**
- `openclaw/proactive/proactive-engine.js`
- `openclaw/proactive/monitors/github-monitor.js`
- `openclaw/proactive/triggers/issue-trigger.js`

**Adaptive (3):**
- `openclaw/adaptive/feedback-collector.js`
- `openclaw/adaptive/preference-store.js`
- `openclaw/adaptive/prompt-adapter.js`

**Multi-Agent (3):**
- `openclaw/agents/registry.js`
- `openclaw/agents/coordinator.js`
- `openclaw/agents/delegation.js`

**Documentation (1):**
- `openclaw/UPGRADE_V2.md` (this file)

---

## Files Modified (5)

- `openclaw/server.js` - Initialize all 3 systems
- `openclaw/handlers/task-handler.js` - Add workflow task type
- `openclaw/handlers/persona-manager.js` - Use adaptive prompts
- `openclaw/handlers/context-manager.js` - Enhanced metadata methods
- `openclaw/handlers/github-webhook-handler.js` - Feed events to proactive engine

---

## Usage Examples

### 1. Proactive Suggestions

**Scenario:** Create GitHub issue

```bash
gh issue create --repo wtf-tupak/ai-mindset-org --title "Add feature X" --body "Description"
```

**Result:** Bot sends proactive message in Telegram:
```
🤖 Proactive Suggestion

New issue detected: Add feature X (#42)

💡 Suggestions:
• Use /plan to decompose into sub-tasks
• Use /specify to clarify requirements
• Add labels: spec, plan, ready

🔗 View Issue
```

---

### 2. Adaptive Learning

**Scenario:** Chat with Naval persona

```
User: Tell me about wealth
Naval: Seek wealth, not money or status...
User: [reacts with ✅]
```

**Result:** System learns user likes this style, reinforces preferences

**Scenario:** User edits bot message

```
Bot: "Here is a very long detailed response..."
User: [edits to shorter version]
```

**Result:** System learns user prefers brevity, adjusts verbosity preference

---

### 3. Multi-Agent Workflow

**Scenario:** Send workflow task

```json
{
  "task_id": "test-workflow-1",
  "type": "workflow",
  "workflow": "implement",
  "prompt": "Add user authentication feature",
  "context": {}
}
```

**Result:** Coordinator executes:
1. Spec agent asks clarifying questions
2. Plan agent creates implementation plan
3. Code agent implements feature
4. Review agent reviews code

Each step sees previous step's output.

---

## Testing

### Test 1: Proactive Engine

```bash
# Create issue
gh issue create --repo wtf-tupak/ai-mindset-org --title "Test proactive" --body "Test"

# Expected: Proactive suggestion in Telegram topic 963
```

### Test 2: Adaptive System

```bash
# In Telegram, chat with Naval (topic 970)
# React with ✅ or ❌ to messages
# Check preferences: openclaw/data/preferences.json
```

### Test 3: Multi-Agent Workflow

```bash
# In Telegram topic 963, send:
{
  "task_id": "test-1",
  "type": "workflow",
  "workflow": "plan",
  "prompt": "Add dashboard widget",
  "context": {}
}

# Expected: Spec agent → Plan agent workflow execution
```

---

## Configuration

### Environment Variables

No new env vars required. Uses existing:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_FORUM_GROUP_ID`
- `TELEGRAM_FORUM_TOPIC_ID`
- `OMNIROUTE_API_KEY` (for personas)

### Data Storage

- Preferences: `openclaw/data/preferences.json` (auto-created)
- Context: In-memory (existing)
- Feedback: In-memory + context metadata

---

## Key Features

### Proactive
- ✅ Event-driven (not polling)
- ✅ GitHub issue monitoring
- ✅ Smart suggestions (not spam)
- ✅ Extensible (add more monitors/triggers)

### Adaptive
- ✅ Learns from reactions
- ✅ Learns from edits
- ✅ Persistent preferences
- ✅ Automatic decay
- ✅ Per-user customization

### Multi-Agent
- ✅ 4 specialized agents
- ✅ 3 predefined workflows
- ✅ Shared context
- ✅ Sequential execution
- ✅ Delegation support

---

## Next Steps (Optional)

1. **More Monitors:**
   - `context-monitor.js` - Detect conversation patterns
   - `schedule-monitor.js` - Time-based triggers

2. **More Triggers:**
   - `stale-trigger.js` - Remind on stale issues
   - `daily-trigger.js` - Daily standup

3. **More Agents:**
   - `test-agent` - Write tests
   - `deploy-agent` - Deploy code
   - `docs-agent` - Write documentation

4. **Enhanced Adaptive:**
   - A/B testing different approaches
   - ML-based preference prediction
   - Cross-user learning

5. **Workflow Improvements:**
   - Parallel agent execution
   - Conditional workflows
   - User approval gates

---

## Comparison: v1.0 vs v2.0

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Behavior** | Reactive only | Proactive + Reactive |
| **Learning** | None | Adaptive from feedback |
| **Agents** | Single execution | Multi-agent workflows |
| **Personas** | Static prompts | Dynamic, adapted prompts |
| **GitHub** | Notifications only | Proactive suggestions |
| **Context** | Basic storage | Enhanced with metadata |
| **Preferences** | None | Persistent, per-user |

---

## Success Criteria

✅ Proactive engine monitors GitHub and suggests actions  
✅ Adaptive system learns from user feedback  
✅ Multi-agent coordinator executes workflows  
✅ All systems integrated with existing infrastructure  
✅ No breaking changes to v1.0 functionality  
✅ Backward compatible (old task types still work)  

---

**OpenClaw v2.0 — Proactive, Adaptive, Multi-Agent** 🚀
