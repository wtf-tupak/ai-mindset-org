---
project: pos-print
area: personal-corp
type: cli-visualization
owner: wtf-tupak
---

# pos-print — Personal Corp Output Layer

**Role**: Output/Reports — CLI visualization and terminal aesthetic
**Type**: Generator (artifacts: dashboards, reports, terminal graphics)
**Stack**: Python, CLI, terminal graphics

---

## Personal Corp Context

This repo is part of **Personal Corp** — AI-native management system.

**Agent Role**: Code Agent (implementation + output generation)
**Primary Output**: Terminal-formatted dashboards, HTML reports, CLI tools

---

## Conventions

- **Output**: terminal-formatted with box-drawing characters
- **Style**: monospace-first, dark theme, green accent (#55aa88)
- **Naming**: hyphenated lowercase for commands

---

## File Patterns

- `*.py` — source code
- `*.md` — documentation, rules, guides
- `pos-*.html` — generated dashboards

---

## Personal Corp Commands

**Orchestration:**
- `/orchestrator` — Project health dashboard
- `/standup-prep` — Daily standup from GitHub Issues
- `/weekly-planning` — Plan week outcomes
- `/weekly-retro` — Retrospective

**Workflow:**
- `/task-routing` — Create issue in correct repo
- `/gh-issues` — Manage GitHub issues
- Comment `/plan` in issue — Auto-decompose

**Session:**
- `/session-save` — Save context
- `/continue-session` — Restore context

---

## Task Routing

**This repo receives:**
- Print, terminal, dashboard, CLI issues
- HTML/CSS output tasks
- Visualization features

**Route to other repos:**
- `pos-sprint` — skills, infrastructure, audit, MCP, memory
- `pos-offer` — offers, proposals, client work

---

## Issue Labels (Personal Corp)

| Label | State | Meaning |
|-------|-------|---------|
| `spec` | Requirements | Needs clarification |
| `plan` | Planning | Ready for decomposition |
| `ready` | Ready | Can start implementation |
| `in-progress` | Active | Currently being worked on |
| `review` | Review | PR open, needs review |
| `blocked` | Blocked | Blocked, needs attention |
| `done` | Complete | Merged to main |
| `epic` | Meta | Multi-sprint initiative |

**Prefixes:** `feat:` | `fix:` | `ops:` | `research:` | `content:`

---

## Context (GitHub Issues)

**Project Context Issue:** Check `/orchestrator` for current project state

**Creating Issues:**
```bash
gh issue create --title "feat: ..." --label spec
```

**Updating:**
```bash
gh issue edit {n} --add-label in-progress --remove-label ready
gh issue comment {n} --body "Progress: ..."
```

---

## Commit Convention

Every commit references issue:

```
feat: add dashboard widget (#42)
fix: resolve auth flow (#67)
refactor: extract utility per (#88) plan
```

**Pattern**: `{type}: {description} (#{issue-number})`

---

## Workflow Integration

**Session Start:**
- Hook shows in-progress issues automatically
- Use `/gh-issues list --label in-progress`

**During Work:**
- Create issue before starting work
- Reference issue in commits: `(#N)`
- Comment `/plan` for decomposition
- Comment `/specify` for clarification

**Session End:**
- Update issue with progress
- If done: `gh issue close {n} -c "Done in {commit}"`
- If handoff: `/session-save` + comment in issue

---

## Notes

- Part of Personal Corp framework
- See `~/.claude/CLAUDE.md` for global rules
- Dashboard: `~/Desktop/pos-dashboard.html`
- AGENTS.md is the project index

◇ ctx: — | — left | —% | ●
▫ gh: pos-print — Personal Corp Output Layer
