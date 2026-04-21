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

## File Routing Rules

**Organized by lifecycle, not topic.** Every file has one correct location.

| Location | Purpose | What Goes Here | ❌ Forbidden |
|----------|---------|----------------|------------|
| **ROOT/** | Canonical | Authoritative reference files only | Drafts, temp files, work artifacts |
| **research-corp/** | Discovery | Conventions, patterns, research, guides | Code, active work, deliverables |
| **work/** | Execution | Task artifacts by GitHub issue | Reference docs, canonical rules |
| **work/archive/** | Completed | Finished work by date | Active work, ongoing tasks |
| **skills/** | Reusable | Claude Code skills with SKILL.md | One-off scripts, drafts |
| **.github/** | Automation | CI/CD workflows, templates | Source code, docs |

### Detailed Routing

#### ROOT/ — Canonical Only

| File Type | Example | Action |
|-----------|---------|--------|
| ✅ AGENTS.md | Agent registry | Keep here |
| ✅ CLAUDE.md | Project rules | Keep here |
| ✅ README.md | Project overview | Keep here |
| ✅ STRUCTURE.md | Organization docs | Keep here |
| ❌ data.md | Work artifact | → work/issue-*/ |
| ❌ draft.md | Draft document | → work/issue-*/ or delete |
| ❌ notes.md | Personal notes | → work/issue-*/ |
| ❌ script.js | Work script | → work/issue-*/ |

#### research-corp/ — Research & Patterns

| File Type | Example | Location |
|-----------|---------|----------|
| ✅ naming-convention.md | File naming guide | research-corp/naming-convention/ |
| ✅ orchestration-rules.md | Model orchestration | research-corp/orchestration/ |
| ✅ context-storage.md | Architecture research | research-corp/context-storage/ |
| ✅ session-management.md | Protocol docs | research-corp/session-management/ |
| ❌ active-code.py | Working code | → work/issue-*/ |
| ❌ draft-proposal.md | Draft offer | → work/issue-*/ or pos-offer |

#### work/ — Active Execution

**Hard Rule:** No GitHub Issue = No file in work/

Every file in work/ must reference an issue:
- Folder name: `work/issue-{number}-{short-name}/`
- Files inside: artifacts for that specific issue
- No orphaned files allowed

```
work/
├── issue-2-agency-infra/     # GitHub issue #2
│   ├── data.md               # Artifacts for #2
│   └── product.md
├── issue-1-cmo-agent/        # GitHub issue #1
│   └── (artifacts for #1)
└── archive/                  # Completed issues
    └── 2026-04-21/           # By completion date
        └── issue-5-closed/   # Moved here when closed
```

| File Type | Example | Action |
|-----------|---------|--------|
| ✅ data.md | CFO dashboard data | work/issue-*/data.md |
| ✅ product.md | Product specs | work/issue-*/product.md |
| ✅ script.js | Working script | work/issue-*/script.js |
| ❌ orphaned.js | No issue reference | Create issue or delete |
| ❌ random.md | No issue reference | Create issue or move to ROOT/ |
| ❌ README.md | Project docs | → ROOT/ |
| ❌ convention.md | Pattern guide | → research-corp/ |

#### skills/ — Reusable Tools

| File Type | Example | Location |
|-----------|---------|----------|
| ✅ SKILL.md | Skill definition | skills/{name}/SKILL.md |
| ✅ script.py | Skill scripts | skills/{name}/scripts/ |
| ❌ one-off.js | Single use | → work/issue-*/ |
| ❌ draft.md | WIP skill | Finish or delete |

### Commit Message Routing

```
[canon]   → ROOT/ files updated (AGENTS.md, CLAUDE.md, etc.)
[research] → research-corp/ new patterns or updates
[work]     → work/ active task progress
[archive]  → work/archive/ completed work moved
```

### Quick Decision Tree

```
Is this file...
├── Authoritative reference? → ROOT/
├── Convention or pattern?   → research-corp/
├── Task artifact?           → work/issue-{n}/
├── Finished work?           → work/archive/{date}/
├── Reusable skill?          → skills/{name}/
└── CI/CD automation?        → .github/
```

### Violations

| Violation | Fix |
|-----------|-----|
| Draft in ROOT/ | Move to work/issue-*/ or delete |
| Convention in work/ | Move to research-corp/ |
| Work artifact in ROOT/ | Move to work/issue-*/ |
| Finished work in work/ | Move to work/archive/{date}/ |
| Random script in ROOT/ | Move to work/issue-*/ or skills/ |

---

## Repo Routing (Personal Corp)

**This repo receives:**
- Print, terminal, dashboard, CLI issues
- HTML/CSS output tasks
- Visualization features

**Route to other repos:**
- `pos-sprint` — skills, infrastructure, audit, MCP, memory
- `pos-offer` — offers, proposals, client work
- `ai-mindset-org` — strategy, CEO-level decisions, agency infrastructure

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
