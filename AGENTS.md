---
project: personal-corp
type: agents-index
owner: wtf-tupak
area: pos-print
status: active
last_updated: 2026-04-21
---

# AGENTS.md — Personal Corp Agent Registry

Main registry. Maps agents, skills, repos in Personal Corp system.

---

## 📍 Personal Corp Context

| Component | Location | Status |
|-----------|----------|--------|
| Global Framework | `~/.claude/CLAUDE.md` | Personal Corp v1.0 ✓ |
| Project Rules | `./CLAUDE.md` | pos-print rules ✓ |
| Agent Registry | `./AGENTS.md` | active ✓ |
| Skills Library | `~/.claude/skills/` | 15+ skills ✓ |
| Hooks | `~/.claude/hooks.json` | 6 active ✓ |

---

## 🔌 MCP Servers

| Server | Category | Status |
|--------|----------|--------|
| gcal | calendar | ✓ loaded |

**Note**: Personal Corp uses GitHub Issues (not Linear) for task management.

**Config:** `~/.claude/mcp.json`

---

## 🛠️ Personal Corp Skills

**Location:** `~/.claude/skills/`

### Orchestration
| Skill | Pattern | Description |
|-------|---------|-------------|
| /orchestrator | Manager | Project health, assignments |
| /standup-prep | Pipeline | Daily standup from GitHub Issues |
| /weekly-planning | Pipeline | Weekly outcomes planning |
| /weekly-retro | Pipeline | Retrospective |

### Workflow
| Skill | Pattern | Description |
|-------|---------|-------------|
| /task-routing | Integrator | Route issues to correct repo |
| /gh-issues | Integrator | GitHub Issues management |
| /issue-ops | Handler | Process /plan, /specify, /tasks, /implement |

### Session
| Skill | Pattern | Description |
|-------|---------|-------------|
| /session-save | Pipeline | Save session context |
| /continue-session | Integrator | Restore session |
| /compress | Generator | Compress context for handoff |

### Infrastructure
| Skill | Pattern | Description |
|-------|---------|-------------|
| /pos-audit | Audit | Infrastructure scanner |
| /pos-morning | Pipeline | Morning brief |
| /pos-dashboard-gen | Generator | HTML dashboard |
| /project-init | Pipeline | Initialize new project |

---

## ⚡ Personal Corp Hooks

**Config:** `~/.claude/hooks.json` (6 active)

| Hook | Trigger | Purpose |
|------|---------|---------|
| github-issues-startup | SessionStart | Show in-progress issues on session start |
| issue-ops-handler | PostToolUse:Bash | Detect /plan, /specify, /tasks, /implement |
| github-issues-push | PostToolUse:Bash | Remind to update issues after git push |
| ambient-research | SessionStart | Background research on strategic topics |
| obsidian-open | PostToolUse:Write | Auto-open .md files in Obsidian |
| session-log | SessionEnd | Log session summary |

---

## 🧠 Personal Corp Memory

| Type | Location | Status |
|------|----------|--------|
| Auto-memory | `~/.claude/projects/{project}/memory/` | 2 session files |
| Sessions | `~/.claude/projects/{project}/memory/sessions/` | on demand |
| GitHub Context | Issues + comments | primary source |

**Principle:** GitHub Issues are the source of truth, not local files.

---

## 📊 Dashboard

| Artifact | Path | Update |
|----------|------|--------|
| HTML Dashboard | `~/Desktop/pos-dashboard.html` | `/pos-dashboard-gen` |
| GitHub Project | https://github.com/users/wtf-tupak/projects/1 | Manual |

**Features:** live clock, skill chips, metrics grid, terminal aesthetic

**Commands:**
- `/pos-dashboard-gen` — Regenerate dashboard
- `/orchestrator` — Project health
- `/standup-prep` — Daily standup
- `gh project view 1 --owner wtf-tupak` — View board

---

## 📋 Session Rules

| Rule | Limit | Action |
|------|-------|--------|
| Context ○ CRIT | >70% | Emergency handoff |
| Context ◐ WARN | 50-70% | `/session-save` |
| Turns | 20-25 | `/compact` or new session |
| Subagents | 2+ | Parallel execution |
| Long tasks | — | `run_in_background: true` |

### Quick Commands

```bash
/session-save {name}     # save context
/continue {name}         # restore
/compact                 # compress
/standup-prep            # daily standup
/orchestrator            # project health
```

---

## 🚀 Personal Corp Daily Workflow

```
┌─ Morning ──────────────────────────┐
│ 1. Session starts                   │
│    → Hook shows in-progress issues  │
│                                     │
│ 2. /standup-prep                    │
│    → Yesterday / Today / Blockers     │
│    → Pick 1-2 issues to work on     │
├─ Work ─────────────────────────────┤
│ 3. Create/issue select              │
│    → /task-routing for new work     │
│    → /gh-issues view {n} for context│
│                                     │
│ 4. Comment /plan or /specify        │
│    → Auto-decomposition             │
│    → Sub-issues created             │
│                                     │
│ 5. Work on issue                    │
│    → Commit with (#N) reference     │
│    → Hook reminds on git push       │
├─ Evening ──────────────────────────┤
│ 6. Update issues                    │
│    → Comment progress               │
│    → Close if done                  │
│    → /session-save for handoff      │
│                                     │
│ 7. /orchestrator (optional)         │
│    → Check project health           │
└─────────────────────────────────────┘
```

**Weekly:** /weekly-planning → work → /weekly-retro

---

## 📁 Personal Corp Directory Structure

```
~/.claude/
├── CLAUDE.md                 # Personal Corp framework (global)
├── settings.json             # env vars
├── hooks.json                # 6 active hooks
├── mcp.json                  # gcal calendar
├── skills/                   # Personal Corp skills
│   ├── orchestrator/         # Project health manager
│   ├── issue-ops/            # /plan /specify handler
│   ├── task-routing/         # Route to correct repo
│   ├── gh-issues/            # GitHub CLI wrapper
│   ├── standup-prep/         # Daily standup
│   ├── weekly-planning/      # Weekly outcomes
│   ├── weekly-retro/         # Retrospective
│   ├── session-save/         # Context handoff
│   ├── continue-session/     # Restore context
│   ├── compress/             # Context compression
│   ├── pos-audit/            # Infrastructure scan
│   ├── pos-morning/          # Morning brief
│   ├── pos-dashboard-gen/    # HTML dashboard
│   ├── pos-skill-factory/    # Create new skills
│   └── project-init/         # Initialize projects
├── hooks/                    # Hook scripts
│   ├── github-issues-startup.sh    # Show in-progress
│   ├── github-issues-push.sh      # Push reminders
│   ├── issue-ops-handler.sh       # Detect IssueOps
│   ├── ambient-research.sh        # Background research
│   ├── obsidian-open.sh           # Auto-open .md
│   └── session-log.sh             # Session logging
└── projects/                 # Project memory
    └── {project}/
        └── memory/
            ├── sessions/
            └── MEMORY.md

Repos (wtf-tupak/)
├── pos-print/          # Output layer (this repo)
├── pos-sprint/         # Infrastructure, skills
├── pos-offer/          # Offers, proposals
└── ai-mindset-org/     # Organization docs
```

---

## 🔗 Quick Links

| Resource | Path |
|----------|------|
| Dashboard | `~/Desktop/pos-dashboard.html` |
| Global Framework | `~/.claude/CLAUDE.md` |
| Project Rules | `./CLAUDE.md` |
| Skills | `~/.claude/skills/` |
| Hooks | `~/.claude/hooks.json` |
| This Registry | `./AGENTS.md` |

**GitHub:** https://github.com/wtf-tupak/

---

## 📝 Maintenance

- **Review frequency:** weekly
- **Owner:** wtf-tupak
- **Last updated:** 2026-04-21
- **Framework:** Personal Corp v1.0

---

*Personal Corp Agent Registry — GitHub Issues as the OS for AI agents*
